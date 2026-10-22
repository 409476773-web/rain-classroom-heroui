export interface Draft {
  score: string;
  comment: string;
}

export interface GradingState {
  drafts: Record<string, Draft>;
  reviews: Record<string, Draft>;
}

export const MAX_SCORE = 20;

export function validateDraft(draft: Draft): {score?: string; comment?: string} {
  const errors: {score?: string; comment?: string} = {};
  const raw = draft.score.trim();
  const score = Number(raw);

  if (
    !/^\d+(?:\.\d+)?$/.test(raw) ||
    !Number.isFinite(score) ||
    score > MAX_SCORE ||
    score % 0.5 !== 0
  ) {
    errors.score = `请输入 0–${MAX_SCORE} 分，支持 0.5 分。`;
  }
  if (!draft.comment.trim()) errors.comment = "请填写给学生的反馈。";
  else if (draft.comment.length > 500) errors.comment = "评语不能超过 500 字。";

  return errors;
}

export function updateDraft(state: GradingState, id: string, patch: Partial<Draft>): GradingState {
  if (!state.drafts[id] || state.reviews[id]) return state;

  return {...state, drafts: {...state.drafts, [id]: {...state.drafts[id], ...patch}}};
}

export function submitReview(state: GradingState, id: string): GradingState {
  const draft = state.drafts[id];

  if (!draft || state.reviews[id] || Object.keys(validateDraft(draft)).length) return state;

  return {...state, reviews: {...state.reviews, [id]: {...draft, comment: draft.comment.trim()}}};
}

// Fictional local fixtures. No student information or grading service is connected.
export const submissions = [
  {
    id: "s01",
    name: "林同学",
    number: "示例 01",
    paragraphs: [
      "午餐高峰时，课程在相近时间结束，短时间内到达食堂的人数增加，而窗口的出餐速度暂时不变，因此会形成排队。队伍变长并不一定代表全天供给不足。",
      "可以记录每 5 分钟的到达人数、窗口出餐量和平均等待时间，判断瓶颈主要来自点餐、支付还是取餐。只看队伍长度，可能忽略各窗口处理速度的差异。",
      "建议先在一个窗口试行预点餐与独立取餐通道，对比试行前后一周相同时间段的平均等待时间，同时记录未使用预点餐的同学是否等待更久。",
    ],
    submittedAt: "10:42",
  },
  {
    id: "s02",
    name: "陈同学",
    number: "示例 02",
    paragraphs: [
      "中午大家同时下课，食堂窗口数量没有增加，需求在短时间里超过处理能力，形成拥堵。",
      "我建议增加一个窗口，并统计改造前后的排队时间。如果只记录一天，可能受当天菜单和天气影响，所以应该连续观察多天。",
    ],
    submittedAt: "10:38",
  },
  {
    id: "s03",
    name: "周同学",
    number: "示例 03",
    paragraphs: [
      "食堂排队可能是供给不足，也可能是不同窗口的信息不透明。一些窗口排队很长，旁边窗口却没有人。",
      "可以在入口展示各窗口的预计等待时间。通过对照相同星期、相同时间段的等待时间和窗口利用率，判断信息展示是否有效。",
    ],
    submittedAt: "10:35",
  },
  {
    id: "s04",
    name: "许同学",
    number: "示例 04",
    paragraphs: [
      "食堂排队是因为中午人比较多。可以安排错峰下课，让大家在不同时间吃饭。",
      "我会比较实施前后同一时间的队伍长度。不过还需要考虑参与班级是否相同，以及其他同学是否受到影响。",
    ],
    submittedAt: "10:31",
  },
  {
    id: "s05",
    name: "吴同学",
    number: "示例 05",
    paragraphs: [
      "供需总量与瞬时处理能力需要分开看。即使一天的备餐总量足够，集中到达仍会超过窗口在某一分钟的处理能力。",
      "先按分钟采样到达率和服务率，再对一个窗口实施流程调整，以相邻未调整窗口作参照，比较平均及最长等待时间。",
    ],
    submittedAt: "10:27",
  },
  {
    id: "s06",
    name: "沈同学",
    number: "示例 06",
    paragraphs: [
      "排队问题来自到达时间集中与窗口处理能力有限。应先分解点餐、支付和出餐三个环节，找出最慢的一环。",
      "建议将高频菜品提前配餐。在控制菜单与样本时段的前提下，对比平均等待时间，并记录食物浪费量，避免只追求速度。",
    ],
    submittedAt: "10:24",
  },
];

export const feedbackPhrases = [
  "论点清晰，能够结合具体情境分析。",
  "建议补充可量化的观察指标。",
  "请区分现象描述与原因推断。",
];

export type GradingFilter = "all" | "pending" | "graded";

export function createGradingState(): GradingState {
  const reviews: Record<string, Draft> = {
    s05: {comment: "分析完整，注意说明参照窗口的可比性。", score: "18"},
    s06: {comment: "指标设计清楚，也考虑了方案的潜在影响。", score: "19"},
  };

  return {
    drafts: Object.fromEntries(
      submissions.map(({id}) => [id, {...(reviews[id] ?? {comment: "", score: ""})}]),
    ),
    reviews,
  };
}

export function filterSubmissions(state: GradingState, query: string, filter: GradingFilter) {
  const needle = query.trim().toLocaleLowerCase();

  return submissions.filter(
    ({id, name, number}) =>
      `${name} ${number}`.toLocaleLowerCase().includes(needle) &&
      (filter === "all" || (filter === "graded" ? !!state.reviews[id] : !state.reviews[id])),
  );
}

export function nextPendingId(state: GradingState, currentId: string, query: string) {
  const pending = filterSubmissions(state, query, "pending");
  const currentIndex = submissions.findIndex(({id}) => id === currentId);

  return (
    pending.find(({id}) => submissions.findIndex((item) => item.id === id) > currentIndex)?.id ??
    pending[0]?.id
  );
}
