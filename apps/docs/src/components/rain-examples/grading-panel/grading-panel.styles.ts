import {tv} from "tailwind-variants";

// Composition layout only. HeroUI owns each primitive's visual and state styles.
export const gradingPanelStyles = tv({
  slots: {
    answer: "text-sm leading-relaxed break-words whitespace-pre-wrap",
    article: "flex flex-col gap-4",
    caption: "text-xs text-muted",
    confirmation: "flex flex-col gap-3",
    empty:
      "flex min-h-64 items-center justify-center @min-[46rem]:col-start-2 @min-[58rem]:col-span-2",
    emptyContent: "flex max-w-sm flex-col items-center gap-3 text-center",
    feedback: "text-sm break-words whitespace-pre-wrap",
    footer: "mt-4 text-xs text-muted",
    formCard: "min-w-0 @min-[46rem]:col-start-2 @min-[58rem]:col-start-auto",
    grid: "grid items-start gap-4 @min-[46rem]:grid-cols-[14rem_minmax(0,1fr)] @min-[58rem]:grid-cols-[14rem_minmax(0,1fr)_19rem]",
    header: "mb-6 flex flex-wrap items-start justify-between gap-4",
    heading: "flex min-w-0 flex-col gap-2",
    inline: "flex flex-wrap items-center gap-2",
    list: "max-h-96 overflow-y-auto",
    muted: "text-sm text-muted",
    notice: "mb-4",
    phrase: "justify-start",
    phrases: "flex flex-col items-stretch gap-2",
    popover: "max-w-sm",
    progress: "w-full @min-[46rem]:w-56",
    root: "@container w-full min-w-0 bg-background p-4",
    row: "flex flex-wrap items-center justify-between gap-3",
    rubric: "grid gap-3",
    rubricItem: "flex items-start justify-between gap-4",
    sidebar: "min-w-0",
    stack: "flex min-w-0 flex-col gap-4",
    student: "flex min-w-0 flex-1 flex-col gap-1",
    summary: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm",
  },
});
