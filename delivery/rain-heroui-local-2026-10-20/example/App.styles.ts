import {tv} from "tailwind-variants";

export const exampleStyles = tv({
  slots: {
    card: "w-full max-w-md",
    form: "flex flex-col gap-4",
    page: "flex min-h-screen items-start justify-center bg-background p-6 text-foreground",
  },
});
