import {describe, expect, it} from "vitest";

import {
  createGradingState,
  filterSubmissions,
  nextPendingId,
  submitReview,
  updateDraft,
  validateDraft,
} from "../src/components/rain-examples/grading-panel/grading-panel.model";

const state = () => ({
  drafts: {a: {comment: "请补充论据。", score: "0"}, b: {comment: "", score: ""}},
  reviews: {},
});

describe("grading panel business state", () => {
  it("filters by search and committed status, including an empty search result", () => {
    const current = createGradingState();

    expect(filterSubmissions(current, "", "pending")).toHaveLength(4);
    expect(filterSubmissions(current, "", "graded")).toHaveLength(2);
    expect(filterSubmissions(current, " 林 ", "all").map(({id}) => id)).toEqual(["s01"]);
    expect(filterSubmissions(current, "示例 06", "pending")).toEqual([]);
    expect(filterSubmissions(current, "不存在的学生", "all")).toEqual([]);
  });

  it("advances among matching pending students, wraps, and stops when none remain", () => {
    const current = createGradingState();

    expect(nextPendingId(current, "s01", "")).toBe("s02");
    expect(nextPendingId(current, "s04", "")).toBe("s01");
    expect(nextPendingId(current, "s01", "周")).toBe("s03");
    expect(nextPendingId(current, "s01", "吴")).toBeUndefined();
    const completed = {...current, reviews: {...current.drafts}};

    expect(nextPendingId(completed, "s01", "")).toBeUndefined();
    expect(filterSubmissions(completed, "", "pending")).toEqual([]);
  });

  it("new instances reset to independent fictional data", () => {
    const first = createGradingState();
    const changed = updateDraft(first, "s01", {score: "19"});
    const second = createGradingState();

    expect(changed.drafts["s01"]?.score).toBe("19");
    expect(second.drafts["s01"]?.score).toBe("");
    expect(second.drafts["s05"]).not.toBe(second.reviews["s05"]);
  });
  it("rejects missing, non-numeric, out-of-range and unsupported precision scores", () => {
    for (const score of ["", " ", "-1", "20.5", "abc", "Infinity", "0x10", "12.25"]) {
      expect(validateDraft({comment: "内容反馈", score}).score, score).toBeTruthy();
    }
    for (const score of ["0", "0.5", "16.5", "20", " 18 "]) {
      expect(validateDraft({comment: "内容反馈", score}).score, score).toBeUndefined();
    }
  });

  it("requires meaningful feedback and limits its length", () => {
    expect(validateDraft({comment: "  ", score: "18"}).comment).toBeTruthy();
    expect(validateDraft({comment: "评".repeat(501), score: "18"}).comment).toBeTruthy();
    expect(validateDraft({comment: "评".repeat(500), score: "18"}).comment).toBeUndefined();
  });

  it("keeps drafts isolated between students without mutating the source", () => {
    const before = state();
    const next = updateDraft(before, "b", {comment: "推导完整。", score: "17"});

    expect(next.drafts["b"]).toEqual({comment: "推导完整。", score: "17"});
    expect(next.drafts["a"]).toEqual(before.drafts.a);
    expect(before.drafts.b.score).toBe("");
    expect(next.reviews).toEqual({});
  });

  it("rejects an invalid draft without changing progress", () => {
    const before = state();

    expect(submitReview(before, "b")).toBe(before);
    expect(submitReview(before, "missing")).toBe(before);
  });

  it("commits a valid zero score only on explicit submission", () => {
    const before = state();
    const next = submitReview(before, "a");

    expect(next.reviews["a"]).toEqual(before.drafts.a);
    expect(before.reviews).toEqual({});
    expect(Object.keys(next.reviews)).toHaveLength(1);
    expect(submitReview(next, "a")).toBe(next);
  });

  it("keeps submitted reviews read-only and ignores unknown student keys", () => {
    const submitted = {...state(), reviews: {a: {comment: "请补充论据。", score: "0"}}};

    expect(updateDraft(submitted, "a", {score: "19"})).toBe(submitted);
    expect(updateDraft(submitted, "missing", {score: "19"})).toBe(submitted);
  });
});
