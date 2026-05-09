import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Link } from "react-router-dom";
import { Flame, Trophy, Zap, Calendar } from "lucide-react";
import StreakHeatmap from "@/components/StreakHeatmap";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: subs }, { data: solved }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("submissions").select("id, status, language, created_at, problems(slug, title, difficulty)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("user_progress").select("problems(difficulty)").eq("user_id", user.id),
      ]);
      setProfile(prof);
      setSubmissions(subs || []);
      const s = { easy: 0, medium: 0, hard: 0 };
      (solved || []).forEach((r: any) => {
        const d = r.problems?.difficulty;
        if (d === "Easy") s.easy++;
        else if (d === "Medium") s.medium++;
        else if (d === "Hard") s.hard++;
      });
      setStats(s);
    })();
  }, [user]);

  const initials = (profile?.username || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <Card className="shadow-card overflow-hidden">
        <div className="gradient-primary h-24" />
        <CardContent className="pt-0 -mt-12">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-card">
              <AvatarFallback className="text-2xl gradient-primary text-primary-foreground font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h1 className="text-2xl font-bold">{profile?.username || "User"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Stat icon={Zap} label="Total XP" value={profile?.xp ?? 0} />
            <Stat icon={Flame} label="Current Streak" value={profile?.current_streak ?? 0} />
            <Stat icon={Trophy} label="Best Streak" value={profile?.longest_streak ?? 0} />
            <Stat icon={Calendar} label="Last Solved" value={profile?.last_solved_date || "—"} />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <DiffCard label="Easy" count={stats.easy} color="text-difficulty-easy" />
        <DiffCard label="Medium" count={stats.medium} color="text-difficulty-medium" />
        <DiffCard label="Hard" count={stats.hard} color="text-difficulty-hard" />
      </div>

      {user && (
        <Card className="shadow-card">
          <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
          <CardContent><StreakHeatmap userId={user.id} /></CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet. Time to crack some problems!</p>}
          {submissions.map(s => (
            <Link key={s.id} to={`/problems/${s.problems?.slug}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="min-w-0">
                <p className="font-medium truncate">{s.problems?.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()} · {s.language}</p>
              </div>
              <div className="flex items-center gap-2">
                {s.problems?.difficulty && <DifficultyBadge difficulty={s.problems.difficulty} />}
                <span className={`text-xs font-semibold px-2 py-1 rounded ${s.status === "Accepted" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {s.status}
                </span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className="h-3.5 w-3.5"/>{label}
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
function DiffCard({ label, count, color }: any) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-3xl font-bold mt-2">{count}</p>
        <p className="text-xs text-muted-foreground">solved</p>
      </CardContent>
    </Card>
  );
}
