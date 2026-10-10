import beanBrewImage from "@/assets/bean-brew-roastery.jpg";

export interface CoffeeShop {
  id: string;
  name: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  distance?: string;
  category: string;
  isOpen?: boolean;
  address: string;
  phone?: string;
  hours?: string;
  photoPath?: string;
  createdBy?: string;
  coffeeTypes: string[];
  atmosphere: string[];
  amenities: string[];
}

export const filterGroups = {
  coffeeTypes: ["Espresso", "Pour-over", "Cold brew", "Latte art", "Single origin", "Decaf"],
  atmosphere: ["Cozy", "Quiet", "Lively", "Work-friendly", "Romantic", "Family-friendly"],
  amenities: ["WiFi", "Outdoor seating", "Power outlets", "Pastries", "Vegan options", "Parking"],
} as const;

export type FilterGroup = keyof typeof filterGroups;

export const coffeeShops: CoffeeShop[] = [
  {
    id: "1", name: "Artisan Coffee Roasters",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop",
    rating: 4.8, reviewCount: 324, distance: "0.3 km", category: "Specialty", isOpen: true,
    address: "123 Main Street, Downtown", phone: "+1234567890",
    coffeeTypes: ["Pour-over", "Single origin", "Espresso"],
    atmosphere: ["Quiet", "Work-friendly"],
    amenities: ["WiFi", "Power outlets", "Pastries"],
  },
  {
    id: "2", name: "The Daily Grind",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop",
    rating: 4.5, reviewCount: 189, distance: "0.5 km", category: "Café", isOpen: true,
    address: "456 Coffee Avenue, City Center", phone: "+1234567891",
    coffeeTypes: ["Espresso", "Latte art", "Decaf"],
    atmosphere: ["Lively", "Family-friendly"],
    amenities: ["WiFi", "Pastries", "Vegan options"],
  },
  {
    id: "3", name: "Bean & Brew Co.", image: beanBrewImage,
    rating: 4.7, reviewCount: 256, distance: "0.8 km", category: "Roastery", isOpen: false,
    address: "789 Roast Road, Industrial District",
    coffeeTypes: ["Single origin", "Pour-over", "Cold brew"],
    atmosphere: ["Cozy", "Quiet"],
    amenities: ["Parking", "Outdoor seating"],
  },
  {
    id: "4", name: "Starbucks Reserve",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&auto=format&fit=crop",
    rating: 4.3, reviewCount: 512, distance: "1.2 km", category: "Chain", isOpen: true,
    address: "321 Chain Street, Shopping Mall", phone: "+1234567892",
    coffeeTypes: ["Espresso", "Cold brew", "Decaf"],
    atmosphere: ["Lively", "Work-friendly"],
    amenities: ["WiFi", "Power outlets", "Parking", "Pastries"],
  },
  {
    id: "5", name: "Espresso Corner",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop",
    rating: 4.6, reviewCount: 167, distance: "1.5 km", category: "Café", isOpen: true,
    address: "654 Corner Lane, Old Town", phone: "+1234567893",
    coffeeTypes: ["Espresso", "Latte art"],
    atmosphere: ["Cozy", "Romantic"],
    amenities: ["Outdoor seating", "Pastries"],
  },
  {
    id: "6", name: "Latte Love",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop",
    rating: 4.9, reviewCount: 421, distance: "2.1 km", category: "Specialty", isOpen: true,
    address: "987 Love Street, Arts District",
    coffeeTypes: ["Latte art", "Cold brew", "Single origin"],
    atmosphere: ["Romantic", "Cozy"],
    amenities: ["WiFi", "Vegan options", "Outdoor seating"],
  },
];
