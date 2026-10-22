import {DEFAULT_THEME, THEME_GLOBAL_TYPE_ID, THEME_OPTIONS} from "./constants";

export {THEME_GLOBAL_TYPE_ID};

export const themeGlobalType = {
  [THEME_GLOBAL_TYPE_ID]: {
    name: "Theme",
    description: "HeroUI or Rain Classroom theme for components",
    defaultValue: DEFAULT_THEME,
    toolbar: {
      icon: "paintbrush",
      items: THEME_OPTIONS.map((option) => ({
        value: option.value,
        title: option.title,
      })),
      showName: true,
      dynamicTitle: true,
    },
  },
};
