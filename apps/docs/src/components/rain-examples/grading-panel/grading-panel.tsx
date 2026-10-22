"use client";

import type {Draft, GradingFilter} from "./grading-panel.model";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Popover,
  ProgressBar,
  Select,
  Separator,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import React, {useRef, useState} from "react";

import {
  MAX_SCORE,
  createGradingState,
  feedbackPhrases,
  filterSubmissions,
  nextPendingId,
  submissions,
  submitReview,
  updateDraft,
  validateDraft,
} from "./grading-panel.model";
import {gradingPanelStyles} from "./grading-panel.styles";

const styles = gradingPanelStyles();
const filters = [
  {id: "all", label: "全部作答"},
  {id: "pending", label: "待批改"},
  {id: "graded", label: "已批改"},
];
const rubric = [
  {description: "区分需求集中与处理能力，解释排队形成的原因。", points: "8 分", title: "问题理解"},
  {description: "提出可量化指标，并考虑比较条件。", points: "6 分", title: "证据与分析"},
  {description: "方案可执行，说明如何检验效果及潜在影响。", points: "6 分", title: "改进方案"},
];

export function GradingPanel() {
  const [state, setState] = useState(createGradingState);
  const [selectedId, setSelectedId] = useState(submissions[0]!.id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GradingFilter>("all");
  const [attemptedId, setAttemptedId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{id: string; name: string; draft: Draft} | null>(
    null,
  );
  const [advance, setAdvance] = useState(true);
  const [phrasesOpen, setPhrasesOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const scoreInput = useRef<HTMLInputElement>(null);
  const commentInput = useRef<HTMLTextAreaElement>(null);
  const visible = filterSubmissions(state, query, filter);
  const current = visible.find(({id}) => id === selectedId) ?? visible[0];
  const draft = current ? state.drafts[current.id] : undefined;
  const reviewed = !!current && !!state.reviews[current.id];
  const completed = Object.keys(state.reviews).length;
  const errors = current && draft && attemptedId === current.id ? validateDraft(draft) : {};

  function edit(patch: Partial<Draft>) {
    if (!current) return;
    setState((previous) => updateDraft(previous, current.id, patch));
  }

  function requestSubmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || !draft || reviewed) return;
    setAttemptedId(current.id);
    const issues = validateDraft(draft);

    if (issues.score || issues.comment) {
      (issues.score ? scoreInput : commentInput).current?.focus();

      return;
    }
    setConfirmation({draft: {...draft}, id: current.id, name: current.name});
  }

  function confirmSubmission() {
    if (!confirmation) return;
    const next = submitReview(state, confirmation.id);
    const nextId = nextPendingId(next, confirmation.id, query);

    setState(next);
    setAttemptedId(null);
    setConfirmation(null);
    if ((advance || filter === "pending") && nextId) setSelectedId(nextId);
    const nextStudent = submissions.find(({id}) => id === nextId);

    setAnnouncement(
      `已提交${confirmation.name}的示例批改，得分 ${confirmation.draft.score} / ${MAX_SCORE}。${(advance || filter === "pending") && nextStudent ? `已切换到${nextStudent.name}。` : ""}`,
    );
  }

  return (
    <section aria-label="批改面板业务示例" className={styles.root()}>
      <header className={styles.header()}>
        <div className={styles.heading()}>
          <div className={styles.inline()}>
            <Chip color="accent" variant="soft">
              课堂练习 03
            </Chip>
            <span className={styles.caption()}>经济学导论 · 一班</span>
          </div>
          <Typography.Heading level={2}>课堂练习批改</Typography.Heading>
          <p className={styles.muted()}>校园食堂排队：从现象到可检验的方案</p>
        </div>
        <ProgressBar
          aria-label="批改进度"
          className={styles.progress()}
          maxValue={submissions.length}
          value={completed}
        >
          <Label>批改进度</Label>
          <span className={styles.muted()}>
            {completed} / {submissions.length} 份
          </span>
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </header>

      <div
        aria-atomic="true"
        aria-live="polite"
        className={announcement ? styles.notice() : undefined}
        role="status"
      >
        {!!announcement && (
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>示例批改已提交</Alert.Title>
              <Alert.Description>{announcement}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </div>

      <div className={styles.grid()}>
        <Card className={styles.sidebar()}>
          <Card.Header>
            <Card.Title>学生作答</Card.Title>
            <Card.Description>
              {submissions.length - completed} 份待批改 · {completed} 份已批改
            </Card.Description>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <TextField aria-label="搜索学生" value={query} onChange={setQuery}>
              <Input placeholder="搜索姓名或示例编号" />
            </TextField>
            <Select
              aria-label="筛选批改状态"
              value={filter}
              onChange={(value) => {
                if (value) setFilter(value as GradingFilter);
                setAttemptedId(null);
              }}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {filters.map(({id, label}) => (
                    <ListBox.Item key={id} id={id} textValue={label}>
                      {label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <Separator />
            {visible.length > 0 ? (
              <ListBox
                disallowEmptySelection
                aria-label="选择学生作答"
                className={styles.list()}
                selectedKeys={current ? new Set([current.id]) : new Set()}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const key = Array.from(keys)[0];

                  if (key !== undefined) {
                    setSelectedId(String(key));
                    setAttemptedId(null);
                  }
                }}
              >
                {visible.map((student) => {
                  const review = state.reviews[student.id];
                  const done = !!review;
                  const hasDraft = !!(
                    state.drafts[student.id]?.score || state.drafts[student.id]?.comment
                  );

                  return (
                    <ListBox.Item
                      key={student.id}
                      id={student.id}
                      textValue={`${student.name} ${student.number} ${done ? "已批改" : hasDraft ? "草稿" : "待批改"}`}
                    >
                      <Avatar size="sm">
                        <Avatar.Fallback>{student.name[0]}</Avatar.Fallback>
                      </Avatar>
                      <div className={styles.student()}>
                        <Label>{student.name}</Label>
                        <Description>
                          {student.number} ·{" "}
                          {review ? `${review.score} 分` : hasDraft ? "草稿" : "待批改"}
                        </Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                })}
              </ListBox>
            ) : (
              <p className={styles.muted()}>没有符合条件的作答。</p>
            )}
          </Card.Content>
        </Card>

        {current && draft ? (
          <>
            <div className={styles.stack()}>
              <Card variant="secondary">
                <Card.Header>
                  <div className={styles.row()}>
                    <Card.Title>简答题 · 满分 {MAX_SCORE} 分</Card.Title>
                    <Popover>
                      <Button size="sm" variant="tertiary">
                        评分参考
                      </Button>
                      <Popover.Content className={styles.popover()}>
                        <Popover.Dialog>
                          <Popover.Heading>评分参考</Popover.Heading>
                          <div className={styles.rubric()}>
                            {rubric.map((item) => (
                              <div key={item.title}>
                                <div className={styles.rubricItem()}>
                                  <Label>{item.title}</Label>
                                  <span className={styles.caption()}>{item.points}</span>
                                </div>
                                <Description>{item.description}</Description>
                              </div>
                            ))}
                          </div>
                        </Popover.Dialog>
                      </Popover.Content>
                    </Popover>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Typography.Paragraph>
                    请用供需变化解释校园食堂午餐排队的现象，并提出一项可以检验效果的改进方案。
                  </Typography.Paragraph>
                  <p className={styles.caption()}>评价重点：原因解释、观察证据与方案可行性。</p>
                </Card.Content>
              </Card>
              <Card>
                <Card.Header>
                  <div className={styles.row()}>
                    <div>
                      <Card.Title>{current.name}的作答</Card.Title>
                      <Card.Description>
                        {current.number} · 10 月 19 日 {current.submittedAt} 提交
                      </Card.Description>
                    </div>
                    <Chip color={reviewed ? "success" : "warning"} variant="soft">
                      {reviewed ? "已批改" : "待批改"}
                    </Chip>
                  </div>
                </Card.Header>
                <Separator />
                <Card.Content>
                  <article aria-label={`${current.name}的作答内容`} className={styles.article()}>
                    {current.paragraphs.map((paragraph) => (
                      <p key={paragraph} className={styles.answer()}>
                        {paragraph}
                      </p>
                    ))}
                  </article>
                </Card.Content>
                <Card.Footer>
                  <span className={styles.caption()}>
                    文字作答 · {current.paragraphs.join("").length} 字
                  </span>
                </Card.Footer>
              </Card>
            </div>

            <Card className={styles.formCard()}>
              <Card.Header>
                <div className={styles.row()}>
                  <Card.Title>批改与反馈</Card.Title>
                  <Chip color={reviewed ? "success" : "default"} variant="soft">
                    {reviewed ? "已提交" : draft.score || draft.comment ? "本页草稿" : "待填写"}
                  </Chip>
                </div>
                <Card.Description>
                  {current.name} · {current.number}
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <Form
                  className={styles.stack()}
                  validationBehavior="aria"
                  onSubmit={requestSubmission}
                >
                  <TextField
                    isRequired
                    isInvalid={!!errors.score}
                    isReadOnly={reviewed}
                    name="score"
                    value={draft.score}
                    onChange={(score) => edit({score})}
                  >
                    <Label>得分</Label>
                    <Input ref={scoreInput} inputMode="decimal" placeholder={`0–${MAX_SCORE}`} />
                    <Description>满分 {MAX_SCORE} 分，支持 0.5 分。</Description>
                    <FieldError>{errors.score}</FieldError>
                  </TextField>
                  <TextField
                    isRequired
                    isInvalid={!!errors.comment}
                    isReadOnly={reviewed}
                    name="comment"
                    value={draft.comment}
                    onChange={(comment) => edit({comment})}
                  >
                    <Label>给学生的反馈</Label>
                    <TextArea
                      ref={commentInput}
                      maxLength={500}
                      placeholder="指出做得好的地方，以及下一步可以改进什么。"
                      rows={5}
                    />
                    <Description>{draft.comment.length} / 500 字</Description>
                    <FieldError>{errors.comment}</FieldError>
                  </TextField>
                  <Popover isOpen={phrasesOpen} onOpenChange={setPhrasesOpen}>
                    <Button isDisabled={reviewed} type="button" variant="secondary">
                      插入评语短语
                    </Button>
                    <Popover.Content className={styles.popover()}>
                      <Popover.Dialog>
                        <Popover.Heading>常用评语</Popover.Heading>
                        <div className={styles.phrases()}>
                          {feedbackPhrases.map((phrase) => (
                            <Button
                              key={phrase}
                              className={styles.phrase()}
                              type="button"
                              variant="tertiary"
                              isDisabled={
                                draft.comment.length + phrase.length + (draft.comment ? 1 : 0) > 500
                              }
                              onPress={() => {
                                edit({
                                  comment: draft.comment ? `${draft.comment}\n${phrase}` : phrase,
                                });
                                setPhrasesOpen(false);
                              }}
                            >
                              {phrase}
                            </Button>
                          ))}
                        </div>
                      </Popover.Dialog>
                    </Popover.Content>
                  </Popover>
                  <Separator />
                  <Checkbox isDisabled={reviewed} isSelected={advance} onChange={setAdvance}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Label>提交后切换下一份待批改作答</Label>
                    </Checkbox.Content>
                  </Checkbox>
                  <Button isDisabled={reviewed} type="submit">
                    {reviewed ? "已提交（示例）" : "提交批改"}
                  </Button>
                  {!!reviewed && (
                    <Button
                      isDisabled={!nextPendingId(state, current.id, query)}
                      type="button"
                      variant="secondary"
                      onPress={() => {
                        const next = nextPendingId(state, current.id, query);

                        if (next) {
                          setFilter("pending");
                          setSelectedId(next);
                        }
                      }}
                    >
                      继续批改下一份
                    </Button>
                  )}
                </Form>
              </Card.Content>
              <Card.Footer>
                <p className={styles.caption()}>
                  {reviewed
                    ? "本示例中已提交结果仅供回看。"
                    : "切换学生会保留本页草稿；确认后才计入已批改。"}
                </p>
              </Card.Footer>
            </Card>
          </>
        ) : (
          <Card className={styles.empty()}>
            <Card.Content className={styles.emptyContent()}>
              <Card.Title>
                {!query && filter === "pending" ? "待批改作答已清空" : "没有找到对应作答"}
              </Card.Title>
              <Card.Description>
                {!query && filter === "pending"
                  ? "可以切换到全部作答，回看已提交的结果。"
                  : "试试其他姓名，或清除筛选查看全部作答。"}
              </Card.Description>
              <Button
                variant="secondary"
                onPress={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                查看全部作答
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
      <p className={styles.footer()}>
        交互示例 · 全部为虚构数据，仅保留在当前页面。刷新会重置，不会发送给学生。
      </p>

      <Modal.Backdrop
        isOpen={!!confirmation}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger aria-label="关闭提交确认" />
            <Modal.Header>
              <Modal.Heading>确认提交这份批改？</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {!!confirmation && (
                <div className={styles.confirmation()}>
                  <dl className={styles.summary()}>
                    <dt>学生</dt>
                    <dd>{confirmation.name}</dd>
                    <dt>得分</dt>
                    <dd>
                      {confirmation.draft.score} / {MAX_SCORE}
                    </dd>
                  </dl>
                  <Separator />
                  <Label>反馈内容</Label>
                  <p className={styles.feedback()}>{confirmation.draft.comment}</p>
                  <Description>这是本页模拟提交，不会发布成绩或通知学生。</Description>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                返回修改
              </Button>
              <Button onPress={confirmSubmission}>确认提交</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </section>
  );
}
