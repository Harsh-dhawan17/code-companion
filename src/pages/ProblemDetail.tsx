import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { toast } from "@/hooks/use-toast";
import { executeLocally } from "@/lib/codeRunner";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { ArrowLeft, Play, Send, Loader2, CheckCircle2, XCircle, Lightbulb, BookOpen, Youtube, Sparkles, Bookmark, StickyNote, FlaskConical } from "lucide-react";

interface TestCase { stdin: string; expected_stdout: string; }
interface Problem {
  id: string; number: number; slug: string; title: string;
  difficulty: "Easy"|"Medium"|"Hard"; topics: string[];
  description: string; examples: any[]; constraints: string[]; hints: string[];
  starter_code: Record<string, string>; test_cases: TestCase[];
  companies?: string[]; youtube_query?: string | null;
}
interface Editorial {
  intuition: string; approach: string; complexity: string;
  solutions: Record<string, string>;
}

const LANGS = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];
const MONACO_LANG: Record<string, string> = { python: "python", javascript: "javascript", java: "java", cpp: "cpp" };
const LOCAL_RUN_LANGS = new Set(["python", "javascript"]);
const DRAFT_VERSION = "v2";

export default function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [tab, setTab] = useState("description");
  const [solved, setSolved] = useState(false);
  const [editorial, setEditorial] = useState<Editorial | null>(null);
  const [loadingEditorial, setLoadingEditorial] = useState(false);
  const [solutionLang, setSolutionLang] = useState<string>("python");
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [customStdin, setCustomStdin] = useState<string>("");
  const [customResult, setCustomResult] = useState<any | null>(null);
  const [runningCustom, setRunningCustom] = useState(false);

  const getDraftKey = (lang: string) => `code:${slug}:${lang}:${DRAFT_VERSION}`;

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const today = new Date().toISOString().slice(0, 10);
      const [{ data }, { data: dc }] = await Promise.all([
        supabase.from("problems").select("*").eq("slug", slug).maybeSingle(),
        supabase.from("daily_challenges").select("problem_id").eq("challenge_date", today).maybeSingle(),
      ]);
      setProblem(data as any);
      if (data) {
        const starter = (data.starter_code as any)?.[language] || "";
        const saved = localStorage.getItem(getDraftKey(language));
        setCode(saved || starter);
        setIsDailyChallenge(!!dc && (dc as any).problem_id === (data as any).id);
      }
      if (user && data) {
        const [{ data: pr }, { data: bm }] = await Promise.all([
          supabase.from("user_progress").select("id, notes").eq("user_id", user.id).eq("problem_id", (data as any).id).maybeSingle(),
          supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("problem_id", (data as any).id).maybeSingle(),
        ]);
        setSolved(!!pr);
        setNotes((pr as any)?.notes || "");
        setBookmarked(!!bm);
      }
    })();
  }, [slug, user]);

  const toggleBookmark = async () => {
    if (!user || !problem) return;
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("problem_id", problem.id);
      setBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      const { error } = await supabase.from("bookmarks").insert({ user_id: user.id, problem_id: problem.id });
      if (!error) { setBookmarked(true); toast({ title: "Bookmarked!" }); }
    }
  };

  const saveNotes = async () => {
    if (!user || !problem) return;
    setSavingNotes(true);
    const { error } = await supabase.from("user_progress").upsert(
      { user_id: user.id, problem_id: problem.id, notes },
      { onConflict: "user_id,problem_id" }
    );
    setSavingNotes(false);
    if (error) toast({ title: "Couldn't save notes", description: error.message, variant: "destructive" });
    else toast({ title: "Notes saved" });
  };

  const runCustom = async () => {
    if (!problem) return;
    setRunningCustom(true);
    setCustomResult(null);
    try {
      const tests = [{ stdin: customStdin, expected_stdout: "" }];
      let data: any;
      if (LOCAL_RUN_LANGS.has(language)) {
        data = await executeLocally(language, code, tests);
      } else {
        const { data: res, error } = await supabase.functions.invoke("execute-code", {
          body: { language, source_code: code, test_cases: tests },
        });
        if (error) throw new Error(error.message);
        if (res?.error) throw new Error(res.error);
        data = res;
      }
      setCustomResult(data.results?.[0] || null);
      setTab("custom");
    } catch (e: any) {
      toast({ title: "Run failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setRunningCustom(false);
    }
  };

  const loadEditorial = async () => {
    if (editorial || loadingEditorial || !slug) return;
    setLoadingEditorial(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-editorial", { body: { slug } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setEditorial(data);
    } catch (e: any) {
      toast({ title: "Couldn't load solution", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoadingEditorial(false);
    }
  };

  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(getDraftKey(language));
    setCode(saved || (problem.starter_code as any)[language] || "");
  }, [language, problem, slug]);

  useEffect(() => {
    if (slug) localStorage.setItem(getDraftKey(language), code);
  }, [code, slug, language]);

  const visibleTestCases = useMemo(() => problem?.test_cases?.slice(0, 2) || [], [problem]);

  const execute = async (allTests: boolean) => {
    if (!problem) return;
    const tests = allTests ? problem.test_cases : visibleTestCases;
    setResults(null);
    if (allTests) setSubmitting(true); else setRunning(true);
    try {
      let data: any;
      if (LOCAL_RUN_LANGS.has(language)) {
        data = await executeLocally(language, code, tests);
      } else {
        const { data: res, error } = await supabase.functions.invoke("execute-code", {
          body: { language, source_code: code, test_cases: tests },
        });
        if (error) throw new Error(error.message);
        if (res?.error) throw new Error(res.error);
        data = res;
      }
      setResults(data);
      setTab("result");

      if (allTests) {
        const status = data.overall;
          const { error: submissionError } = await supabase.from("submissions").insert({
          user_id: user!.id, problem_id: problem.id, language, code,
          status, runtime_ms: data.runtime_ms, memory_kb: data.memory_kb,
          passed_count: data.passed, total_count: data.total,
          error_message: status === "Accepted" ? null : (data.results?.find((r: any) => r.statusId !== 3)?.stderr || null),
        });
          if (submissionError) throw submissionError;

        if (status === "Accepted" && !solved) {
            const { error: progressError } = await supabase.from("user_progress").upsert(
              { user_id: user!.id, problem_id: problem.id },
              { onConflict: "user_id,problem_id" },
            );
            if (progressError) throw progressError;

          const baseXp = problem.difficulty === "Easy" ? 10 : problem.difficulty === "Medium" ? 25 : 50;
          const xpGain = isDailyChallenge ? baseXp + 50 : baseXp;
          const today = new Date().toISOString().slice(0, 10);
          const { data: prof } = await supabase.from("profiles").select("xp, current_streak, longest_streak, last_solved_date").eq("id", user!.id).maybeSingle();
          if (prof) {
            const last = prof.last_solved_date;
            let streak = prof.current_streak || 0;
            if (last === today) {
              // already counted today
            } else {
              const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
              streak = last === y ? streak + 1 : 1;
            }
            await supabase.from("profiles").update({
              xp: (prof.xp || 0) + xpGain,
              current_streak: streak,
              longest_streak: Math.max(prof.longest_streak || 0, streak),
              last_solved_date: today,
            }).eq("id", user!.id);
          }
          setSolved(true);
          toast({ title: "Accepted! 🎉", description: `+${xpGain} XP earned` });
          // Check achievements (fires its own toasts on unlock)
          checkAndAwardAchievements(user!.id).catch(() => {});
        } else if (status === "Accepted") {
          toast({ title: "Accepted! 🎉", description: `${data.passed}/${data.total} test cases passed` });
        } else {
          toast({ title: status, description: `${data.passed}/${data.total} test cases passed`, variant: "destructive" });
        }
      }
    } catch (e: any) {
      toast({ title: "Execution failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setRunning(false); setSubmitting(false);
    }
  };

  if (!problem) {
    return <div className="container py-8"><Loader2 className="h-6 w-6 animate-spin"/></div>;
  }

  return (
    <div className="container py-4">
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/problems"><ArrowLeft className="h-4 w-4 mr-1"/> Back</Link></Button>
      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-10rem)]">
        {/* LEFT: description / hints / result */}
        <Card className="overflow-hidden flex flex-col shadow-card">
          <div className="px-5 py-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold">#{problem.number}. {problem.title}</h1>
                  {solved && <span className="inline-flex items-center gap-1 text-xs text-success font-semibold"><CheckCircle2 className="h-3.5 w-3.5"/>Solved</span>}
                  {isDailyChallenge && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">⭐ Daily · +50 XP</span>}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.topics.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
                </div>
                {problem.companies && problem.companies.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Asked at:</span>
                    {problem.companies.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-background font-medium">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant={bookmarked ? "default" : "outline"}
                size="icon"
                onClick={toggleBookmark}
                title={bookmarked ? "Remove bookmark" : "Bookmark this problem"}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="m-3 self-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="hints"><Lightbulb className="h-3.5 w-3.5 mr-1"/>Hints</TabsTrigger>
              <TabsTrigger value="solution" onClick={loadEditorial}><BookOpen className="h-3.5 w-3.5 mr-1"/>Solution</TabsTrigger>
              <TabsTrigger value="notes"><StickyNote className="h-3.5 w-3.5 mr-1"/>Notes</TabsTrigger>
              <TabsTrigger value="custom"><FlaskConical className="h-3.5 w-3.5 mr-1"/>Custom Test</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>
              {problem.examples?.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold">Examples</h3>
                  {problem.examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p><span className="font-semibold">Input:</span> <code>{ex.input}</code></p>
                      <p><span className="font-semibold">Output:</span> <code>{ex.output}</code></p>
                      {ex.explanation && <p className="text-muted-foreground mt-1">{ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
              {problem.constraints?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="hints" className="flex-1 overflow-auto px-5 pb-5 mt-0 space-y-3">
              {problem.hints?.length === 0 && <p className="text-muted-foreground text-sm">No hints for this problem.</p>}
              {problem.hints?.map((h, i) => (
                <details key={i} className="border rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-sm">Hint {i + 1}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{h}</p>
                </details>
              ))}
            </TabsContent>

            <TabsContent value="solution" className="flex-1 overflow-auto px-5 pb-5 mt-0 space-y-4">
              {loadingEditorial && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin"/> Generating editorial with AI…
                </div>
              )}
              {!loadingEditorial && !editorial && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Get an AI-written walkthrough: intuition, optimal approach, complexity analysis, and full solutions in 4 languages.</p>
                  <Button size="sm" onClick={loadEditorial}><Sparkles className="h-3.5 w-3.5 mr-1"/>Generate Solution</Button>
                </div>
              )}
              {editorial && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">💡 Intuition</h3>
                    <p className="text-sm text-muted-foreground">{editorial.intuition}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">🛠 Approach</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{editorial.approach}</ReactMarkdown>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">⏱ Complexity</h3>
                    <p className="text-sm text-muted-foreground">{editorial.complexity}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">📝 Solution</h3>
                      <Select value={solutionLang} onValueChange={setSolutionLang}>
                        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {LANGS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-auto max-h-96"><code>{editorial.solutions?.[solutionLang] || "(not available)"}</code></pre>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                      setLanguage(solutionLang);
                      setCode(editorial.solutions?.[solutionLang] || "");
                      toast({ title: "Loaded into editor", description: "You can run this directly." });
                    }}>Load into editor</Button>
                  </div>
                  {problem.youtube_query && (
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(problem.youtube_query)}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <Youtube className="h-4 w-4"/> Watch video walkthroughs
                    </a>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="result" className="flex-1 overflow-auto px-5 pb-5 mt-0">
              {!results && <p className="text-muted-foreground text-sm">Run or submit your code to see results.</p>}
              {results && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${results.overall === "Accepted" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <p className={`font-bold ${results.overall === "Accepted" ? "text-success" : "text-destructive"}`}>
                      {results.overall === "Accepted" ? <><CheckCircle2 className="inline h-4 w-4 mr-1"/>Accepted</> : <><XCircle className="inline h-4 w-4 mr-1"/>{results.overall}</>}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {results.passed}/{results.total} test cases passed · {results.runtime_ms}ms · {results.memory_kb}KB
                    </p>
                  </div>
                  {results.results?.map((r: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Test case {i + 1}</span>
                        {r.statusId === 3
                          ? <span className="text-success text-xs"><CheckCircle2 className="inline h-3 w-3 mr-1"/>Passed</span>
                          : <span className="text-destructive text-xs"><XCircle className="inline h-3 w-3 mr-1"/>{r.status}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">Input:</p>
                      <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{r.stdin || "(empty)"}</pre>
                      <p className="text-xs text-muted-foreground mt-2">Expected:</p>
                      <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{r.expected}</pre>
                      <p className="text-xs text-muted-foreground mt-2">Your output:</p>
                      <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{r.stdout || "(empty)"}</pre>
                      {r.stderr && <><p className="text-xs text-destructive mt-2">stderr:</p><pre className="bg-destructive/5 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{r.stderr}</pre></>}
                      {r.compile_output && <><p className="text-xs text-destructive mt-2">Compile error:</p><pre className="bg-destructive/5 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{r.compile_output}</pre></>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="flex-1 overflow-auto px-5 pb-5 mt-0 space-y-3">
              <p className="text-sm text-muted-foreground">Jot down patterns, tricks, or "why my first attempt failed". Notes are private.</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Use a hash map of complement → index. Watch for duplicates..."
                className="min-h-[200px] font-mono text-sm"
              />
              <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <StickyNote className="h-3.5 w-3.5 mr-1"/>}
                Save notes
              </Button>
            </TabsContent>

            <TabsContent value="custom" className="flex-1 overflow-auto px-5 pb-5 mt-0 space-y-3">
              <p className="text-sm text-muted-foreground">Run your code against your own input. Useful for debugging tricky edge cases.</p>
              <div>
                <p className="text-xs font-semibold mb-1">Custom stdin</p>
                <Textarea
                  value={customStdin}
                  onChange={(e) => setCustomStdin(e.target.value)}
                  placeholder={problem.test_cases?.[0]?.stdin || "Enter your input here..."}
                  className="min-h-[120px] font-mono text-xs"
                />
              </div>
              <Button size="sm" onClick={runCustom} disabled={runningCustom}>
                {runningCustom ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Play className="h-3.5 w-3.5 mr-1"/>}
                Run with custom input
              </Button>
              {customResult && (
                <div className="border rounded-lg p-3 text-sm space-y-2">
                  <p className="text-xs text-muted-foreground">Output:</p>
                  <pre className="bg-muted/50 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{customResult.stdout || "(empty)"}</pre>
                  {customResult.stderr && <><p className="text-xs text-destructive">stderr:</p><pre className="bg-destructive/5 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{customResult.stderr}</pre></>}
                  {customResult.compile_output && <><p className="text-xs text-destructive">Compile error:</p><pre className="bg-destructive/5 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">{customResult.compile_output}</pre></>}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* RIGHT: editor */}
        <Card className="overflow-hidden flex flex-col shadow-card">
          <div className="flex items-center justify-between px-3 py-2 border-b gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => execute(false)} disabled={running || submitting}>
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Play className="h-3.5 w-3.5 mr-1"/>}Run
              </Button>
              <Button size="sm" onClick={() => execute(true)} disabled={running || submitting}>
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Send className="h-3.5 w-3.5 mr-1"/>}Submit
              </Button>
            </div>
          </div>
          {!LOCAL_RUN_LANGS.has(language) && (
            <div className="border-b px-3 py-2 text-xs text-muted-foreground">
              {language === "java" ? "Java" : "C++"} runs on a free remote sandbox — execution may take a few seconds per test.
            </div>
          )}
          <div className="flex-1">
            <Editor
              height="100%"
              language={MONACO_LANG[language]}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 2 }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
