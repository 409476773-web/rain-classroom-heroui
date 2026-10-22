import React from "react";
import {describe, expect, it} from "vitest";
import {page, userEvent} from "vitest/browser";

import {Button} from "../../react/src/components/button";
import {Card} from "../../react/src/components/card";
import {Checkbox} from "../../react/src/components/checkbox";
import {FieldError} from "../../react/src/components/field-error";
import {Input} from "../../react/src/components/input";
import {Label} from "../../react/src/components/label";
import {ListBox} from "../../react/src/components/list-box";
import {TextArea} from "../../react/src/components/textarea";
import {TextField} from "../../react/src/components/textfield";
import {render} from "../../testing/helpers/browser";

async function settle() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await Promise.all(
    document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => {})),
  );
}

const styleOf = (element: Element) => getComputedStyle(element);

describe("Rain real component states", () => {
  for (const variant of ["primary", "secondary"] as const) {
    it(`${variant} text fields preserve hover/focus/invalid/disabled/read-only behavior`, async () => {
      await render(
        <>
          <Button>Start</Button>
          <TextField>
            <Label>Title</Label>
            <Input placeholder="Type title" variant={variant} />
          </TextField>
          <TextField isDisabled defaultValue="Locked">
            <Label>Disabled</Label>
            <Input variant={variant} />
          </TextField>
          <TextField isInvalid>
            <Label>Score</Label>
            <Input variant={variant} />
            <FieldError>Enter a valid score</FieldError>
          </TextField>
          <TextField isReadOnly defaultValue="Read only">
            <Label>Read only</Label>
            <Input variant={variant} />
          </TextField>
          <TextField isInvalid>
            <Label>Comment</Label>
            <TextArea variant={variant} />
            <FieldError>Add a comment</FieldError>
          </TextField>
        </>,
      );
      const title = page.getByRole("textbox", {name: "Title", exact: true});
      const score = page.getByRole("textbox", {name: "Score", exact: true});
      const disabled = page.getByRole("textbox", {name: "Disabled", exact: true});

      // Pointer coordinates persist across tests; establish a real non-hover baseline.
      await page.getByRole("button", {name: "Start"}).hover();

      await settle();
      const originalBackground = styleOf(title.element()).backgroundColor;

      await title.hover();
      await settle();
      expect(styleOf(title.element()).backgroundColor).not.toBe(originalBackground);
      await page.getByRole("button", {name: "Start"}).click();
      await userEvent.tab();
      await expect.element(title).toHaveFocus();
      await settle();
      expect(styleOf(title.element()).boxShadow).toContain("rgb(61, 123, 255)");
      expect(styleOf(title.element()).borderRadius).toBe("6px");
      await userEvent.keyboard("Draft");
      await expect.element(title).toHaveValue("Draft");
      await userEvent.tab();
      await expect.element(score).toHaveFocus();
      await expect.element(disabled).toBeDisabled();
      expect(styleOf(disabled.element()).opacity).toBe("0.5");
      await settle();
      await expect.element(score).toHaveAttribute("aria-invalid", "true");
      expect(styleOf(score.element()).outlineColor).toBe("rgb(181, 42, 54)");
      expect(styleOf(score.element()).boxShadow).toContain("rgb(181, 42, 54)");
      await expect.element(page.getByText("Enter a valid score")).toBeVisible();
      await userEvent.tab();
      await expect
        .element(page.getByRole("textbox", {name: "Read only", exact: true}))
        .toHaveFocus();
      await userEvent.keyboard("Changed");
      await expect
        .element(page.getByRole("textbox", {name: "Read only", exact: true}))
        .toHaveValue("Read only");
      const comment = page.getByRole("textbox", {name: "Comment"});

      await userEvent.tab();
      await expect.element(comment).toHaveFocus();
      await settle();
      expect(styleOf(comment.element()).outlineColor).toBe("rgb(181, 42, 54)");
    });
  }

  it("checkbox selection and disabled state keep their native interaction", async () => {
    await render(
      <>
        <Checkbox>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Mark complete
          </Checkbox.Content>
        </Checkbox>
        <Checkbox defaultSelected isDisabled>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Locked selection
          </Checkbox.Content>
        </Checkbox>
      </>,
    );
    const checkbox = page.getByRole("checkbox", {name: "Mark complete"});
    const disabled = page.getByRole("checkbox", {name: "Locked selection"});

    await page.getByText("Mark complete", {exact: true}).click();
    await expect.element(checkbox).toBeChecked();
    await settle();
    const control = document.querySelector('[data-slot="checkbox-control"]')!;

    expect(getComputedStyle(control, "::before").backgroundColor).toBe("rgb(15, 82, 220)");
    expect(getComputedStyle(control, "::before").opacity).toBe("1");
    expect(
      styleOf(document.querySelector('[data-slot="checkbox-default-indicator--checkmark"]')!).color,
    ).toBe("rgb(255, 255, 255)");
    expect(styleOf(control).borderRadius).toBe("6px");
    await userEvent.keyboard(" ");
    await expect.element(checkbox).not.toBeChecked();
    await expect.element(disabled).toBeDisabled();
    await expect.element(disabled).toBeChecked();
  });

  it("list keyboard navigation skips disabled rows, selected indicator survives; cards keep surface variants", async () => {
    await render(
      <>
        <Button>Before list</Button>
        <ListBox aria-label="Submissions" disabledKeys={["locked"]} selectionMode="single">
          <ListBox.Item id="first" textValue="First">
            First
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="locked" textValue="Locked">
            Locked
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="last" textValue="Last">
            Last
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
        <Card data-testid="card-default" variant="default">
          <Card.Content>Default card</Card.Content>
        </Card>
        <Card data-testid="card-secondary" variant="secondary">
          <Card.Content>Secondary card</Card.Content>
        </Card>
        <Card data-testid="card-tertiary" variant="tertiary">
          <Card.Content>Tertiary card</Card.Content>
        </Card>
      </>,
    );
    await page.getByRole("button", {name: "Before list"}).click();
    await userEvent.tab();
    await expect.element(page.getByRole("option", {name: "First"})).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const last = page.getByRole("option", {name: "Last"});

    await expect.element(last).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(last).toHaveAttribute("aria-selected", "true");
    await expect
      .element(page.getByRole("option", {name: "Locked"}))
      .toHaveAttribute("aria-disabled", "true");
    await settle();
    expect(styleOf(last.element()).boxShadow).toContain("rgb(61, 123, 255)");
    const indicator = last.element().querySelector('[data-slot="list-box-item-indicator"]')!;

    expect(indicator.getAttribute("data-visible")).toBe("true");
    expect(styleOf(indicator.querySelector("svg")!).strokeDashoffset).toBe("44px");
    for (const [variant, color] of [
      ["default", "rgb(255, 255, 255)"],
      ["secondary", "rgb(250, 252, 255)"],
      ["tertiary", "rgb(237, 243, 250)"],
    ]) {
      const style = styleOf(page.getByTestId(`card-${variant}`).element());

      expect(style.borderRadius).toBe("16px");
      expect(style.backgroundColor).toBe(color);
    }
  });
});
