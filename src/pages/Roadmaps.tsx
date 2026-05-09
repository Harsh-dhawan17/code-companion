import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ROADMAPS } from "@/data/roadmaps";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface ProblemRow {
  id: string; slug: string; number: number; title: string;
  difficulty: "Easy"|"Medium"|"Hard";
}

export default function Roadmaps() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Record<string, ProblemRow>>({});
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const allSlugs = Array.from(new Set(ROADMAPS.flatMap(r => r.stages.flatMap(s => s.slugs))));
      const { data } = await supabase
        .from("problems")
        .select("id, slug, number, title, difficulty")
        .in("slug", allSlugs);
      const map: Record<string, ProblemRow> = {};
      (data || []).forEach((p: any) => { map[p.slug] = p; });
      setProblems(map);

      if (user) {
        const ids = Object.values(map).map(p => p.id);
        if (ids.length) {
          const { data: progress } = await supabase
            .from("user_progress")
            .select("problem_id")
            .eq("user_id", user.id)
            .in("problem_id", ids);
          const solvedIds = new Set((progress || []).map((p: any) => p.problem_id));
          const slugs = new Set<string>();
          Object.values(map).forEach(p => { if (solvedIds.has(p.id)) slugs.add(p.slug); });
          setSolvedSlugs(slugs);
        }
      }
    })();
  }, [user]);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Roadmaps</h1>
        <p className="text-muted-foreground mt-1">
          Topic-wise paths from beginner to interview-ready. Solve each stage in order for maximum carry-over.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {ROADMAPS.map(roadmap => {
          const allSlugs = roadmap.stages.flatMap(s => s.slugs).filter(s => problems[s]);
          const total = allSlugs.length;
          const done = allSlugs.filter(s => solvedSlugs.has(s)).length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              problems={problems}
              solvedSlugs={solvedSlugs}
              done={done}
              total={total}
              pct={pct}
            />
          );
        })}
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap, problems, solvedSlugs, done, total, pct }: any) {
  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{roadmap.emoji}</span> {roadmap.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{roadmap.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className="text-xs text-muted-foreground">{done}/{total}</p>
          </div>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {roadmap.stages.map((stage: any, idx: number) => (
          <div key={idx}>
            <p className="text-sm font-semibold mb-1">{idx + 1}. {stage.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{stage.description}</p>
            <div className="space-y-1">
              {stage.slugs.map((slug: string) => {
                const p = problems[slug];
                if (!p) return null;
                const solved = solvedSlugs.has(slug);
                return (
                  <Link key={slug} to={`/problems/${slug}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {solved
                        ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="truncate">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DifficultyBadge difficulty={p.difficulty} />
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
