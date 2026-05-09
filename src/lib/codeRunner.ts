declare global {
  interface Window {
    Sk: any;
    SkBuiltinFiles: { files: Record<string, string> };
  }
}

export interface RunnerTestCase {
  stdin: string;
  expected_stdout: string;
}

export interface RunnerCaseResult {
  status: string;
  statusId: number;
  stdout: string;
  stderr: string;
  compile_output: string;
  time: string;
  memory: number;
  expected: string;
  stdin: string;
}

export interface RunnerSummary {
  overall: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Compilation Error";
  passed: number;
  total: number;
  runtime_ms: number;
  memory_kb: number;
  results: RunnerCaseResult[];
}

const PYTHON_RUNTIME_URL = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js";
const PYTHON_STDLIB_URL = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js";
const JS_EXEC_TIMEOUT_MS = 2000;
const PY_EXEC_TIMEOUT_MS = 2000;

let pythonRuntimePromise: Promise<any> | null = null;

const normalize = (value: string | null | undefined) => (value ?? "").replace(/\s+$/, "");

function getOverall(results: RunnerCaseResult[]): RunnerSummary["overall"] {
  if (results.every((result) => result.statusId === 3)) return "Accepted";

  const firstFailed = results.find((result) => result.statusId !== 3);
  if (!firstFailed) return "Accepted";
  if (firstFailed.statusId === 6) return "Compilation Error";
  if (firstFailed.statusId === 5) return "Time Limit Exceeded";
  if (firstFailed.statusId >= 7 && firstFailed.statusId <= 12) return "Runtime Error";
  return "Wrong Answer";
}

function summarize(results: RunnerCaseResult[]): RunnerSummary {
  return {
    overall: getOverall(results),
    passed: results.filter((result) => result.statusId === 3).length,
    total: results.length,
    runtime_ms: Math.max(...results.map((result) => Math.round((Number(result.time) || 0) * 1000)), 0),
    memory_kb: Math.max(...results.map((result) => result.memory || 0), 0),
    results,
  };
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-runner-src="${src}"]`) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.runnerSrc = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function ensurePythonRuntime() {
  if (!pythonRuntimePromise) {
    pythonRuntimePromise = (async () => {
      await loadScript(PYTHON_RUNTIME_URL);
      await loadScript(PYTHON_STDLIB_URL);

      const runtime = window.Sk;
      const builtinFiles = window.SkBuiltinFiles || runtime?.builtinFiles;
      if (!runtime || !builtinFiles?.files) {
        throw new Error("Python runner failed to load");
      }

      runtime.builtinFiles = builtinFiles;
      return runtime;
    })();
  }

  return pythonRuntimePromise;
}

function createJavaScriptWorkerSource(code: string, stdin: string) {
  return `
    const stdin = ${JSON.stringify(stdin)};
    let stdout = "";
    const print = (...args) => {
      stdout += args.map((arg) => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ') + "\\n";
    };
    const fs = {
      readFileSync(fd) {
        if (fd !== 0) throw new Error('Only stdin is supported');
        return stdin;
      }
    };
    const processObj = {
      exit(code = 0) {
        throw { __exit: true, code };
      }
    };
    const require = (name) => {
      if (name === 'fs') return fs;
      throw new Error('Unsupported module: ' + name);
    };

    (async () => {
      try {
        const fn = new Function('require', 'process', 'console', ${JSON.stringify(code)});
        fn(require, processObj, { log: (...args) => print(...args), error: (...args) => print(...args) });
        self.postMessage({ ok: true, stdout });
      } catch (error) {
        if (error && error.__exit) {
          self.postMessage({ ok: true, stdout });
          return;
        }
        self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error), stdout });
      }
    })();
  `;
}

async function runJavaScript(code: string, stdin: string) {
  const source = createJavaScriptWorkerSource(code, stdin);
  const blob = new Blob([source], { type: "application/javascript" });
  const workerUrl = URL.createObjectURL(blob);

  try {
    const result = await new Promise<{ stdout: string; stderr: string; statusId: number; status: string }>((resolve) => {
      const worker = new Worker(workerUrl);
      const timer = window.setTimeout(() => {
        worker.terminate();
        resolve({ stdout: "", stderr: "Execution timed out", statusId: 5, status: "Time Limit Exceeded" });
      }, JS_EXEC_TIMEOUT_MS);

      worker.onmessage = (event) => {
        window.clearTimeout(timer);
        worker.terminate();
        if (event.data?.ok) {
          resolve({ stdout: normalize(event.data.stdout), stderr: "", statusId: 3, status: "Accepted" });
          return;
        }

        resolve({
          stdout: normalize(event.data?.stdout),
          stderr: event.data?.error || "Runtime Error",
          statusId: 7,
          status: "Runtime Error",
        });
      };

      worker.onerror = (event) => {
        window.clearTimeout(timer);
        worker.terminate();
        resolve({ stdout: "", stderr: event.message || "Runtime Error", statusId: 7, status: "Runtime Error" });
      };
    });

    return result;
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
}

async function runPython(code: string, stdin: string) {
  const Sk = await ensurePythonRuntime();
  let output = "";
  let cursor = 0;
  const lines = stdin.split(/\r?\n/);
  const wrappedCode = [
    "import sys",
    "import StringIO",
    `sys.stdin = StringIO.StringIO(${JSON.stringify(stdin)})`,
    code,
  ].join("\n");

  try {
    Sk.configure({
      output: (text: string) => {
        output += text;
      },
      read: (file: string) => {
        if (!Sk.builtinFiles?.files?.[file]) {
          throw new Error(`File not found: ${file}`);
        }
        return Sk.builtinFiles.files[file];
      },
      inputfunTakesPrompt: true,
      inputfun: () => {
        const value = cursor < lines.length ? lines[cursor] : "";
        cursor += 1;
        return value;
      },
      __future__: Sk.python3,
      execLimit: PY_EXEC_TIMEOUT_MS,
    });

    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("__main__", false, wrappedCode, true));
    return { stdout: normalize(output), stderr: "", statusId: 3, status: "Accepted" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isTimeout = /time limit|execution timed out|TimeLimitError/i.test(message);
    return {
      stdout: normalize(output),
      stderr: message,
      statusId: isTimeout ? 5 : 7,
      status: isTimeout ? "Time Limit Exceeded" : "Runtime Error",
    };
  }
}

async function runSingle(language: string, sourceCode: string, testCase: RunnerTestCase): Promise<RunnerCaseResult> {
  const started = performance.now();
  const expected = normalize(testCase.expected_stdout);

  const execution = language === "python"
    ? await runPython(sourceCode, testCase.stdin)
    : await runJavaScript(sourceCode, testCase.stdin);

  let status = execution.status;
  let statusId = execution.statusId;
  if (statusId === 3 && normalize(execution.stdout) !== expected) {
    status = "Wrong Answer";
    statusId = 4;
  }

  return {
    status,
    statusId,
    stdout: normalize(execution.stdout),
    stderr: execution.stderr,
    compile_output: "",
    time: ((performance.now() - started) / 1000).toFixed(3),
    memory: 0,
    expected,
    stdin: testCase.stdin,
  };
}

export async function executeLocally(language: string, sourceCode: string, testCases: RunnerTestCase[]): Promise<RunnerSummary> {
  if (!sourceCode.trim()) {
    throw new Error("Code is empty");
  }

  if (!["python", "javascript"].includes(language)) {
    throw new Error("Free local execution is available for Python and JavaScript right now.");
  }

  const results: RunnerCaseResult[] = [];
  for (const testCase of testCases) {
    results.push(await runSingle(language, sourceCode, testCase));
  }

  return summarize(results);
}