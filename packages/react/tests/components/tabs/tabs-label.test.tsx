import {act, render, screen, setupUser} from "@heroui/testing/helpers";
import {Fragment} from "react";

import {Tabs} from "@/components/tabs";

const getLabel = (tab: HTMLElement) => {
  const label = tab.querySelector<HTMLSpanElement>('[data-slot="tabs-label"]');

  expect(label).not.toBeNull();

  return label!;
};

const setLabelWidths = (label: HTMLSpanElement, clientWidth: number, scrollWidth: number) => {
  Object.defineProperties(label, {
    clientWidth: {configurable: true, value: clientWidth},
    scrollWidth: {configurable: true, value: scrollWidth},
  });
};

describe("Tabs label", () => {
  it("exposes the complete truncated label on hover and removes it on leave", async () => {
    const user = setupUser();
    const name = "课堂练习批改记录与学生完整反馈信息";

    render(
      <Tabs>
        <Tabs.List aria-label="练习页面">
          <Tabs.Tab id="feedback">
            {name}
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="feedback">反馈内容</Tabs.Panel>
      </Tabs>,
    );
    await act(async () => {
      await Promise.resolve();
    });

    const tab = screen.getByRole("tab", {name});
    const label = getLabel(tab);

    setLabelWidths(label, 100, 280);
    expect(label).not.toHaveAttribute("title");
    await user.hover(label);

    expect(label).toHaveAttribute("title", name);
    expect(tab).toHaveAccessibleName(name);
    await user.unhover(label);
    expect(label).not.toHaveAttribute("title");
    expect(tab).toHaveAccessibleName(name);
  });

  it("does not add a hover title when the complete label fits", async () => {
    const user = setupUser();

    render(
      <Tabs>
        <Tabs.List aria-label="短页面名称">
          <Tabs.Tab id="overview">
            概览
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="overview">概览内容</Tabs.Panel>
      </Tabs>,
    );
    await act(async () => {
      await Promise.resolve();
    });

    const label = getLabel(screen.getByRole("tab", {name: "概览"}));

    setLabelWidths(label, 100, 100);
    await user.hover(label);
    expect(label).not.toHaveAttribute("title");
    await user.unhover(label);
    expect(label).not.toHaveAttribute("title");
  });

  it("supports render props and fragments while preserving indicators and disabled navigation", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    const name = "课堂完整作答反馈";
    const disabledName = "暂不可用的历史批改记录";

    render(
      <Tabs defaultSelectedKey="feedback" onSelectionChange={onSelectionChange}>
        <Tabs.List aria-label="反馈页面">
          <Tabs.Tab id="feedback">
            {({isSelected}) => (
              <>
                <Fragment>{name}</Fragment>
                {2026}
                <Tabs.Indicator />
                <span aria-hidden="true" data-testid="render-state">
                  {isSelected ? "已选" : "未选"}
                </span>
              </>
            )}
          </Tabs.Tab>
          <Tabs.Tab isDisabled id="disabled">
            <Fragment>{disabledName}</Fragment>
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="available">
            后续反馈
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel id="feedback">当前反馈</Tabs.Panel>
        <Tabs.Panel id="disabled">历史反馈</Tabs.Panel>
        <Tabs.Panel id="available">后续反馈内容</Tabs.Panel>
      </Tabs>,
    );
    await act(async () => {
      await Promise.resolve();
    });

    const activeTab = screen.getByRole("tab", {name: /课堂完整作答反馈\s*2026/});
    const disabledTab = screen.getByRole("tab", {name: disabledName});
    const labels = activeTab.querySelectorAll<HTMLSpanElement>('[data-slot="tabs-label"]');

    expect(labels).toHaveLength(1);
    const label = getLabel(activeTab);

    expect(label).toHaveTextContent(`${name}2026`);
    setLabelWidths(label, 80, 240);
    await user.hover(label);
    expect(label).toHaveAttribute("title", `${name}2026`);
    await user.unhover(label);
    expect(label).not.toHaveAttribute("title");
    expect(activeTab.querySelector('[data-slot="tabs-indicator"]')).not.toBeNull();
    expect(screen.getByTestId("render-state")).toHaveTextContent("已选");
    expect(screen.getByTestId("render-state")).not.toHaveAttribute("data-slot", "tabs-label");
    const disabledLabel = getLabel(disabledTab);

    setLabelWidths(disabledLabel, 80, 240);
    await user.hover(disabledLabel);
    expect(disabledLabel).toHaveAttribute("title", disabledName);
    expect(disabledTab).toHaveAttribute("aria-disabled", "true");
    await user.click(disabledTab);
    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).not.toHaveBeenCalledWith("disabled");

    await act(async () => activeTab.focus());
    await user.keyboard("{ArrowRight}");
    const availableTab = screen.getByRole("tab", {name: "后续反馈"});

    expect(availableTab).toHaveFocus();
    expect(availableTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("render-state")).toHaveTextContent("未选");
  });
});
