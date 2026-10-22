"use client";

import type {FormEvent} from "react";

import {useState} from "react";

import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";

import {exampleStyles} from "./App.styles";

/** Minimal package integration example. All data stays in this component. */
export function App() {
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const styles = exampleStyles();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(true);
  };

  return (
    <main className={styles.page()}>
      <Card className={styles.card()}>
        <Card.Header>
          <Card.Title>组件接入示例</Card.Title>
          <Card.Description>卡片、表单与浮层均直接使用 HeroUI。</Card.Description>
        </Card.Header>
        <Card.Content>
          <Form className={styles.form()} onSubmit={onSubmit}>
            <TextField
              isRequired
              name="feedback"
              validate={(value) => (value.trim() ? null : "请填写反馈")}
              value={feedback}
              onChange={setFeedback}
            >
              <Label>反馈内容</Label>
              <Input placeholder="填写一条示例反馈" />
              <Description>只在当前页面预览，不会发送或保存。</Description>
              <FieldError />
            </TextField>
            <Button type="submit">预览反馈</Button>
          </Form>
        </Card.Content>
      </Card>

      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="关闭预览" />
            <Modal.Header>
              <Modal.Heading>反馈预览</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>{feedback}</p>
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
