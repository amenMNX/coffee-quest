import { useState } from "react";
import { Coffee, MapPin } from "lucide-react";
import { CoffeeShopCard } from "@/components/CoffeeShopCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { AttributeFilters } from "@/components/AttributeFilters";
import { AiRecommender } from "@/components/AiRecommender";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type FilterGroup } from "@/data/shops";
import { useCafes } from "@/hooks/useCafes";
import { Link } from "react-router-dom";

const emptyFilters: Record<FilterGroup, string[]> = { coffeeTypes: [], atmosphere: [], amenities: [] };
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [attrs, setAttrs] = useState(emptyFilters);
  const { toast } = useToast();
  const { data } = useCafes();
  const coffeeShops = data?.shops ?? [];

  const toggleAttr = (group: FilterGroup, value: string) =>
    setAttrs((prev) => ({
      ...prev,
      [group]: prev[group].includes(value) ? prev[group].filter((v) => v !== value) : [...prev[group], value],
    }));

  const filteredShops = coffeeShops.filter((shop) => {
    const matchesCategory = selectedCategory === "all" || norm(shop.category) === norm(selectedCategory);
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAttrs = (Object.keys(attrs) as FilterGroup[]).every((g) =>
      attrs[g].every((v) => shop[g].includes(v))
    );
    return matchesCategory && matchesSearch && matchesAttrs;
  });

  const handleLocationClick = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location found",
            description: "Finding nearby coffee shops...",
          });
          // Will integrate with Google Places API
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Please enable location services to find nearby shops",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not supported",
        description: "Location services not available in your browser",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect Coffee
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Discover the best coffee shops near you with ratings, photos, and
            directions
          </p>

          <div className="pt-6">
            <SearchBar
              onSearch={setSearchQuery}
              onLocationClick={handleLocationClick}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-end"><Button asChild variant="outline" size="sm"><Link to="/manage">Manage my cafés</Link></Button></div>
        {data?.isSample && <p className="text-sm text-muted-foreground">Showing sample cafés — add your own on the Manage page.</p>}
        <AiRecommender shops={coffeeShops} />

        {/* Category Filter */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold text-foreground">
            Coffee Shops Near You
          </h2>
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <AttributeFilters selected={attrs} onToggle={toggleAttr} onClear={() => setAttrs(emptyFilters)} />

        {/* Results Count */}
        <p className="text-muted-foreground">
          {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"}{" "}
          found
        </p>

        {/* Coffee Shop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <CoffeeShopCard key={shop.id} {...shop} />
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <Coffee className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No coffee shops found. Try a different search or category.
            </p>
          </div>
        )}
      </section>

      {/* Map Integration Notice */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-secondary/50 border border-border rounded-xl p-8 text-center space-y-4">
          <MapPin className="w-12 h-12 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Google Maps Integration</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            To enable live data from Google Places API (real photos, ratings, and
            locations), we'll need to set up Lovable Cloud and configure your
            Google Maps API key.
          </p>
          <Button size="lg" variant="default">
            Setup Google Maps
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
