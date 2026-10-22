"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {Card, Description, Label, ListBox, Select, Typography} from "@heroui/react";

import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const meta: Meta = {
  parameters: {layout: "fullscreen"},
  title: "Components/Theme/State Review",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Selections: Story = {
  name: "列表选中与浮层状态",
  render: () => (
    <main className={styles.root()}>
      <header className={styles.stack()}>
        <Typography.Heading level={1}>列表选中与浮层状态</Typography.Heading>
        <p className={styles.note()}>
          可用鼠标与方向键切换。观察选中浅底、悬停与焦点环、禁用项和危险选项；全部为本地选择，无删除或提交动作。
        </p>
      </header>
      <div className={styles.grid()}>
        <Card>
          <Card.Header>
            <Card.Title>单选作答列表</Card.Title>
          </Card.Header>
          <Card.Content>
            <ListBox
              aria-label="单选作答列表"
              className={styles.list()}
              defaultSelectedKeys={["lin"]}
              disabledKeys={["zhou"]}
              selectionMode="single"
            >
              <ListBox.Item id="lin" textValue="林同学">
                <div className={styles.stack()}>
                  <Label>林同学</Label>
                  <Description>待批改 · 示例 01</Description>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="chen" textValue="陈同学">
                <div className={styles.stack()}>
                  <Label>陈同学</Label>
                  <Description>待批改 · 示例 02</Description>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="zhou" textValue="周同学（禁用）">
                <Label>周同学（禁用）</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="xu" textValue="许同学">
                <Label>许同学</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="danger" textValue="危险选项（仅选择）" variant="danger">
                <Label>危险选项（仅选择）</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>多选作答列表</Card.Title>
          </Card.Header>
          <Card.Content>
            <ListBox
              aria-label="多选作答列表"
              className={styles.list()}
              defaultSelectedKeys={["lin", "chen"]}
              disabledKeys={["zhou"]}
              selectionMode="multiple"
            >
              <ListBox.Item id="lin" textValue="林同学">
                <Label>林同学</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="chen" textValue="陈同学">
                <Label>陈同学</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="zhou" textValue="周同学（禁用）">
                <Label>周同学（禁用）</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="xu" textValue="许同学">
                <Label>许同学</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>禁用选中与危险选中</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <p className={styles.note()}>两项均预选：禁用项保留透明度，危险项保留原版危险语义。</p>
            <ListBox
              aria-label="特殊选中状态"
              className={styles.list()}
              defaultSelectedKeys={["locked", "danger"]}
              disabledKeys={["locked"]}
              selectionMode="multiple"
            >
              <ListBox.Item id="locked" textValue="已归档作答（禁用且选中）">
                <Label>已归档作答（禁用且选中）</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="danger" textValue="移除示例（仅选择）" variant="danger">
                <Label>移除示例（仅选择）</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>Select 复用选项</Card.Title>
          </Card.Header>
          <Card.Content>
            <Select
              className={styles.field()}
              defaultValue="first"
              disabledKeys={["locked"]}
              name="review-select-list"
            >
              <Label>批改分组选择</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="first" textValue="第一组">
                    <Label>第一组</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="locked" textValue="已归档组（禁用）">
                    <Label>已归档组（禁用）</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="second" textValue="第二组">
                    <Label>第二组</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
              <Description>初始已选第一组；方向键应跳过已归档组。</Description>
            </Select>
          </Card.Content>
        </Card>
      </div>
    </main>
  ),
};
