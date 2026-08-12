import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Container aspect ratio class, e.g. "aspect-[4/3]" */
  wrapperClassName?: string;
}

/**
 * Blur-up lazy image. Renders a shimmer placeholder until the image
 * has decoded, then crossfades it in. No layout shift.
 */
export function BlurImage({
  src,
  alt,
  className,
  wrapperClassName,
  loading = "lazy",
  decoding = "async",
  ...rest
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 shimmer transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-out-expo",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105",
          className
        )}
        {...rest}
      />
    </div>
  );
}
