import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { coffeeShops, type CoffeeShop } from "@/data/shops";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop";

export const useCafes = () =>
  useQuery({
    queryKey: ["cafes"],
    queryFn: async (): Promise<{ shops: CoffeeShop[]; isSample: boolean }> => {
      const { data, error } = await supabase.from("cafes").select("*").order("created_at");
      if (error) throw error;
      if (!data.length) return { shops: coffeeShops, isSample: true };
      const paths = data.map((c) => c.photo_path).filter(Boolean) as string[];
      const urls: Record<string, string> = {};
      if (paths.length) {
        const { data: signed } = await supabase.storage.from("cafe-photos").createSignedUrls(paths, 60 * 60 * 24);
        signed?.forEach((s) => { if (s.path && s.signedUrl) urls[s.path] = s.signedUrl; });
      }
      return {
        isSample: false,
        shops: data.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone ?? undefined,
          hours: c.hours ?? undefined,
          image: (c.photo_path && urls[c.photo_path]) || FALLBACK_PHOTO,
          photoPath: c.photo_path ?? undefined,
          createdBy: c.created_by ?? undefined,
          category: c.category,
          coffeeTypes: c.coffee_types,
          atmosphere: c.atmosphere,
          amenities: c.amenities,
        })),
      };
    },
  });
