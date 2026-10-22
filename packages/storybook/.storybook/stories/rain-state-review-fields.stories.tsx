"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {
  Card,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  NumberField,
  SearchField,
  Select,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";

import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const meta: Meta = {
  parameters: {layout: "fullscreen"},
  title: "Components/Theme/State Review",
};

export default meta;

type Story = StoryObj<typeof meta>;
type FieldState = {
  id: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  label: string;
  variant?: "primary" | "secondary";
};

const fieldStates: FieldState[] = [
  {id: "default", label: "默认"},
  {id: "secondary", label: "次要", variant: "secondary"},
  {id: "disabled", isDisabled: true, label: "禁用"},
  {id: "invalid", isInvalid: true, label: "错误"},
];

export const Fields: Story = {
  name: "输入提示与表单状态",
  render: () => (
    <main className={styles.root()}>
      <header className={styles.stack()}>
        <Typography.Heading level={1}>输入提示与表单状态</Typography.Heading>
        <p className={styles.note()}>
          用顶部主题菜单对比原版与雨课堂。空值提示、已输入内容、持久标签和错误信息分别观察；可直接输入、聚焦或打开选择器。
        </p>
      </header>
      <div className={styles.grid()}>
        <Card>
          <Card.Header>
            <Card.Title>文本输入</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <TextField name="review-text-empty">
              <Label>练习名称空值提示</Label>
              <Input placeholder="请输入练习名称" />
              <Description>这是持久辅助说明，应与空值提示区分。</Description>
            </TextField>
            <TextField defaultValue="课堂练习一" name="review-text-filled">
              <Label>练习名称已输入</Label>
              <Input placeholder="请输入练习名称" />
            </TextField>
            <TextField isReadOnly defaultValue="只读练习名称" name="review-text-readonly">
              <Label>练习名称只读内容</Label>
              <Input />
            </TextField>
            <TextField isDisabled name="review-text-disabled">
              <Label>练习名称禁用提示</Label>
              <Input placeholder="请输入练习名称" />
            </TextField>
            <TextField isInvalid isRequired name="review-text-invalid">
              <Label>练习名称错误提示</Label>
              <Input placeholder="请输入练习名称" />
              <FieldError>请输入练习名称后再提交。</FieldError>
            </TextField>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>多行反馈</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <TextField name="review-feedback-empty">
              <Label>反馈空值提示</Label>
              <TextArea placeholder="指出做得好的地方，以及下一步可以改进什么。" />
              <Description>反馈不会发送给学生。</Description>
            </TextField>
            <TextField
              defaultValue="论据清晰，可以补充一个具体例子。"
              name="review-feedback-filled"
            >
              <Label>反馈已输入内容</Label>
              <TextArea />
            </TextField>
            <TextField isReadOnly defaultValue="这是一条只读反馈。" name="review-feedback-readonly">
              <Label>反馈只读内容</Label>
              <TextArea />
            </TextField>
            <TextField isInvalid isRequired name="review-feedback-invalid">
              <Label>反馈错误提示</Label>
              <TextArea placeholder="请输入反馈" />
              <FieldError>请填写反馈说明。</FieldError>
            </TextField>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>搜索输入</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {fieldStates.map(({id, label, ...props}) => (
              <SearchField
                key={id}
                className={styles.field()}
                name={`review-search-${id}`}
                {...props}
              >
                <Label>学生搜索{label}提示</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input className={styles.field()} placeholder="搜索学生姓名" />
                  <SearchField.ClearButton />
                </SearchField.Group>
                {props.isInvalid ? <FieldError>请输入有效的学生姓名。</FieldError> : null}
              </SearchField>
            ))}
            <SearchField isReadOnly defaultValue="林同学" name="review-search-readonly">
              <Label>学生搜索只读内容</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input className={styles.field()} placeholder="搜索学生姓名" />
              </SearchField.Group>
            </SearchField>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>数字评分</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {fieldStates.map(({id, label, ...props}) => (
              <NumberField
                key={id}
                className={styles.field()}
                maxValue={20}
                minValue={0}
                name={`review-score-${id}`}
                step={0.5}
                {...props}
              >
                <Label>分数{label}提示</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input className={styles.field()} placeholder="请输入分数" />
                  <NumberField.IncrementButton />
                </NumberField.Group>
                {props.isInvalid ? <FieldError>请填写 0–20 分之间的分数。</FieldError> : null}
              </NumberField>
            ))}
            <NumberField isReadOnly defaultValue={18.5} name="review-score-readonly">
              <Label>分数只读内容</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input className={styles.field()} placeholder="请输入分数" />
                <NumberField.IncrementButton />
              </NumberField.Group>
              <Description>满分 20 分，支持 0.5 分。</Description>
            </NumberField>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>输入组合与持久前后缀</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <TextField name="review-currency-empty">
              <Label>金额空值与固定单位</Label>
              <InputGroup className={styles.field()}>
                <InputGroup.Prefix>$</InputGroup.Prefix>
                <InputGroup.Input className={styles.field()} placeholder="请输入金额" />
                <InputGroup.Suffix>USD</InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <TextField defaultValue="128" name="review-currency-filled">
              <Label>金额已输入与固定单位</Label>
              <InputGroup className={styles.field()}>
                <InputGroup.Prefix>$</InputGroup.Prefix>
                <InputGroup.Input className={styles.field()} />
                <InputGroup.Suffix>USD</InputGroup.Suffix>
              </InputGroup>
            </TextField>
            <TextField defaultValue="classroom" name="review-website-filled">
              <Label>网址已输入与固定前后缀</Label>
              <InputGroup className={styles.field()}>
                <InputGroup.Prefix>https://</InputGroup.Prefix>
                <InputGroup.Input className={styles.field()} placeholder="请输入域名" />
                <InputGroup.Suffix>.com</InputGroup.Suffix>
              </InputGroup>
              <Description>前后缀是持久内容，填写后仍应可辨认。</Description>
            </TextField>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>选择提示与已选内容</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            {fieldStates.map(({id, label, ...props}) => (
              <Select
                key={id}
                className={styles.field()}
                name={`review-select-${id}`}
                placeholder="请选择批改分组"
                {...props}
              >
                <Label>批改分组{label}提示</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="group-a" textValue="第一组">
                      第一组
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="group-b" textValue="第二组">
                      第二组
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
                {props.isInvalid ? <FieldError>请选择批改分组。</FieldError> : null}
              </Select>
            ))}
            <Select className={styles.field()} defaultValue="selected" name="review-select-filled">
              <Label>批改分组已选内容</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="selected" textValue="第三组">
                    第三组
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </Card.Content>
        </Card>
      </div>
    </main>
  ),
};
