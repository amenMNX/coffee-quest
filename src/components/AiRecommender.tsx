import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { CoffeeShop } from "@/data/shops";
import { CoffeeShopCard } from "@/components/CoffeeShopCard";

interface Rec { id: string; reason: string }

export const AiRecommender = ({ shops: coffeeShops }: { shops: CoffeeShop[] }) => {
  const [drink, setDrink] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<Rec[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const shops = coffeeShops.map(({ image, photoPath, ...rest }) => rest);
    const { data, error } = await supabase.functions.invoke("recommend-cafes", {
      body: { drink, atmosphere, location, shops },
    });
    setLoading(false);
    if (error || data?.error) {
      let msg = data?.error as string | undefined;
      try { msg ??= (await (error as any)?.context?.json?.())?.error; } catch { /* ignore */ }
      setError(msg ?? "Couldn't get recommendations right now.");
      return;
    }
    setRecs(data.recommendations ?? []);
  };

  return (
    <section className="rounded-2xl border border-border bg-secondary/40 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Find my café with AI</h2>
      </div>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <Textarea placeholder="Drink you love, e.g. oat flat white, fruity pour-over" value={drink} onChange={(e) => setDrink(e.target.value)} />
        <Textarea placeholder="Vibe you want, e.g. quiet place to work" value={atmosphere} onChange={(e) => setAtmosphere(e.target.value)} />
        <div className="space-y-3">
          <Input placeholder="Where? e.g. Downtown, near Old Town" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button type="submit" className="w-full" disabled={loading || !(drink || atmosphere || location).trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Thinking..." : "Recommend cafés"}
          </Button>
        </div>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {recs && recs.length === 0 && <p className="text-muted-foreground">No great matches — try different preferences.</p>}
      {recs && recs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map((r) => {
            const shop = coffeeShops.find((s) => s.id === r.id);
            if (!shop) return null;
            return (
              <div key={r.id} className="space-y-2">
                <CoffeeShopCard {...shop} />
                <p className="text-sm text-foreground"><span className="font-medium text-primary">Why: </span>{r.reason}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
