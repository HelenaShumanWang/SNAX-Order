import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Item } from "@shared/schema";

const categories = ["All", "Bars", "Oats", "Snacks", "Dairy", "Savory", "Wraps", "Drinks", "Desserts"];

export default function CatalogPage() {
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" data-testid="text-catalog-title">Catalog</h1>
          <p className="text-sm text-muted-foreground">Pre-order healthy snacks for tonight</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search snacks..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap flex-shrink-0"
              onClick={() => setActiveCategory(cat)}
              data-testid={`filter-${cat.toLowerCase()}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="w-full aspect-square rounded-md mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium" data-testid="text-no-results">No snacks found</p>
            <p className="text-sm text-muted-foreground">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover-elevate group" data-testid={`card-item-${item.id}`}>
                  <Link href={`/item/${item.id}`}>
                    <CardContent className="p-3 cursor-pointer">
                      <div className="relative mb-3">
                        <img
                          src={item.imageUrl || "/images/lemon-almond-bar.png"}
                          alt={item.name}
                          className="w-full aspect-square object-cover rounded-md"
                          data-testid={`img-item-${item.id}`}
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-[10px]"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2" data-testid={`text-name-${item.id}`}>
                        {item.name}
                      </h3>
                      <p className="text-primary font-bold text-sm" data-testid={`text-price-${item.id}`}>
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </CardContent>
                  </Link>
                  <div className="px-3 pb-3">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(item);
                      }}
                      data-testid={`button-add-${item.id}`}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Quick Add
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
