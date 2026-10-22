import {tv} from "tailwind-variants";

export const rainCenterStyles = tv({
  slots: {
    card: "min-w-0",
    cardHeader: "flex flex-wrap items-start justify-between gap-3",
    description: "line-clamp-2 text-sm text-muted",
    empty: "flex flex-col items-center gap-3 py-8 text-center",
    filter: "grid gap-3 @min-[38rem]:grid-cols-[minmax(0,1fr)_14rem]",
    grid: "grid gap-4 @min-[42rem]:grid-cols-2",
    links: "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm",
    muted: "text-sm text-muted",
    notice: "text-sm text-muted",
    overview: "grid gap-4 @min-[42rem]:grid-cols-3",
    part: "text-xs break-words text-muted",
    root: "@container flex min-w-0 flex-col gap-6",
    row: "flex flex-wrap items-center justify-between gap-3",
    source: "text-xs break-all text-muted",
    stack: "flex min-w-0 flex-col gap-3",
  },
});
