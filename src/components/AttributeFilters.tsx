import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { filterGroups, type FilterGroup } from "@/data/shops";

const labels: Record<FilterGroup, string> = {
  coffeeTypes: "Coffee type",
  atmosphere: "Atmosphere",
  amenities: "Amenities",
};

interface Props {
  selected: Record<FilterGroup, string[]>;
  onToggle: (group: FilterGroup, value: string) => void;
  onClear: () => void;
}

export const AttributeFilters = ({ selected, onToggle, onClear }: Props) => {
  const active = Object.values(selected).some((v) => v.length > 0);
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {(Object.keys(filterGroups) as FilterGroup[]).map((group) => (
        <div key={group} className="flex flex-wrap items-center gap-2">
          <span className="w-28 shrink-0 text-sm font-medium text-muted-foreground">{labels[group]}</span>
          {filterGroups[group].map((value) => {
            const on = selected[group].includes(value);
            return (
              <Badge
                key={value}
                variant={on ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => onToggle(group, value)}
              >
                {value}
              </Badge>
            );
          })}
        </div>
      ))}
      {active && (
        <Button variant="ghost" size="sm" onClick={onClear}>Clear filters</Button>
      )}
    </div>
  );
};
