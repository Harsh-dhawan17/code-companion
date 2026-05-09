import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Card } from "@/components/ui/card";
import { Search, CheckCircle2, Circle } from "lucide-react";

interface Problem {
  id: string; number: number; slug: string; title: string;
  difficulty: "Easy"|"Medium"|"Hard"; topics: string[]; acceptance: number;
  companies?: string[];
}

const DIFFS = ["All", "Easy", "Medium", "Hard"] as const;

export default function Problems() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("All");
  const [topic, setTopic] = useState<string>("All");
  const [company, setCompany] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("problems").select("id, number, slug, title, difficulty, topics, acceptance, companies").order("number");
      setProblems((data || []) as Problem[]);
      if (user) {
        const { data: pr } = await supabase.from("user_progress").select("problem_id").eq("user_id", user.id);
        setSolved(new Set((pr || []).map((r: any) => r.problem_id)));
      }
      setLoading(false);
    })();
  }, [user]);

  const topics = useMemo(() => {
    const s = new Set<string>();
    problems.forEach(p => p.topics.forEach(t => s.add(t)));
    return ["All", ...Array.from(s).sort()];
  }, [problems]);

  const companies = useMemo(() => {
    const s = new Set<string>();
    problems.forEach(p => (p.companies || []).forEach(c => s.add(c)));
    return ["All", ...Array.from(s).sort()];
  }, [problems]);

  const filtered = useMemo(() => problems.filter(p => {
    if (diff !== "All" && p.difficulty !== diff) return false;
    if (topic !== "All" && !p.topics.includes(topic)) return false;
    if (company !== "All" && !(p.companies || []).includes(company)) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !String(p.number).includes(search)) return false;
    return true;
  }), [problems, diff, topic, company, search]);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
        <p className="text-muted-foreground mt-1">{problems.length} problems · {solved.size} solved</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by title or number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFS.map(d => (
            <Button key={d} size="sm" variant={diff === d ? "default" : "outline"} onClick={() => setDiff(d)}>{d}</Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                topic === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"
              }`}>{t}</button>
          ))}
        </div>
        {companies.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Company:</span>
            {companies.map(c => (
              <button key={c} onClick={() => setCompany(c)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  company === c ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:bg-accent"
                }`}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="grid grid-cols-[40px_60px_1fr_auto_auto] gap-3 px-4 py-3 text-xs font-semibold text-muted-foreground border-b">
          <span></span><span>#</span><span>Title</span><span>Difficulty</span><span className="hidden sm:inline">Acceptance</span>
        </div>
        {loading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
        {!loading && filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No problems match your filters.</div>}
        {filtered.map(p => (
          <Link key={p.id} to={`/problems/${p.slug}`}
            className="grid grid-cols-[40px_60px_1fr_auto_auto] gap-3 px-4 py-3 items-center border-b last:border-b-0 hover:bg-accent/50 transition-colors">
            {solved.has(p.id) ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm text-muted-foreground font-mono">{p.number}</span>
            <div className="min-w-0">
              <p className="font-medium truncate">{p.title}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.topics.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
            <DifficultyBadge difficulty={p.difficulty} />
            <span className="hidden sm:inline text-sm text-muted-foreground">{Number(p.acceptance).toFixed(0)}%</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
