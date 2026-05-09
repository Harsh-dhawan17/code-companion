import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Flame, Trophy, Target, Zap, ArrowRight, CheckCircle2, Sparkles, Map } from "lucide-react";

interface Stats { easy: number; medium: number; hard: number; total: number; }
interface Problem { id: string; number: number; slug: string; title: string; difficulty: "Easy"|"Medium"|"Hard"; topics: string[]; }

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [profile, setProfile] = useState<{ xp: number; current_streak: number; longest_streak: number; username: string | null } | null>(null);
  const [daily, setDaily] = useState<Problem | null>(null);
  const [recent, setRecent] = useState<Problem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: prof }, { data: solved }, { count }, { data: probs }, { data: dc }] = await Promise.all([
        supabase.from("profiles").select("xp, current_streak, longest_streak, username").eq("id", user.id).maybeSingle(),
        supabase.from("user_progress").select("problem_id, problems(difficulty)").eq("user_id", user.id),
        supabase.from("problems").select("*", { count: "exact", head: true }),
        supabase.from("problems").select("id, number, slug, title, difficulty, topics").order("number").limit(8),
        supabase.from("daily_challenges").select("problem_id, problems(id, number, slug, title, difficulty, topics)").eq("challenge_date", today).maybeSingle(),
      ]);
      setProfile(prof);
      setTotalCount(count || 0);
      const s: Stats = { easy: 0, medium: 0, hard: 0, total: 0 };
      const ids = new Set<string>();
      (solved || []).forEach((r: any) => {
        const d = r.problems?.difficulty;
        if (d === "Easy") s.easy++;
        else if (d === "Medium") s.medium++;
        else if (d === "Hard") s.hard++;
        s.total++;
        if (r.problem_id) ids.add(r.problem_id);
      });
      setSolvedIds(ids);
      setStats(s);
      setRecent((probs || []) as Problem[]);
      setDaily(((dc as any)?.problems ?? null) as Problem | null);
    })();
  }, [user]);

  const cards = [
    { label: "Solved", value: stats.total, sub: `of ${totalCount}`, icon: Target, color: "text-primary" },
    { label: "XP", value: profile?.xp ?? 0, sub: "earned", icon: Zap, color: "text-warning" },
    { label: "Streak", value: profile?.current_streak ?? 0, sub: `best ${profile?.longest_streak ?? 0}`, icon: Flame, color: "text-difficulty-hard" },
    { label: "Easy / Med / Hard", value: `${stats.easy}/${stats.medium}/${stats.hard}`, sub: "breakdown", icon: Trophy, color: "text-success" },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{profile?.username ? `, ${profile.username}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Keep your streak going. Crack today's problem.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {daily && (
        <Card className="overflow-hidden border-primary/20 shadow-glow">
          <div className="gradient-primary p-1">
            <div className="bg-card p-6 rounded-md">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide">⭐ Daily Challenge · +50 Bonus XP</p>
                  <h2 className="text-2xl font-bold mt-1">#{daily.number}. {daily.title}</h2>
                  <div className="flex items-center gap-2 mt-3">
                    <DifficultyBadge difficulty={daily.difficulty} />
                    {daily.topics.slice(0, 3).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
                <Button asChild size="lg">
                  <Link to={`/problems/${daily.slug}`}>Solve now <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="overflow-hidden border-warning/30 shadow-card">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-semibold">Interview Prep</p>
                <p className="text-sm text-muted-foreground">130+ FAANG-asked questions, curated.</p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/interview-prep">Start <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/30 shadow-card">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Learning Roadmaps</p>
                <p className="text-sm text-muted-foreground">Topic-wise guided paths with progress.</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/roadmaps">Explore <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Featured Problems</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link to="/problems">View all <ArrowRight className="ml-1 h-3 w-3"/></Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map(p => (
            <Link key={p.id} to={`/problems/${p.slug}`}
              className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {solvedIds.has(p.id) ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <span className="h-4 w-4 shrink-0" />
                )}
                <span className="text-sm text-muted-foreground font-mono w-10">#{p.number}</span>
                <span className="font-medium truncate">{p.title}</span>
              </div>
              <DifficultyBadge difficulty={p.difficulty} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
