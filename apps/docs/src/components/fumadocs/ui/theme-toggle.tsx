"use client";

import type {ComponentProps} from "react";

import {useTheme} from "next-themes";
import {tv} from "tailwind-variants";

import {Airplay, Moon, Sun} from "@/components/fumadocs/ui/icons";
import {useIsMounted} from "@/hooks/use-is-mounted";
import {cn} from "@/utils/cn";

const itemVariants = tv({
  base: "text-fd-muted-foreground size-6.5 rounded-full p-1.5",
  variants: {
    active: {
      false: "text-fd-muted-foreground",
      true: "bg-fd-accent text-fd-accent-foreground",
    },
  },
});

const full = [["light", Sun] as const, ["dark", Moon] as const, ["system", Airplay] as const];

export function ThemeToggle({
  className,
  mode = "light-dark",
  ...props
}: ComponentProps<"div"> & {
  mode?: "light-dark" | "light-dark-system";
}) {
  const {forcedTheme, resolvedTheme, setTheme, theme} = useTheme();
  const mounted = useIsMounted();

  const container = cn(
    "inline-flex cursor-(--cursor-interactive) items-center rounded-full border p-1",
    className,
  );

  if (mode === "light-dark") {
    const value = mounted ? (forcedTheme ?? resolvedTheme) : null;

    return (
      <button
        aria-label="Toggle Theme"
        className={container}
        data-theme-toggle=""
        disabled={Boolean(forcedTheme)}
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
      >
        {full.map(([key, Icon]) => {
          if (key === "system") return;

          return (
            <Icon
              key={key}
              className={cn(itemVariants({active: value === key}))}
              fill="currentColor"
            />
          );
        })}
      </button>
    );
  }

  const value = mounted ? (forcedTheme ?? theme) : null;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(itemVariants({active: value === key}))}
          disabled={Boolean(forcedTheme)}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
