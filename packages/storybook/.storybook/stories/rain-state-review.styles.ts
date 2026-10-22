import {tv} from "tailwind-variants";

export const rainStateReviewStyles = tv({
  slots: {
    root: "mx-auto flex w-full max-w-6xl flex-col gap-6 p-6",
    grid: "grid items-start gap-4 md:grid-cols-2",
    stack: "flex min-w-0 flex-col gap-4",
    row: "flex flex-wrap items-center gap-3",
    field: "w-full min-w-0",
    note: "text-sm text-muted",
    list: "w-full",
  },
});
