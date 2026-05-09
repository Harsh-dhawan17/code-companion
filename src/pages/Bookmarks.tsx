import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Bookmark, StickyNote } from "lucide-react";

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: bm }, { data: nt }] = await Promise.all([
        supabase.from("bookmarks").select("created_at, problems(id, slug, number, title, difficulty, topics)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("user_progress").select("notes, solved_at, problems(slug, number, title, difficulty)").eq("user_id", user.id).not("notes", "is", null),
      ]);
      setBookmarks(bm || []);
      setNotes((nt || []).filter((n: any) => n.notes && n.notes.trim()));
    })();
  }, [user]);

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-8 w-8 text-primary" /> Bookmarks & Notes
        </h1>
        <p className="text-muted-foreground mt-1">Your saved problems and personal notes.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bookmark className="h-4 w-4"/>Bookmarked Problems</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {bookmarks.length === 0 && <p className="text-sm text-muted-foreground">No bookmarks yet. Click the bookmark icon on any problem to save it.</p>}
          {bookmarks.map((b: any) => b.problems && (
            <Link key={b.problems.id} to={`/problems/${b.problems.slug}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="min-w-0 flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-mono">#{b.problems.number}</span>
                <span className="font-medium truncate">{b.problems.title}</span>
              </div>
              <DifficultyBadge difficulty={b.problems.difficulty} />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><StickyNote className="h-4 w-4"/>Your Notes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Add notes from any problem page.</p>}
          {notes.map((n: any, i: number) => n.problems && (
            <Link key={i} to={`/problems/${n.problems.slug}`}
              className="block p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">#{n.problems.number}. {n.problems.title}</span>
                <DifficultyBadge difficulty={n.problems.difficulty} />
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{n.notes}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
