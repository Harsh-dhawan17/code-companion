import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Flame, Calendar, Code, Crown, Sparkles, LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy, zap: Zap, flame: Flame, calendar: Calendar,
  code: Code, crown: Crown, sparkles: Sparkles,
};

const TIER_STYLES: Record<string, string> = {
  bronze: "from-amber-700/20 to-amber-900/10 border-amber-700/40 text-amber-500",
  silver: "from-slate-300/20 to-slate-500/10 border-slate-400/40 text-slate-300",
  gold: "from-warning/30 to-warning/10 border-warning/50 text-warning",
};

interface Achievement {
  id: string; key: string; name: string; description: string;
  icon: string; tier: string; xp_reward: number;
}

export default function Achievements() {
  const { user } = useAuth();
  const [all, setAll] = useState<Achievement[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: catalog }, { data: owned }] = await Promise.all([
        supabase.from("achievements").select("*").order("xp_reward"),
        supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
      ]);
      setAll((catalog as Achievement[]) || []);
      setOwnedIds(new Set((owned || []).map((r: any) => r.achievement_id)));
    })();
  }, [user]);

  const unlockedCount = ownedIds.size;
  const pct = all.length ? Math.round((unlockedCount / all.length) * 100) : 0;

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-warning" /> Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          {unlockedCount} of {all.length} unlocked
        </p>
        <Progress value={pct} className="mt-3 h-2" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {all.map(a => {
          const Icon = ICONS[a.icon] || Trophy;
          const owned = ownedIds.has(a.id);
          const tierClass = TIER_STYLES[a.tier] || TIER_STYLES.bronze;
          return (
            <Card key={a.id} className={`shadow-card overflow-hidden ${owned ? "" : "opacity-60 grayscale"}`}>
              <div className={`bg-gradient-to-br ${tierClass} border-b p-4`}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-background/40 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">{a.name}</p>
                    <p className="text-xs uppercase tracking-wide opacity-80">{a.tier}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <div className="flex items-center justify-between mt-3">
                  {a.xp_reward > 0 && (
                    <span className="text-xs font-semibold text-primary">+{a.xp_reward} XP</span>
                  )}
                  <span className={`text-xs font-semibold ml-auto ${owned ? "text-success" : "text-muted-foreground"}`}>
                    {owned ? "✓ Unlocked" : "Locked"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
