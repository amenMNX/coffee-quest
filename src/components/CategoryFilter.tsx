import { Coffee, Store, Flame, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", label: "All", icon: Coffee },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "specialty", label: "Specialty", icon: Heart },
  { id: "roastery", label: "Roastery", icon: Flame },
  { id: "chain", label: "Chain", icon: Store },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category.id)}
            className="flex items-center gap-2 shrink-0 transition-all"
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};
