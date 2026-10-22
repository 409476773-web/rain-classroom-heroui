"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {GradingPanel} from "../../../../apps/docs/src/components/rain-examples/grading-panel/grading-panel";

const meta = {
  component: GradingPanel,
  title: "Components/Business/Grading Panel",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "雨课堂批改业务组合：搜索/筛选作答、保留本页草稿、评分与评语校验、浮层确认提交、更新进度与切换下一份。虚构数据，刷新重置。顶部主题菜单可切换 HeroUI 原版与雨课堂，基础组件保持原版。文档站与此故事共用同一个 React 示例。",
      },
    },
  },
} satisfies Meta<typeof GradingPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workspace: Story = {name: "批改工作台"};
