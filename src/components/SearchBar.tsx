import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationClick: () => void;
}

export const SearchBar = ({ onSearch, onLocationClick }: SearchBarProps) => {
  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search coffee shops..."
          className="pl-10 h-12 border-border bg-card"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={onLocationClick}
        className="shrink-0"
      >
        <MapPin className="w-5 h-5" />
      </Button>
    </div>
  );
};
