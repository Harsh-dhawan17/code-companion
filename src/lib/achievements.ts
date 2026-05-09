import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  xp_reward: number;
  criteria: any;
}

interface UserStats {
  totalSolved: number;
  byDifficulty: { Easy: number; Medium: number; Hard: number };
  streak: number;
  xp: number;
  dailyCount: number;
  languages: number;
}

async function loadUserStats(userId: string): Promise<UserStats> {
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: prof }, { data: solved }, { data: subs }, { data: dailies }] = await Promise.all([
    supabase.from("profiles").select("xp, current_streak").eq("id", userId).maybeSingle(),
    supabase.from("user_progress").select("problems(difficulty)").eq("user_id", userId),
    supabase.from("submissions").select("language, status").eq("user_id", userId).eq("status", "Accepted"),
    supabase.from("daily_challenges").select("problem_id, challenge_date").lte("challenge_date", today),
  ]);

  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  (solved || []).forEach((r: any) => {
    const d = r.problems?.difficulty;
    if (d && byDiff[d as keyof typeof byDiff] !== undefined) byDiff[d as keyof typeof byDiff]++;
  });
  const langs = new Set((subs || []).map((s: any) => s.language));

  // Count solved daily-challenge problems
  const { data: solvedRows } = await supabase.from("user_progress").select("problem_id").eq("user_id", userId);
  const solvedSet = new Set((solvedRows || []).map((r: any) => r.problem_id));
  const dailyCount = (dailies || []).filter((d: any) => solvedSet.has(d.problem_id)).length;

  return {
    totalSolved: solved?.length || 0,
    byDifficulty: byDiff,
    streak: prof?.current_streak || 0,
    xp: prof?.xp || 0,
    dailyCount,
    languages: langs.size,
  };
}

function meetsCriteria(criteria: any, stats: UserStats): boolean {
  switch (criteria.type) {
    case "solve_count": return stats.totalSolved >= criteria.count;
    case "difficulty": return stats.byDifficulty[criteria.difficulty as keyof typeof stats.byDifficulty] >= criteria.count;
    case "streak": return stats.streak >= criteria.days;
    case "xp": return stats.xp >= criteria.amount;
    case "daily_count": return stats.dailyCount >= criteria.count;
    case "languages": return stats.languages >= criteria.count;
    default: return false;
  }
}

/** Check & award newly-earned achievements. Returns array of newly unlocked ones. */
export async function checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
  const [{ data: catalog }, { data: owned }] = await Promise.all([
    supabase.from("achievements").select("*"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);
  if (!catalog) return [];
  const ownedIds = new Set((owned || []).map((r: any) => r.achievement_id));
  const candidates = catalog.filter((a: any) => !ownedIds.has(a.id));
  if (candidates.length === 0) return [];

  const stats = await loadUserStats(userId);
  const newlyUnlocked: Achievement[] = [];
  let bonusXp = 0;

  for (const ach of candidates) {
    if (meetsCriteria(ach.criteria, stats)) {
      const { error } = await supabase.from("user_achievements").insert({ user_id: userId, achievement_id: ach.id });
      if (!error) {
        newlyUnlocked.push(ach as Achievement);
        bonusXp += ach.xp_reward || 0;
      }
    }
  }

  if (bonusXp > 0) {
    const { data: prof } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
    await supabase.from("profiles").update({ xp: (prof?.xp || 0) + bonusXp }).eq("id", userId);
  }

  newlyUnlocked.forEach(a => {
    toast({
      title: `🏆 Achievement Unlocked: ${a.name}`,
      description: `${a.description}${a.xp_reward ? ` · +${a.xp_reward} XP` : ""}`,
    });
  });

  return newlyUnlocked;
}
