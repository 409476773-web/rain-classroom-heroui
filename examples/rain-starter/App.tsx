"use client";

import type {FormEvent} from "react";

import {useRef, useState} from "react";

import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Table,
  Tabs,
  TextField,
} from "@heroui/react";

import {exampleStyles} from "./App.styles";

const submissions = [
  {id: "sample-01", name: "林同学", score: "18 分", status: "已批改"},
  {id: "sample-02", name: "陈同学", score: "待评分", status: "待批改"},
  {id: "sample-03", name: "周同学", score: "16 分", status: "已批改"},
];

/** Local package composition example. Every record and interaction stays on this page. */
export function App() {
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const feedbackRef = useRef<HTMLInputElement>(null);
  const styles = exampleStyles();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedback.trim()) {
      setFeedbackError(true);
      feedbackRef.current?.focus();

      return;
    }
    setFeedbackError(false);
    setIsOpen(true);
  };

  return (
    <main className={styles.page()}>
      <div className={styles.stack()}>
        <Card className={styles.card()}>
          <Card.Header>
            <Card.Title>课堂练习记录（示例）</Card.Title>
            <Card.Description>切换标签查看说明；下方记录均为虚构数据。</Card.Description>
          </Card.Header>
          <Card.Content>
            <Tabs className={styles.tabs()} defaultSelectedKey="analysis">
              <Tabs.ListContainer>
                <Tabs.List aria-label="课堂练习示例页面">
                  <Tabs.Tab id="analysis">
                    课堂练习完整批改记录与学生作答反馈分析详细报告（虚构示例）
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="submissions">
                    作答列表
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab isDisabled id="history">
                    暂不可用的历次课堂练习批改记录与完整反馈汇总
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel className={styles.tabPanel()} id="analysis">
                名称过长时保持单行，悬停省略的文字可查看全名。可用方向键切换标签，禁用项不可选择。
              </Tabs.Panel>
              <Tabs.Panel className={styles.tabPanel()} id="submissions">
                本页有三份虚构作答，用于查看表头、行内容与批改状态。切换标签不会修改记录。
              </Tabs.Panel>
              <Tabs.Panel className={styles.tabPanel()} id="history">
                历史记录暂不可用。
              </Tabs.Panel>
            </Tabs>
            <div className={styles.tableSection()}>
              <Table className={styles.table()} variant="primary">
                <Table.ScrollContainer>
                  <Table.Content aria-label="课堂练习虚构批改记录">
                    <Table.Header>
                      <Table.Column isRowHeader>学生</Table.Column>
                      <Table.Column>批改状态</Table.Column>
                      <Table.Column>得分</Table.Column>
                    </Table.Header>
                    <Table.Body>
                      {submissions.map((submission) => (
                        <Table.Row key={submission.id} id={submission.id}>
                          <Table.Cell>{submission.name}</Table.Cell>
                          <Table.Cell>{submission.status}</Table.Cell>
                          <Table.Cell>{submission.score}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            </div>
          </Card.Content>
        </Card>
        <Card className={styles.card()}>
          <Card.Header>
            <Card.Title>反馈预览</Card.Title>
            <Card.Description>填写反馈后打开预览，关闭后继续编辑。</Card.Description>
          </Card.Header>
          <Card.Content>
            <Form className={styles.form()} validationBehavior="aria" onSubmit={onSubmit}>
              <TextField
                isRequired
                isInvalid={feedbackError}
                name="feedback"
                value={feedback}
                onChange={(value) => {
                  setFeedback(value);
                  setFeedbackError(false);
                }}
              >
                <Label>反馈内容</Label>
                <Input ref={feedbackRef} placeholder="填写一条示例反馈" />
                <Description>只在当前页面预览，不会发送或保存。</Description>
                <FieldError>请填写反馈</FieldError>
              </TextField>
              <Button type="submit">预览反馈</Button>
            </Form>
          </Card.Content>
        </Card>
      </div>

      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="关闭预览" />
            <Modal.Header>
              <Modal.Heading>反馈预览</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className={styles.feedback()}>{feedback}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                返回编辑
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </main>
  );
}
