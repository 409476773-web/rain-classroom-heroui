"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {
  Button,
  Card,
  Checkbox,
  Description,
  Input,
  Label,
  ListBox,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Separator,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import React from "react";

const meta: Meta = {
  title: "Components/Theme/Brand Comparison",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "使用顶部主题菜单切换 HeroUI Light、HeroUI Dark 与雨课堂 Light。所有控件使用原版组件默认尺寸；内容仅用于主题对照，不连接业务服务。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
  name: "中文主题对照样本",
  render: () => (
    <main className="flex flex-col gap-6 p-6" data-testid="brand-comparison">
      <header className="flex flex-col gap-2">
        <Typography.Heading level={1}>中文主题对照</Typography.Heading>
        <Typography.Paragraph>
          使用顶部主题菜单切换原版明亮、原版深色与雨课堂明亮主题。以下为静态示例，不保存或提交数据。
        </Typography.Paragraph>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card data-testid="comparison-form">
          <Card.Header>
            <Card.Title>表单样本</Card.Title>
            <Card.Description>观察输入、选择、选中与聚焦状态。</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <TextField defaultValue="课堂练习（示例）" name="comparison-title">
              <Label>练习标题</Label>
              <Input data-testid="comparison-input" />
              <Description>可编辑文字以查看输入状态。</Description>
            </TextField>

            <Select name="comparison-group" placeholder="请选择示例分组">
              <Label>示例分组</Label>
              <Select.Trigger data-testid="comparison-select">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover data-testid="comparison-select-popover">
                <ListBox>
                  <ListBox.Item id="group-a" textValue="示例 A 组">
                    示例 A 组
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="group-b" textValue="示例 B 组">
                    示例 B 组
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            <RadioGroup
              data-testid="comparison-radio-group"
              defaultValue="first"
              name="comparison-option"
            >
              <Label>单选样本</Label>
              <Radio value="first">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  选项一
                </Radio.Content>
              </Radio>
              <Radio value="second">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  选项二
                </Radio.Content>
              </Radio>
            </RadioGroup>

            <Checkbox defaultSelected data-testid="comparison-checkbox" name="comparison-checked">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                复选框样本
              </Checkbox.Content>
            </Checkbox>
          </Card.Content>
        </Card>

        <Card data-testid="comparison-list">
          <Card.Header>
            <Card.Title>列表与卡片样本</Card.Title>
            <Card.Description>观察中文内容、表面层次与分隔线。</Card.Description>
          </Card.Header>
          <Card.Content>
            <ul aria-label="练习列表样本" className="flex flex-col gap-4">
              <li className="flex flex-col gap-2">
                <Typography.Heading level={3}>课堂练习一</Typography.Heading>
                <Typography.Paragraph>阅读材料与简短回答，仅展示列表内容。</Typography.Paragraph>
              </li>
              <li aria-hidden="true">
                <Separator />
              </li>
              <li className="flex flex-col gap-2">
                <Typography.Heading level={3}>课堂练习二</Typography.Heading>
                <Typography.Paragraph>另一条示例记录，用于对照连续中文排版。</Typography.Paragraph>
              </li>
            </ul>
          </Card.Content>
        </Card>

        <Card data-testid="comparison-score-panel">
          <Card.Header>
            <Card.Title>评分面板样本</Card.Title>
            <Card.Description>仅为控件组合示意，按钮不执行批改操作。</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <TextField isReadOnly defaultValue="8 / 10" name="comparison-score">
              <Label>评分显示样本</Label>
              <Input data-testid="comparison-score" />
            </TextField>
            <TextField defaultValue="示例评语：表达清晰，可补充说明。" name="comparison-comment">
              <Label>评语样本</Label>
              <TextArea data-testid="comparison-comment" />
            </TextField>
            <div className="flex flex-wrap gap-2">
              <Button data-testid="comparison-primary" type="button" variant="primary">
                主要按钮
              </Button>
              <Button data-testid="comparison-secondary" type="button" variant="secondary">
                次要按钮
              </Button>
              <Button data-testid="comparison-danger" type="button" variant="danger">
                危险按钮
              </Button>
            </div>
          </Card.Content>
          <Card.Footer>
            <Modal>
              <Button data-testid="comparison-modal-trigger" variant="secondary">
                查看弹窗样本
              </Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog data-testid="comparison-modal">
                    <Modal.CloseTrigger aria-label="关闭弹窗样本" />
                    <Modal.Header>
                      <Modal.Heading>弹窗主题样本</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <Typography.Paragraph>
                        此弹窗用于检查浮层是否跟随当前主题。关闭后可继续切换主题对照。
                      </Typography.Paragraph>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close">关闭样本</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Card.Footer>
        </Card>
      </div>
    </main>
  ),
};
