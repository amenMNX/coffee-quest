import { MapPin, Star, Clock, Phone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoffeeShop } from "@/data/shops";

export const mapsLink = (name: string, address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;

export const CoffeeShopCard = ({ name, image, rating, reviewCount, distance, category, isOpen, address, phone, hours }: CoffeeShop) => {
  const query = encodeURIComponent(`${name}, ${address}`);
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
        {isOpen !== undefined && (
          <Badge className="absolute top-3 right-3" variant={isOpen ? "default" : "destructive"}>
            {isOpen ? "Open" : "Closed"}
          </Badge>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{name}</h3>
            <Badge variant="secondary" className="shrink-0">{category}</Badge>
          </div>

          {(rating !== undefined || distance) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {rating !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{rating}</span>
                  {reviewCount !== undefined && <span>({reviewCount})</span>}
                </span>
              )}
              {distance && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{distance}</span>}
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2">{address}</p>
          {hours && (
            <p className="flex items-start gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" /><span className="whitespace-pre-line">{hours}</span>
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            title={`Map of ${name}`}
            src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
            className="h-36 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <a href={mapsLink(name, address)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" /> Open in Google Maps
            </a>
          </Button>
          {phone && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${phone}`}><Phone className="w-4 h-4 mr-1" /> Call</a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
