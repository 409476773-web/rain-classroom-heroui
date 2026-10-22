import {tv} from "tailwind-variants";

export const exampleStyles = tv({
  slots: {
    card: "w-full",
    feedback: "break-words whitespace-pre-wrap",
    form: "flex flex-col items-start gap-4",
    page: "min-h-screen bg-background p-6 text-foreground",
    stack: "mx-auto flex w-full max-w-2xl flex-col gap-6",
    tabPanel: "pt-4 text-sm text-muted",
    table: "w-full",
    tableSection: "mt-6",
    tabs: "w-80 max-w-full",
  },
});
