import {tv} from "tailwind-variants";

export const rainLayoutReviewStyles = tv({
  slots: {
    narrow: "w-80 max-w-full min-w-0",
    table: "min-w-[44rem]",
    wide: "w-full min-w-0",
  },
});
