"use client";

import type {Meta, StoryObj} from "@storybook/react";

import {
  Calendar,
  Card,
  DateField,
  DatePicker,
  Description,
  FieldError,
  I18nProvider,
  Label,
  RangeCalendar,
  Typography,
} from "@heroui/react";
import {parseDate} from "@internationalized/date";

import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const selectedDate = parseDate("2026-10-20");
const minimumDate = parseDate("2024-01-01");
const maximumDate = parseDate("2030-12-31");
const rangeMinimum = parseDate("2026-01-01");
const rangeMaximum = parseDate("2028-12-31");
const selectedRange = {end: parseDate("2026-10-23"), start: selectedDate};
const pickerStates: {
  id: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  label: string;
}[] = [
  {id: "default", label: "练习日期"},
  {id: "disabled", isDisabled: true, label: "禁用练习日期"},
  {id: "invalid", isInvalid: true, label: "错误练习日期"},
];
const meta: Meta = {
  parameters: {layout: "fullscreen"},
  title: "Components/Theme/State Review",
};

export default meta;

type Story = StoryObj<typeof meta>;

export const CalendarNavigation: Story = {
  name: "日历与年份入口",
  render: () => (
    <I18nProvider locale="zh-CN">
      <main className={styles.root()}>
        <header className={styles.stack()}>
          <Typography.Heading level={1}>日历与年份入口</Typography.Heading>
          <p className={styles.note()}>
            点击日历的月份与年份标题进入年份列表，再选择年份返回日期网格。日期均为固定虚构示例，不保存或提交。
          </p>
          <p className={styles.note()}>
            CalendarYearPicker 在上游仓库中仍标记为进行中。本页只组合 Calendar／RangeCalendar
            公开部件供复查；年份面板关闭后有已知键盘焦点恢复限制，原版同样存在，不表示已完成稳定性或全部状态验收。
          </p>
        </header>
        <div className={styles.grid()}>
          <Card>
            <Card.Header>
              <Card.Title>单日日历与年份选择</Card.Title>
              <Card.Description>
                示例选中 2026 年 10 月 20 日，范围限定为 2024–2030 年。
              </Card.Description>
            </Card.Header>
            <Card.Content className={styles.stack()}>
              <Calendar
                aria-label="单日练习日历"
                defaultFocusedValue={selectedDate}
                defaultValue={selectedDate}
                maxValue={maximumDate}
                minValue={minimumDate}
              >
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                </Calendar.Grid>
                <Calendar.YearPickerGrid>
                  <Calendar.YearPickerGridBody>
                    {({year}) => <Calendar.YearPickerCell year={year} />}
                  </Calendar.YearPickerGridBody>
                </Calendar.YearPickerGrid>
              </Calendar>
              <p className={styles.note()}>
                观察选中年份、悬停、键盘焦点与返回日期后的显示；不重写原版键盘事件。
              </p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>范围日历与年份选择</Card.Title>
              <Card.Description>
                示例范围为 2026 年 10 月 20–23 日，可选日期限定为 2026–2028 年。
              </Card.Description>
            </Card.Header>
            <Card.Content className={styles.stack()}>
              <RangeCalendar
                aria-label="练习起止日期日历"
                defaultFocusedValue={selectedDate}
                defaultValue={selectedRange}
                maxValue={rangeMaximum}
                minValue={rangeMinimum}
              >
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
                <RangeCalendar.YearPickerGrid>
                  <RangeCalendar.YearPickerGridBody>
                    {({year}) => <RangeCalendar.YearPickerCell year={year} />}
                  </RangeCalendar.YearPickerGridBody>
                </RangeCalendar.YearPickerGrid>
              </RangeCalendar>
              <p className={styles.note()}>
                年份列表用于切换浏览位置，日期范围仍通过原版日期网格选择。
              </p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>日期表单中的真实年份入口</Card.Title>
              <Card.Description>
                先打开日期浮层，再点击浮层内的日历标题；禁用项保留原版入口状态。
              </Card.Description>
            </Card.Header>
            <Card.Content className={styles.stack()}>
              {pickerStates.map(({id, label, ...props}) => (
                <DatePicker
                  key={id}
                  className={styles.field()}
                  defaultValue={selectedDate}
                  maxValue={maximumDate}
                  minValue={minimumDate}
                  name={`review-calendar-${id}`}
                  {...props}
                >
                  <Label>{label}</Label>
                  <DateField.Group fullWidth>
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateField.Suffix>
                      <DatePicker.Trigger aria-label={`打开${label}日历`}>
                        <DatePicker.TriggerIndicator />
                      </DatePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  {props.isInvalid ? (
                    <FieldError>日期需要人工复核，错误状态不改变示例值。</FieldError>
                  ) : (
                    <Description>可选范围为 2024 年 1 月 1 日至 2030 年 12 月 31 日。</Description>
                  )}
                  <DatePicker.Popover>
                    <Calendar
                      aria-label={`${label}日历面板`}
                      maxValue={maximumDate}
                      minValue={minimumDate}
                    >
                      <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                          <Calendar.YearPickerTriggerHeading />
                          <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                      </Calendar.Header>
                      <Calendar.Grid>
                        <Calendar.GridHeader>
                          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                          {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                      </Calendar.Grid>
                      <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                          {({year}) => <Calendar.YearPickerCell year={year} />}
                        </Calendar.YearPickerGridBody>
                      </Calendar.YearPickerGrid>
                    </Calendar>
                  </DatePicker.Popover>
                </DatePicker>
              ))}
            </Card.Content>
          </Card>
        </div>
      </main>
    </I18nProvider>
  ),
};
