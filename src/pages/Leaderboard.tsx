import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Flame, Medal } from "lucide-react";

interface Row {
  id: string;
  username: string | null;
  xp: number;
  current_streak: number;
  longest_streak: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState("xp");

  useEffect(() => {
    const order = tab === "xp" ? "xp" : tab === "streak" ? "current_streak" : "longest_streak";
    supabase
      .from("profiles")
      .select("id, username, xp, current_streak, longest_streak")
      .order(order, { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as Row[]) || []));
  }, [tab]);

  const myRank = rows.findIndex(r => r.id === user?.id);

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-warning" /> Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Top crackers across CodeCrack.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="xp">Total XP</TabsTrigger>
          <TabsTrigger value="streak">Current Streak</TabsTrigger>
          <TabsTrigger value="longest">Best Streak</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="shadow-card mt-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {myRank >= 0 ? `Your rank: #${myRank + 1}` : "You're not ranked yet — solve a problem!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {rows.length === 0 && <p className="text-sm text-muted-foreground">No rankings yet.</p>}
              {rows.map((r, i) => {
                const isMe = r.id === user?.id;
                const value = tab === "xp" ? r.xp : tab === "streak" ? r.current_streak : r.longest_streak;
                const unit = tab === "xp" ? "XP" : "days";
                const initials = (r.username || "??").slice(0, 2).toUpperCase();
                return (
                  <div key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/50"}`}>
                    <div className="w-8 text-center font-bold text-muted-foreground">
                      {i === 0 ? <Medal className="h-5 w-5 text-warning mx-auto" /> :
                       i === 1 ? <Medal className="h-5 w-5 text-muted-foreground mx-auto" /> :
                       i === 2 ? <Medal className="h-5 w-5 text-difficulty-medium mx-auto" /> :
                       `#${i + 1}`}
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {r.username || "Anonymous"} {isMe && <span className="text-xs text-primary">(you)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      {tab !== "xp" && <Flame className="h-4 w-4 text-difficulty-hard" />}
                      <span>{value}</span>
                      <span className="text-xs text-muted-foreground font-normal ml-1">{unit}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
