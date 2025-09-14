"use client";

import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductTag } from "@/drizzle/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SortOption } from "@/app/(consumer)/page";

interface Product {
  id: string;
  name: string;
  description: string;
  priceInDollars: number;
  imageUrl: string;
  tags: ProductTag[];
  createdAt: Date;
}

interface ProductGridProps {
  products: Product[];
  coupon?: { discountPercentage: number } | null;
}

const sortOptions = [
  { value: "latest" as const, label: "Latest added" },
  { value: "oldest" as const, label: "Oldest" },
  { value: "price-low" as const, label: "Price: Low → High" },
  { value: "price-high" as const, label: "Price: High → Low" },
];

export function ProductGrid({ products, coupon }: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const initialSearch = searchParams.get("search") || "";
  const initialSort = (searchParams.get("sort") as SortOption) || "latest";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlSort = (searchParams.get("sort") as SortOption) || "latest";
    
    setSearchTerm(urlSearch);
    setSortBy(urlSort);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    
    if (sortBy !== "latest") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : "/";
    
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [debouncedSearch, sortBy, router, searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if (debouncedSearch) {
      filtered = products.filter((product) =>
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return a.priceInDollars - b.priceInDollars;
        case "price-high":
          return b.priceInDollars - a.priceInDollars;
        case "latest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [products, debouncedSearch, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-black font-medium">
        {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? "course" : "courses"}
        {debouncedSearch && (
          <span> matching &ldquo;{debouncedSearch}&rdquo;</span>
        )}
      </div>

      {filteredAndSortedProducts.length > 0 ? (
        <div 
          className={`grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 ${
            isPending ? "opacity-50 transition-opacity" : ""
          }`}
        >
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} {...product} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {debouncedSearch ? (
              <>No courses found matching &ldquo;{debouncedSearch}&rdquo;</>
            ) : (
              "No courses available"
            )}
          </div>
          {debouncedSearch && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}