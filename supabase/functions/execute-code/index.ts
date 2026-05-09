import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestCase { stdin: string; expected_stdout: string; }
interface CaseResult {
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

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
const LANGUAGE_IDS: Record<string, number> = {
  python: 109,
  javascript: 102,
  java: 91,
  cpp: 105,
};

const BodySchema = z.object({
  language: z.enum(["python", "javascript", "java", "cpp"]),
  source_code: z.string().min(1, "Code is required").max(100000, "Code is too large"),
  test_cases: z.array(
    z.object({
      stdin: z.string(),
      expected_stdout: z.string(),
    }),
  ).min(1, "At least one test case is required").max(20, "Too many test cases"),
});

const normalize = (s: string | null | undefined) => (s ?? "").replace(/\s+$/, "");

async function runViaJudge0(language: string, sourceCode: string, stdin: string) {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const resp = await fetch(JUDGE0_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language_id: languageId,
      source_code: sourceCode,
      stdin,
      cpu_time_limit: 2,
      wall_time_limit: 5,
      memory_limit: 131072,
    }),
  });
  if (!resp.ok) throw new Error(`Judge0 ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();

  return {
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? data.message ?? "",
    compile_output: data.compile_output ?? "",
    statusId: data.status?.id ?? 13,
    status: data.status?.description ?? "Runtime Error",
    time: data.time ?? "0",
    memory: data.memory ?? 0,
  };
}

async function runOne(language: string, sourceCode: string, tc: TestCase): Promise<CaseResult> {
  const expected = normalize(tc.expected_stdout);
  const started = Date.now();

  let stdout = "", stderr = "", compile_output = "";
  let statusId = 7;
  let status = "Runtime Error";

  try {
    const r = await runViaJudge0(language, sourceCode, tc.stdin);
    stdout = r.stdout;
    stderr = r.stderr;
    compile_output = r.compile_output;
    statusId = r.statusId;
    status = r.status;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: "Runtime Error", statusId: 7,
      stdout: "", stderr: msg,
      compile_output: "",
      time: ((Date.now() - started) / 1000).toFixed(3), memory: 0, expected, stdin: tc.stdin,
    };
  }

  const stdoutN = normalize(stdout);

  if (statusId === 6 || (compile_output && /error/i.test(compile_output))) {
    return {
      status: "Compilation Error", statusId: 6,
      stdout: stdoutN, stderr, compile_output,
      time: ((Date.now() - started) / 1000).toFixed(3), memory: 0, expected, stdin: tc.stdin,
    };
  }

  if (statusId === 5) {
    return {
      status: "Time Limit Exceeded", statusId: 5,
      stdout: stdoutN, stderr, compile_output: "",
      time: ((Date.now() - started) / 1000).toFixed(3), memory: 0, expected, stdin: tc.stdin,
    };
  }

  if ((statusId >= 7 && statusId <= 12) || (stderr && !stdoutN)) {
    return {
      status: status || "Runtime Error", statusId: 7,
      stdout: stdoutN, stderr, compile_output: "",
      time: ((Date.now() - started) / 1000).toFixed(3), memory: 0, expected, stdin: tc.stdin,
    };
  }

  const passed = stdoutN === expected;
  return {
    status: passed ? "Accepted" : "Wrong Answer",
    statusId: passed ? 3 : 4,
    stdout: stdoutN, stderr, compile_output: "",
    time: ((Date.now() - started) / 1000).toFixed(3), memory: 0, expected, stdin: tc.stdin,
  };
}

function summarize(results: CaseResult[]) {
  const allAccepted = results.every(r => r.statusId === 3);
  let overall: string = "Accepted";
  if (!allAccepted) {
    const f = results.find(r => r.statusId !== 3)!;
    overall = f.statusId === 6 ? "Compilation Error"
      : f.statusId === 5 ? "Time Limit Exceeded"
      : f.statusId === 7 ? "Runtime Error"
      : "Wrong Answer";
  }
  return {
    overall,
    passed: results.filter(r => r.statusId === 3).length,
    total: results.length,
    runtime_ms: Math.max(...results.map(r => Math.round((Number(r.time) || 0) * 1000)), 0),
    memory_kb: 0,
    results,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { language, source_code, test_cases } = parsed.data;

    const results: CaseResult[] = [];
    for (const tc of test_cases) {
      results.push(await runOne(language, source_code, tc));
      await new Promise(r => setTimeout(r, 150));
    }

    return new Response(JSON.stringify(summarize(results)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
