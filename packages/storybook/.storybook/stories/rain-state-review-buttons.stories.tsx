"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {Heart, Plus} from "@gravity-ui/icons";
import {
  Button,
  ButtonGroup,
  Card,
  I18nProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import React from "react";

import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const sizes = ["sm", "md", "lg"] as const;
const variants = [
  {label: "主要按钮", value: "primary"},
  {label: "次要按钮", value: "secondary"},
  {label: "第三按钮", value: "tertiary"},
  {label: "危险按钮", value: "danger"},
] as const;
const items = ["第一项", "第二项", "第三项"];

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "按钮四族的人工状态检查夹具。使用顶部主题菜单对照原版与雨课堂；保持原版尺寸、交互和状态机制，不连接服务。",
      },
    },
    layout: "fullscreen",
  },
  title: "Components/Theme/State Review",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  name: "按钮与按钮组",
  render: () => (
    <main aria-label="按钮与按钮组状态检查" className={styles.root()}>
      <header className={styles.stack()}>
        <Typography.Heading level={1}>按钮与按钮组</Typography.Heading>
        <p className={styles.note()}>
          切换顶部主题进行对照。用鼠标查看悬停，用 Tab 查看焦点，按空格切换
          ToggleButton；按钮不执行业务操作。
        </p>
      </header>

      <div className={styles.grid()}>
        <Card aria-label="按钮尺寸与图标样本">
          <Card.Header>
            <Card.Title>尺寸与图标按钮</Card.Title>
            <Card.Description>普通按钮和切换按钮使用原版 sm、md、lg。</Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {sizes.map((size) => (
              <div key={size} className={styles.stack()}>
                <p className={styles.note()}>{size}</p>
                <div className={styles.row()}>
                  <Button size={size} type="button">
                    普通按钮
                  </Button>
                  <Button isIconOnly aria-label={`${size} 添加`} size={size} type="button">
                    <Plus />
                  </Button>
                  <ToggleButton size={size}>切换按钮</ToggleButton>
                  <ToggleButton isIconOnly aria-label={`${size} 收藏`} size={size}>
                    <Heart />
                  </ToggleButton>
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card aria-label="按钮变体与禁用样本">
          <Card.Header>
            <Card.Title>颜色、选中与禁用</Card.Title>
            <Card.Description>
              查看默认、悬停、焦点和选中组合；禁用项应跳过键盘操作。
            </Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <div className={styles.row()}>
              {variants.map(({label, value}) => (
                <Button key={value} type="button" variant={value}>
                  {label}
                </Button>
              ))}
            </div>
            <div className={styles.row()}>
              <Button isDisabled type="button">
                禁用按钮
              </Button>
              <Button isDisabled type="button" variant="danger">
                禁用危险按钮
              </Button>
            </div>
            <div className={styles.row()}>
              <ToggleButton>未选中切换</ToggleButton>
              <ToggleButton defaultSelected>已选中切换</ToggleButton>
              <ToggleButton defaultSelected variant="ghost">
                已选中透明切换
              </ToggleButton>
              <ToggleButton isDisabled>禁用切换</ToggleButton>
              <ToggleButton defaultSelected isDisabled>
                已选中且禁用
              </ToggleButton>
            </div>
          </Card.Content>
        </Card>

        <Card aria-label="连接按钮组样本">
          <Card.Header>
            <Card.Title>连接按钮组</Card.Title>
            <Card.Description>外缘保留圆角，连接处保持直角；组内焦点可见。</Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {sizes.map((size) => (
              <div key={size} className={styles.stack()}>
                <p className={styles.note()}>{size} · 横向连接</p>
                <ButtonGroup aria-label={`${size} 横向连接按钮`} size={size}>
                  {items.map((label, index) => (
                    <Button key={label} type="button">
                      {index > 0 && <ButtonGroup.Separator />}
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            ))}
            <div className={styles.row()}>
              <div className={styles.stack()}>
                <p className={styles.note()}>纵向连接</p>
                <ButtonGroup aria-label="纵向连接按钮" orientation="vertical" variant="secondary">
                  {items.map((label, index) => (
                    <Button key={label} type="button">
                      {index > 0 && <ButtonGroup.Separator />}
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <div className={styles.stack()}>
                <p className={styles.note()}>RTL · 从右向左</p>
                <I18nProvider locale="ar">
                  <ButtonGroup aria-label="从右向左连接按钮" dir="rtl" variant="secondary">
                    {items.map((label, index) => (
                      <Button key={label} type="button">
                        {index > 0 && <ButtonGroup.Separator />}
                        {label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </I18nProvider>
              </div>
            </div>
            <div className={styles.stack()}>
              <p className={styles.note()}>仅有一项</p>
              <ButtonGroup aria-label="单项按钮组" variant="secondary">
                <Button type="button">单项按钮</Button>
              </ButtonGroup>
            </div>
            <div className={styles.stack()}>
              <p className={styles.note()}>禁用连接按钮组</p>
              <ButtonGroup isDisabled aria-label="禁用连接按钮组" variant="secondary">
                {items.map((label, index) => (
                  <Button key={label} type="button">
                    {index > 0 && <ButtonGroup.Separator />}
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Card.Content>
        </Card>

        <Card aria-label="切换按钮组样本">
          <Card.Header>
            <Card.Title>切换按钮组</Card.Title>
            <Card.Description>
              方向键移动焦点，空格选择；对照连接、分离、方向与禁用。
            </Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {sizes.map((size) => (
              <div key={size} className={styles.stack()}>
                <p className={styles.note()}>{size} · 横向连接</p>
                <ToggleButtonGroup
                  aria-label={`${size} 连接切换按钮`}
                  defaultSelectedKeys={[`${size}-1`]}
                  selectionMode="single"
                  size={size}
                >
                  {items.map((label, index) => (
                    <ToggleButton key={label} id={`${size}-${index}`}>
                      {index > 0 && <ToggleButtonGroup.Separator />}
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>
            ))}
            <div className={styles.row()}>
              <div className={styles.stack()}>
                <p className={styles.note()}>纵向连接</p>
                <ToggleButtonGroup
                  aria-label="纵向连接切换按钮"
                  defaultSelectedKeys={["vertical-1"]}
                  orientation="vertical"
                  selectionMode="single"
                >
                  {items.map((label, index) => (
                    <ToggleButton key={label} id={`vertical-${index}`}>
                      {index > 0 && <ToggleButtonGroup.Separator />}
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>
              <div className={styles.stack()}>
                <p className={styles.note()}>RTL · 从右向左</p>
                <I18nProvider locale="ar">
                  <ToggleButtonGroup
                    aria-label="从右向左连接切换按钮"
                    defaultSelectedKeys={["rtl-1"]}
                    dir="rtl"
                    selectionMode="single"
                  >
                    {items.map((label, index) => (
                      <ToggleButton key={label} id={`rtl-${index}`}>
                        {index > 0 && <ToggleButtonGroup.Separator />}
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </I18nProvider>
              </div>
            </div>
            <div className={styles.stack()}>
              <p className={styles.note()}>分离按钮 · 可多选</p>
              <ToggleButtonGroup
                isDetached
                aria-label="分离切换按钮"
                defaultSelectedKeys={["detached-0"]}
                selectionMode="multiple"
              >
                {items.map((label, index) => (
                  <ToggleButton key={label} id={`detached-${index}`}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
            <div className={styles.row()}>
              <div className={styles.stack()}>
                <p className={styles.note()}>仅有一项</p>
                <ToggleButtonGroup
                  aria-label="单项切换按钮组"
                  defaultSelectedKeys={["single"]}
                  selectionMode="single"
                >
                  <ToggleButton id="single">单项切换</ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className={styles.stack()}>
                <p className={styles.note()}>禁用按钮组</p>
                <ToggleButtonGroup
                  isDisabled
                  aria-label="禁用切换按钮组"
                  defaultSelectedKeys={["disabled-0"]}
                  selectionMode="single"
                >
                  {items.map((label, index) => (
                    <ToggleButton key={label} id={`disabled-${index}`}>
                      {index > 0 && <ToggleButtonGroup.Separator />}
                      {label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </main>
  ),
};
