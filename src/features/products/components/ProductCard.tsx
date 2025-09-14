import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { ProductTag } from "@/drizzle/schema";

const getTagColor = (tag: ProductTag) => {
  const colors = {
    recommended: "bg-blue-100 text-blue-800 border-blue-200",
    popular: "bg-green-100 text-green-800 border-green-200",
    new: "bg-purple-100 text-purple-800 border-purple-200",
    bestseller: "bg-orange-100 text-orange-800 border-orange-200",
    featured: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[tag] || "bg-gray-100 text-gray-800 border-gray-200";
};

export function ProductCard({
  id,
  name,
  description,
  priceInDollars,
  imageUrl,
  tags = [],
  coupon,
}: {
  id: string;
  name: string;
  description: string;
  priceInDollars: number;
  imageUrl: string;
  tags?: ProductTag[];
  coupon?: { discountPercentage: number } | null;
}) {
  return (
    <Card
      className="group overflow-visible flex flex-col w-full max-w-[500px] mx-auto shadow-2xl transition duration-700 
            hover:border-[#000000] hover:[transform:perspective(1000px)_scale(0.97)_translateZ(10px)_rotateY(-10deg)]"
    >
      <div
        className="relative aspect-video w-full transition-transform duration-700 rounded-xl
        group-hover:[transform:perspective(1000px)_translateZ(5px)_scale(1.01)_translateX(-20px)_translateY(-15px)] group-hover:opacity-90
      "
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-xl preserve-3d"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <CardDescription>
          <Price price={priceInDollars} coupon={coupon} />
        </CardDescription>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button size="lg"
          className="w-full text-md transition-transform duration-700
        group-hover:[transform:perspective(1000px)_translateZ(5px)_scale(1.01)_translateX(-15px)_translateY(5px)]
      "
          asChild
        >
          <Link href={`/products/${id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Price({ price, coupon }: { price: number; coupon?: { discountPercentage: number } | null }) {
  if (price === 0 || coupon == null) {
    return formatPrice(price);
  }
  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through opacity-50 italic text-[#000] text-xs font-semibold">
        {formatPrice(price)}
      </div>
      <div className="font-bold text-sm text-[#000000]">{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </div>
  );
}
