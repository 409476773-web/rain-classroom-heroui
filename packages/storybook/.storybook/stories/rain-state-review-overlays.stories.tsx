"use client";

import type {Key} from "@heroui/react";
import type {Meta, StoryObj} from "@storybook/react";

import {
  Button,
  Card,
  Description,
  Drawer,
  ErrorMessage,
  FieldError,
  Input,
  Label,
  Modal,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  Toast,
  ToastQueue,
  Typography,
} from "@heroui/react";
import {useEffect, useState} from "react";

import {rainStateReviewOverlayStyles} from "./rain-state-review-overlays.styles";
import {rainStateReviewStyles} from "./rain-state-review.styles";

const styles = rainStateReviewStyles();
const overlayStyles = rainStateReviewOverlayStyles();
const longInstructions = [
  "先阅读学生的完整作答，再依据评分参考核对论点、证据与结论之间的关系。不要只根据答案长度或某个关键词判断得分。",
  "反馈应说明已经完成的部分，并给出下一次可以采取的具体行动。例如补充观察记录、解释异常现象，或用更清楚的句子连接论据。",
  "如果作答包含与参考答案不同但合理的路径，应结合题目目标判断。需要进一步确认的内容可在教师之间讨论，本示例不会发送消息或修改真实成绩。",
  "核对分数与反馈是否一致，避免出现得分很高但反馈只描述问题的情况。长段落用于检查中文换行、滚动、固定操作区以及控件的聚焦状态。",
];
const meta: Meta = {
  parameters: {layout: "fullscreen"},
  title: "Components/Theme/State Review",
};

export default meta;

type Story = StoryObj<typeof meta>;

function OverlaySamples() {
  const [queue] = useState(() => new ToastQueue());

  useEffect(() => () => queue.destroy(), [queue]);

  function showToast(isError: boolean) {
    const key = queue.add(
      {
        actionProps: {
          children: "关闭本条提示",
          onPress: () => queue.close(key),
          variant: "tertiary",
        },
        description: isError
          ? "模拟批改记录暂时无法确认，请先保留当前填写的反馈，再核对学生作答与评分参考。这里只展示长中文错误提示，没有请求接口或发送成绩。"
          : "本条消息仅用于观察成功色、中文文字和关闭操作，没有保存数据或通知学生。",
        title: isError ? "模拟确认未完成，需要继续核对本次批改记录" : "模拟操作提示已出现",
        variant: isError ? "danger" : "success",
      },
      {timeout: 0},
    );
  }

  return (
    <main className={styles.root()}>
      <Toast.Provider aria-label="本页模拟通知" placement="bottom end" queue={queue} />
      <header className={styles.stack()}>
        <Typography.Heading level={1}>浮层与长中文</Typography.Heading>
        <p className={styles.note()}>
          对比原版与雨课堂的浮层、长中文和内部控件。关闭对话框或抽屉后，观察焦点是否回到对应的打开按钮。
        </p>
        <p className={styles.note()}>所有内容都是页内模拟，不保存、发送或修改真实成绩。</p>
      </header>
      <div className={styles.grid()}>
        <Card>
          <Card.Header>
            <Card.Title>长中文对话框</Card.Title>
            <Card.Description>内部滚动、错误字段、只读内容与禁用操作。</Card.Description>
          </Card.Header>
          <Card.Content>
            <Modal>
              <Button variant="secondary">打开批改核对对话框</Button>
              <Modal.Backdrop>
                <Modal.Container scroll="inside">
                  <Modal.Dialog>
                    <Modal.CloseTrigger aria-label="关闭批改核对对话框" />
                    <Modal.Header>
                      <Modal.Heading className={overlayStyles.heading()}>
                        课堂练习批改前的完整核对说明与反馈确认示例
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className={styles.stack()}>
                      <TextField
                        isReadOnly
                        defaultValue="课堂练习三 · 林同学"
                        name="review-modal-student"
                      >
                        <Label>对话框只读作答信息</Label>
                        <Input />
                      </TextField>
                      <TextField isInvalid isRequired name="review-modal-feedback">
                        <Label>对话框待补充反馈</Label>
                        <TextArea placeholder="请说明作答中已经完成的部分，以及下一步可改进的地方。" />
                        <FieldError>请补充反馈说明，本示例的确认按钮保持禁用。</FieldError>
                      </TextField>
                      {Array.from({length: 3}, (_, section) =>
                        longInstructions.map((text, paragraph) => (
                          <p key={`${section}-${paragraph}`}>
                            核对说明 {section * longInstructions.length + paragraph + 1}：{text}
                          </p>
                        )),
                      )}
                    </Modal.Body>
                    <Modal.Footer className={overlayStyles.footer()}>
                      <Button slot="close" variant="secondary">
                        关闭核对对话框
                      </Button>
                      <Button isDisabled>确认提交（示例禁用）</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>长中文抽屉</Card.Title>
            <Card.Description>右侧抽屉中的可编辑控件、滚动内容及关闭操作。</Card.Description>
          </Card.Header>
          <Card.Content>
            <Drawer>
              <Button variant="secondary">打开评分参考抽屉</Button>
              <Drawer.Backdrop>
                <Drawer.Content placement="right">
                  <Drawer.Dialog>
                    <Drawer.CloseTrigger aria-label="关闭评分参考抽屉" />
                    <Drawer.Header>
                      <Drawer.Heading className={overlayStyles.heading()}>
                        评分参考与需要保留的完整中文说明
                      </Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body className={styles.stack()}>
                      <TextField defaultValue="课堂练习三的评分参考" name="review-drawer-title">
                        <Label>抽屉参考标题</Label>
                        <Input placeholder="请输入参考标题" />
                        <Description>可以编辑以观察输入及聚焦，不会保存。</Description>
                      </TextField>
                      <TextField name="review-drawer-note">
                        <Label>抽屉核对备注</Label>
                        <TextArea placeholder="记录需要进一步核对的评分依据。" />
                      </TextField>
                      {Array.from({length: 3}, (_, section) =>
                        longInstructions.map((text, paragraph) => (
                          <p key={`${section}-${paragraph}`}>
                            参考说明 {section * longInstructions.length + paragraph + 1}：{text}
                          </p>
                        )),
                      )}
                    </Drawer.Body>
                    <Drawer.Footer className={overlayStyles.footer()}>
                      <Button slot="close" variant="secondary">
                        关闭评分参考抽屉
                      </Button>
                      <Button isDisabled>保存参考（示例禁用）</Button>
                    </Drawer.Footer>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>真实触发的通知</Card.Title>
            <Card.Description>
              提示保持显示，直到通过其关闭按钮、操作按钮或下方按钮关闭。
            </Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <div className={styles.row()}>
              <Button variant="secondary" onPress={() => showToast(false)}>
                触发成功提示
              </Button>
              <Button variant="danger-soft" onPress={() => showToast(true)}>
                触发长中文错误提示
              </Button>
              <Button variant="tertiary" onPress={() => queue.clear()}>
                清除此示例提示
              </Button>
            </div>
            <p className={styles.note()}>离开本页会清理这组提示，不影响其他示例的通知。</p>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}

function ErrorMessageSamples() {
  const [selected, setSelected] = useState<Iterable<Key>>(new Set());
  const isInvalid = Array.from(selected).length === 0;

  return (
    <main className={styles.root()}>
      <header className={styles.stack()}>
        <Typography.Heading level={1}>错误提示状态</Typography.Heading>
        <p className={styles.note()}>
          ErrorMessage 展示独立错误及集合提示；表单字段仍使用
          FieldError。选择分类只改变当前页面的提示。
        </p>
      </header>
      <div className={styles.grid()}>
        <Card>
          <Card.Header>
            <Card.Title>默认独立错误</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <ErrorMessage>作答内容暂时无法显示，请稍后重试。</ErrorMessage>
            <Description>默认错误文案独立展示，不发起请求。</Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>长中文错误</Card.Title>
          </Card.Header>
          <Card.Content>
            <ErrorMessage>
              这份作答的评分参考还没有完成核对。请先保留学生原始回答和当前填写的反馈，再确认评分依据是否与题目要求一致；确认完成前不要将模拟结果视为已经发布的成绩。本段用于观察中文自动换行和容器内的完整显示。
            </ErrorMessage>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>集合的条件错误与禁用选项</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <TagGroup
              selectedKeys={selected}
              selectionMode="multiple"
              onSelectionChange={setSelected}
            >
              <Label>反馈分类至少选一项</Label>
              <TagGroup.List>
                <Tag id="evidence">补充论据</Tag>
                <Tag id="expression">表达清晰</Tag>
                <Tag isDisabled id="unavailable">
                  暂不可选分类
                </Tag>
              </TagGroup.List>
              <Description>
                选择可用分类后，下面的错误提示消失；取消所有选择后重新出现。
              </Description>
              {isInvalid ? <ErrorMessage>请至少选择一个可用反馈分类。</ErrorMessage> : null}
            </TagGroup>
            <Button variant="secondary" onPress={() => setSelected(new Set())}>
              清空反馈分类
            </Button>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}

export const Overlays: Story = {
  name: "浮层与长中文",
  render: () => <OverlaySamples />,
};

export const ErrorMessages: Story = {
  name: "错误提示状态",
  render: () => <ErrorMessageSamples />,
};
