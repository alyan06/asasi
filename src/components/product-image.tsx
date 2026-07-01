import Image from "next/image";

type ImgProduct = {
  name: string;
  category: string;
  image_urls: string[];
};

// Soft, category-tinted gradients used when a product has no uploaded photo.
const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  cleanser: ["#e7efe4", "#cfe0cf"],
  serum: ["#f3e7d6", "#e7d0b8"],
  moisturizer: ["#e9efe6", "#d6e6d8"],
  mask: ["#f0e6dd", "#e3cdbb"],
  toner: ["#eef0e6", "#dde6cf"],
  "body-care": ["#f1e8df", "#e6d3c4"],
  skincare: ["#eaeee6", "#d8e2d4"],
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Fills its (relative, aspect-controlled) parent. Renders the uploaded image
 * when present, otherwise a tasteful botanical placeholder so the grid never
 * shows a broken image.
 */
export function ProductImage({
  product,
  sizes,
  priority = false,
}: {
  product: ImgProduct;
  sizes?: string;
  priority?: boolean;
}) {
  const url = product.image_urls?.[0];
  if (url) {
    return (
      <Image
        src={url}
        alt={product.name}
        fill
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        priority={priority}
        className="object-cover"
      />
    );
  }

  const [from, to] =
    CATEGORY_GRADIENT[product.category] ?? CATEGORY_GRADIENT.skincare;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M100 175c0-40 22-70 60-86-7 47-31 70-60 86Zm0 0c0-40-22-70-60-86 7 47 31 70 60 86Zm0 0V70"
          stroke="#2f4733"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-4xl font-medium text-forest/55">
        {initials(product.name)}
      </span>
    </div>
  );
}
