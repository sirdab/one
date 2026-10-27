import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "../alert";

describe("Alert", () => {
  it("reports with the subtle banner pair, never a fill that commands", () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Return fee</AlertTitle>
        <AlertDescription>Deducted from the refund.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("note");
    expect(alert.className).toContain("bg-warning-subtle");
    expect(alert.className).toContain("text-foreground");
    expect(alert.className).not.toContain("bg-warning ");
    expect(screen.getByText("Return fee").className).toContain("text-label");
  });

  it("lets the caller choose when to announce an error", () => {
    const { rerender } = render(<Alert>Context</Alert>);
    expect(screen.getByRole("note")).not.toBeNull();
    rerender(
      <Alert variant="destructive" role="alert">
        Failed
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-destructive-subtle");
    expect(alert.className).toContain("text-foreground");
  });

  it("lets a caller override the role", () => {
    render(<Alert role="note">Quiet</Alert>);
    expect(screen.getByRole("note")).not.toBeNull();
  });
});
