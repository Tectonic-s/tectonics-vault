"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type WorkItem = {
  title?: string;
  category?: string;
  image: string;
  link?: string;
};

export const ThreeDMarquee = ({
  images,
  items,
  className,
}: {
  images?: string[];
  items?: WorkItem[];
  className?: string;
}) => {
  const normalizedItems: WorkItem[] = useMemo(() => {
    if (items && items.length > 0) return items;
    if (images && images.length > 0) return images.map((img) => ({ image: img }));
    return [];
  }, [items, images]);

  // Split items array into 4 equal parts, then duplicate to ensure every column is filled from top to bottom
  const chunkSize = Math.max(1, Math.ceil(normalizedItems.length / 4));
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    const colItems = normalizedItems.slice(start, start + chunkSize);
    // Triple items so every column spans the full height of the 3D plane seamlessly
    return [...colItems, ...colItems, ...colItems];
  });

  return (
    <div
      className={cn(
        "relative mx-auto block size-full overflow-hidden",
        className,
      )}
    >
      <div className="flex size-full items-center justify-center overflow-hidden [perspective:1400px]">
        <div className="size-[1700px] shrink-0 scale-50 sm:scale-70 md:scale-85 lg:scale-95 [transform-style:preserve-3d]">
          <div
            style={{
              transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
            }}
            className="relative -top-28 left-1/2 -translate-x-1/2 grid size-full origin-center grid-cols-4 gap-6 md:gap-8 [transform-style:preserve-3d]"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{ y: colIndex % 2 === 0 ? [0, -180] : [-180, 0] }}
                transition={{
                  duration: colIndex % 2 === 0 ? 16 : 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-8"
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((item, itemIndex) => {
                  const content = (
                    <motion.div
                      whileHover={{
                        y: -10,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="group relative aspect-[970/700] w-full overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5 hover:shadow-2xl"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title || `Project ${itemIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        width={970}
                        height={700}
                        loading="lazy"
                      />
                      {item.title && (
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {item.category && (
                            <span className="font-inter text-xs font-semibold uppercase tracking-wider text-white/70">
                              {item.category}
                            </span>
                          )}
                          <h5 className="font-excon text-lg font-bold text-white">
                            {item.title}
                          </h5>
                        </div>
                      )}
                    </motion.div>
                  );

                  return (
                    <div className="relative w-full" key={`${colIndex}-${itemIndex}-${item.title || item.image}`}>
                      <GridLineHorizontal className="-top-4" offset="20px" />
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full cursor-pointer"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#f5f5f5",
          "--color": "rgba(0, 0, 0, 0.08)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#f5f5f5",
          "--color": "rgba(0, 0, 0, 0.08)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset || "150px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};
