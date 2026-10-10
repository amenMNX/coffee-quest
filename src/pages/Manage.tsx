import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { filterGroups, type FilterGroup } from "@/data/shops";
import { useCafes } from "@/hooks/useCafes";

const categories = ["Café", "Specialty", "Roastery", "Chain"];
const groupLabels: Record<FilterGroup, string> = { coffeeTypes: "Coffee types", atmosphere: "Atmosphere", amenities: "Amenities" };

const AuthForm = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/manage` } });
    setBusy(false);
    if (error) return toast({ title: "Couldn't continue", description: error.message, variant: "destructive" });
    if (mode === "up" && !data.session) toast({ title: "Check your email", description: "Click the link we sent to confirm your account." });
  };
  return (
    <Card className="mx-auto max-w-sm space-y-4 p-6">
      <h2 className="text-xl font-semibold">{mode === "in" ? "Sign in to manage cafés" : "Create your owner account"}</h2>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Sign up"}</Button>
      </form>
      <button className="text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "No account yet? Sign up" : "Already have an account? Sign in"}
      </button>
    </Card>
  );
};

const empty = { name: "", address: "", phone: "", hours: "", category: "Café" };
const emptyTags: Record<FilterGroup, string[]> = { coffeeTypes: [], atmosphere: [], amenities: [] };

const CafeForm = ({ userId, onSaved }: { userId: string; onSaved: () => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [tags, setTags] = useState(emptyTags);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (g: FilterGroup, v: string) =>
    setTags((t) => ({ ...t, [g]: t[g].includes(v) ? t[g].filter((x) => x !== v) : [...t[g], v] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let photo_path: string | null = null;
    if (file) {
      photo_path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("cafe-photos").upload(photo_path, file);
      if (error) { setBusy(false); return toast({ title: "Photo upload failed", description: error.message, variant: "destructive" }); }
    }
    const { error } = await supabase.from("cafes").insert({
      name: form.name.trim(), address: form.address.trim(),
      phone: form.phone.trim() || null, hours: form.hours.trim() || null,
      category: form.category, photo_path, created_by: userId,
      coffee_types: tags.coffeeTypes, atmosphere: tags.atmosphere, amenities: tags.amenities,
    });
    setBusy(false);
    if (error) return toast({ title: "Couldn't save café", description: error.message, variant: "destructive" });
    toast({ title: "Café added", description: form.name });
    setForm(empty); setTags(emptyTags); setFile(null);
    (e.target as HTMLFormElement).reset();
    onSaved();
  };

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-xl font-semibold">Add a café</h2>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
          <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} />
        </div>
        <Input placeholder="Full address (used for the map)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required maxLength={300} />
        <Textarea placeholder={"Opening hours, e.g.\nMon–Fri 7:00–18:00\nSat–Sun 8:00–16:00"} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} maxLength={500} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-sm font-medium text-muted-foreground">Type</span>
          {categories.map((c) => (
            <Badge key={c} variant={form.category === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setForm({ ...form, category: c })}>{c}</Badge>
          ))}
        </div>
        {(Object.keys(filterGroups) as FilterGroup[]).map((g) => (
          <div key={g} className="flex flex-wrap items-center gap-2">
            <span className="w-28 text-sm font-medium text-muted-foreground">{groupLabels[g]}</span>
            {filterGroups[g].map((v) => (
              <Badge key={v} variant={tags[g].includes(v) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggle(g, v)}>{v}</Badge>
            ))}
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Photo</span>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button disabled={busy}>{busy ? "Saving..." : "Save café"}</Button>
      </form>
    </Card>
  );
};

const Manage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const qc = useQueryClient();
  const { data } = useCafes();
  const { toast } = useToast();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin")
      .then(({ data }) => setIsAdmin(!!data?.length));
  }, [session]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["cafes"] });

  const remove = async (id: string, photoPath?: string) => {
    if (!confirm("Delete this café?")) return;
    const { error } = await supabase.from("cafes").delete().eq("id", id);
    if (error) return toast({ title: "Couldn't delete", description: error.message, variant: "destructive" });
    if (photoPath) await supabase.storage.from("cafe-photos").remove([photoPath]);
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back to cafés</Link></Button>
          {session && <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>}
        </div>
        <h1 className="text-3xl font-bold text-foreground">Manage my cafés</h1>
        {!session && <AuthForm />}
        {session && (
          <>
            <CafeForm userId={session.user.id} onSaved={refresh} />
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Your cafés</h2>
              {(() => {
                const mine = (data?.shops ?? []).filter((s) => isAdmin || s.createdBy === session.user.id);
                return data?.isSample || !mine.length ? (
                  <p className="text-muted-foreground">No cafés yet — add your first one above and it will appear in the finder.</p>
                ) : (
                mine.map((s) => (
                  <Card key={s.id} className="flex items-center gap-4 p-3">
                    <img src={s.image} alt={s.name} className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.address}</p>
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${s.name}`} onClick={() => remove(s.id, s.photoPath)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))
              );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Manage;
