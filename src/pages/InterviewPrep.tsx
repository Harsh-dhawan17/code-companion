import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { PREP_CATEGORIES, TOTAL_PREP_QUESTIONS, PrepQuestion } from "@/data/interviewPrep";
import { CheckCircle2, Circle, ExternalLink, Search, Trophy, Sparkles, Code2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;

function leetcodeUrl(q: PrepQuestion) {
  const slug = q.leetcodeSlug || slugify(q.title);
  return `https://leetcode.com/problems/${slug}/`;
}
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function InterviewPrep() {
  const { user } = useAuth();
  const [slugToId, setSlugToId] = useState<Record<string, string>>({});
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("All");
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data: probs } = await supabase.from("problems").select("id, slug");
      const map: Record<string, string> = {};
      (probs || []).forEach((p: any) => (map[p.slug] = p.id));
      setSlugToId(map);

      if (user) {
        const { data: pr } = await supabase.from("user_progress").select("problem_id").eq("user_id", user.id);
        setSolvedIds(new Set((pr || []).map((r: any) => r.problem_id)));
      }
    })();
  }, [user]);

  const hasInternal = (q: PrepQuestion) => !!(q.slug && slugToId[q.slug]);
  const isSolved = (q: PrepQuestion) => !!(q.slug && slugToId[q.slug] && solvedIds.has(slugToId[q.slug]));

  const filteredCategories = useMemo(() => {
    return PREP_CATEGORIES.filter(c => activeCat === "All" || c.name === activeCat).map(c => ({
      ...c,
      questions: c.questions.filter(q => {
        if (diff !== "All" && q.difficulty !== diff) return false;
        if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    })).filter(c => c.questions.length > 0);
  }, [activeCat, diff, search]);

  const solvedCount = useMemo(() => {
    let n = 0;
    PREP_CATEGORIES.forEach(c => c.questions.forEach(q => { if (isSolved(q)) n++; }));
    return n;
  }, [slugToId, solvedIds]);

  const internalCount = useMemo(() => {
    let n = 0;
    PREP_CATEGORIES.forEach(c => c.questions.forEach(q => { if (hasInternal(q)) n++; }));
    return n;
  }, [slugToId]);

  const pct = Math.round((solvedCount / TOTAL_PREP_QUESTIONS) * 100);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wide">
            <Sparkles className="h-4 w-4" /> Interview Prep
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Top {TOTAL_PREP_QUESTIONS}+ DSA Interview Questions</h1>
          <p className="text-muted-foreground mt-1">
            Curated from Blind 75, NeetCode 150, and Striver's SDE sheet. Solve <strong>{internalCount}</strong> of them right here in the editor — or open any question on LeetCode.
          </p>
        </div>
        <Card className="shadow-card sm:min-w-[260px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-warning" /> Your Progress
              </span>
              <span className="text-sm font-semibold">{solvedCount} / {TOTAL_PREP_QUESTIONS}</span>
            </div>
            <Progress value={pct} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFS.map(d => (
            <Button key={d} size="sm" variant={diff === d ? "default" : "outline"} onClick={() => setDiff(d)}>{d}</Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveCat("All")}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeCat === "All" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"
            }`}>All Topics</button>
          {PREP_CATEGORIES.map(c => (
            <button key={c.name} onClick={() => setActiveCat(c.name)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeCat === c.name ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"
              }`}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>

      {filteredCategories.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No questions match your filters.</CardContent></Card>
      )}

      {filteredCategories.map(cat => {
        const catSolved = cat.questions.filter(isSolved).length;
        return (
          <Card key={cat.name} className="shadow-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-xl">{cat.emoji} {cat.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{catSolved} / {cat.questions.length} solved</span>
              </div>
              <CardDescription>{cat.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {cat.questions.map((q, i) => {
                const solved = isSolved(q);
                const internal = hasInternal(q);
                const lcHref = leetcodeUrl(q);
                return (
                  <div key={`${cat.name}-${i}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 border-t hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {solved ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="font-medium truncate">{q.title}</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {internal ? (
                        <Button asChild size="sm" variant="default" className="h-8">
                          <Link to={`/problems/${q.slug}`}>
                            <Code2 className="h-3.5 w-3.5 mr-1" /> Solve Here
                          </Link>
                        </Button>
                      ) : (
                        <span className="hidden sm:inline text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                      <Button asChild size="sm" variant="outline" className="h-8">
                        <a href={lcHref} target="_blank" rel="noreferrer">
                          LeetCode <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
