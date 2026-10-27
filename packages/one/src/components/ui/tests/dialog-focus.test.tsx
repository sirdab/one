import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Input } from "../input";

function Confirm({
  children,
  primary = <Button>Delete</Button>,
}: {
  children?: React.ReactNode;
  primary?: React.ReactNode;
}): React.JSX.Element {
  return (
    <Dialog open>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete this product?</DialogTitle>
        {children}
        <DialogFooter>
          <Button variant="secondary">Cancel</Button>
          {primary}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog focus on open", () => {
  it("lands on the primary action, so Enter confirms", async () => {
    render(<Confirm />);
    const primary = await screen.findByRole("button", { name: "Delete" });
    expect(document.activeElement).toBe(primary);
  });

  it("counts a destructive button as the primary", async () => {
    render(<Confirm primary={<Button variant="destructive">Remove</Button>} />);
    expect(document.activeElement).toBe(
      await screen.findByRole("button", { name: "Remove" }),
    );
  });

  it("leaves a dialog with a field on the field", async () => {
    render(
      <Confirm>
        <Input aria-label="Reason" />
      </Confirm>,
    );
    expect(document.activeElement).toBe(
      await screen.findByRole("textbox", { name: "Reason" }),
    );
  });

  it("skips a primary that cannot act", async () => {
    render(<Confirm primary={<Button disabled>Delete</Button>} />);
    await screen.findByRole("button", { name: "Cancel" });
    expect(document.activeElement).not.toBe(
      screen.getByRole("button", { name: "Delete" }),
    );
  });
});

describe("a dialog opened from a menu item", () => {
  function MenuThenConfirm(): React.JSX.Element {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>More</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setOpen(true)}
            >
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  it("lands on the dialog's primary once the menu has closed", async () => {
    render(<MenuThenConfirm />);
    const trigger = screen.getByRole("button", { name: "More" });
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Delete product" }),
    );
    const primary = await screen.findByRole("button", { name: "Delete" });
    await waitFor(() => expect(document.activeElement).toBe(primary));
  });
});
