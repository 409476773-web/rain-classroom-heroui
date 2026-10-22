"use client";

import type {Key, Selection} from "@heroui/react";
import type {Meta, StoryObj} from "@storybook/react";

import {Card, Header, Menu as HeroMenu, Kbd, Label, Separator, Typography} from "@heroui/react";
import React, {useState} from "react";

import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const commands: Record<string, string> = {
  "menu-new": "新建练习",
  "menu-open": "查看作答",
  "menu-save": "保存草稿",
  "menu-archive": "归档练习（禁用）",
  "menu-danger": "危险操作样本",
  "sort-time": "按提交时间",
  "sort-name": "按学生姓名",
  "sort-score": "按得分（禁用）",
  "show-student": "显示学生姓名",
  "show-time": "显示提交时间",
  "show-feedback": "显示批改反馈",
  "show-private": "显示私有备注（禁用）",
};

function selectedLabels(selection: Selection) {
  return selection === "all"
    ? "全部"
    : Array.from(selection, (key) => commands[String(key)] ?? String(key)).join("、") || "未选择";
}

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "直接使用本库 Menu、Menu.Item、Menu.Section 和 Menu.ItemIndicator，补充独立菜单覆盖。命令仅在页面显示反馈，选择仅保留当前页面；不删除或提交任何数据。",
      },
    },
    layout: "fullscreen",
  },
  title: "Components/Theme/State Review",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Menu: Story = {
  name: "菜单状态",
  render: function MenuStateReview() {
    const [single, setSingle] = useState<Selection>(new Set(["sort-time"]));
    const [multiple, setMultiple] = useState<Selection>(new Set(["show-student", "show-time"]));
    const [action, setAction] = useState({count: 0, label: "尚未触发菜单操作"});

    function recordAction(key: Key) {
      setAction((previous) => ({
        count: previous.count + 1,
        label: commands[String(key)] ?? String(key),
      }));
    }

    return (
      <main aria-label="独立菜单状态检查" className={styles.root()}>
        <header className={styles.stack()}>
          <Typography.Heading level={1}>菜单状态</Typography.Heading>
          <p className={styles.note()}>
            使用顶部主题菜单对照原版与雨课堂。Tab 进入菜单，上下方向键移动，Enter
            或空格操作；禁用项不可操作。
          </p>
          <p className={styles.note()}>
            以下为持续展开的独立 Menu，不是 Dropdown.Menu；快捷键只作提示显示，不注册全局快捷键。
          </p>
          <p aria-live="polite" role="status">
            页内操作反馈：{action.label}；累计 {action.count} 次。此样本不保存、不删除数据。
          </p>
        </header>

        <div className={styles.grid()}>
          <Card aria-label="菜单命令与分组样本">
            <Card.Header>
              <Card.Title>普通项、分组与危险项</Card.Title>
              <Card.Description>
                检查文字、快捷键、分隔线、禁用跳过与真实 onAction 反馈。
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <HeroMenu aria-label="练习操作菜单" onAction={recordAction}>
                <HeroMenu.Section>
                  <Header>练习操作</Header>
                  <HeroMenu.Item id="menu-new" textValue="新建练习">
                    <Label>新建练习</Label>
                    <Kbd slot="keyboard" variant="light">
                      <Kbd.Abbr keyValue="command" />
                      <Kbd.Content>N</Kbd.Content>
                    </Kbd>
                  </HeroMenu.Item>
                  <HeroMenu.Item id="menu-open" textValue="查看作答">
                    <Label>查看作答</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item id="menu-save" textValue="保存草稿">
                    <Label>保存草稿</Label>
                    <Kbd slot="keyboard" variant="light">
                      <Kbd.Abbr keyValue="command" />
                      <Kbd.Content>S</Kbd.Content>
                    </Kbd>
                  </HeroMenu.Item>
                  <HeroMenu.Item isDisabled id="menu-archive" textValue="归档练习（禁用）">
                    <Label>归档练习（禁用）</Label>
                  </HeroMenu.Item>
                </HeroMenu.Section>
                <Separator />
                <HeroMenu.Section>
                  <Header>危险操作样本</Header>
                  <HeroMenu.Item id="menu-danger" textValue="危险操作样本" variant="danger">
                    <Label>危险操作样本</Label>
                    <Kbd slot="keyboard" variant="light">
                      <Kbd.Abbr keyValue="command" />
                      <Kbd.Abbr keyValue="shift" />
                      <Kbd.Content>D</Kbd.Content>
                    </Kbd>
                  </HeroMenu.Item>
                </HeroMenu.Section>
              </HeroMenu>
            </Card.Content>
          </Card>

          <Card aria-label="菜单单选样本">
            <Card.Header>
              <Card.Title>单选菜单</Card.Title>
              <Card.Description>受控选中值，使用原版圆点指示器与键盘行为。</Card.Description>
            </Card.Header>
            <Card.Content className={styles.stack()}>
              <HeroMenu
                aria-label="作答排序菜单"
                selectedKeys={single}
                selectionMode="single"
                onAction={recordAction}
                onSelectionChange={setSingle}
              >
                <HeroMenu.Section>
                  <Header>排序方式</Header>
                  <HeroMenu.Item id="sort-time" textValue="按提交时间">
                    <HeroMenu.ItemIndicator type="dot" />
                    <Label>按提交时间</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item id="sort-name" textValue="按学生姓名">
                    <HeroMenu.ItemIndicator type="dot" />
                    <Label>按学生姓名</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item isDisabled id="sort-score" textValue="按得分（禁用）">
                    <HeroMenu.ItemIndicator type="dot" />
                    <Label>按得分（禁用）</Label>
                  </HeroMenu.Item>
                </HeroMenu.Section>
              </HeroMenu>
              <p aria-live="polite" className={styles.note()}>
                当前排序：{selectedLabels(single)}
              </p>
            </Card.Content>
          </Card>

          <Card aria-label="菜单多选样本">
            <Card.Header>
              <Card.Title>多选菜单</Card.Title>
              <Card.Description>受控选中集合，使用原版勾选指示器；允许清空。</Card.Description>
            </Card.Header>
            <Card.Content className={styles.stack()}>
              <HeroMenu
                aria-label="作答显示内容菜单"
                selectedKeys={multiple}
                selectionMode="multiple"
                onAction={recordAction}
                onSelectionChange={setMultiple}
              >
                <HeroMenu.Section>
                  <Header>显示内容</Header>
                  <HeroMenu.Item id="show-student" textValue="显示学生姓名">
                    <HeroMenu.ItemIndicator />
                    <Label>显示学生姓名</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item id="show-time" textValue="显示提交时间">
                    <HeroMenu.ItemIndicator />
                    <Label>显示提交时间</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item id="show-feedback" textValue="显示批改反馈">
                    <HeroMenu.ItemIndicator />
                    <Label>显示批改反馈</Label>
                  </HeroMenu.Item>
                  <HeroMenu.Item isDisabled id="show-private" textValue="显示私有备注（禁用）">
                    <HeroMenu.ItemIndicator />
                    <Label>显示私有备注（禁用）</Label>
                  </HeroMenu.Item>
                </HeroMenu.Section>
              </HeroMenu>
              <p aria-live="polite" className={styles.note()}>
                当前显示：{selectedLabels(multiple)}
              </p>
            </Card.Content>
          </Card>
        </div>
      </main>
    );
  },
};
