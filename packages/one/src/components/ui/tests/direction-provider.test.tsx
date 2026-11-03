import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DirectionProvider } from "../../../provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

describe("DirectionProvider", () => {
  it("makes Select trigger and listbox RTL", () => {
    render(
      <DirectionProvider dir="rtl">
        <Select open defaultValue="a">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">أ</SelectItem>
          </SelectContent>
        </Select>
      </DirectionProvider>,
    );
    expect(
      document
        .querySelector('[data-slot="select-trigger"]')
        ?.getAttribute("dir"),
    ).toBe("rtl");
    expect(
      document.querySelector('[role="listbox"]')?.getAttribute("dir"),
    ).toBe("rtl");
  });

  it("makes DropdownMenu content RTL", () => {
    render(
      <DirectionProvider dir="rtl">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>خيارات</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>تعديل</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DirectionProvider>,
    );
    expect(document.querySelector('[role="menu"]')?.getAttribute("dir")).toBe(
      "rtl",
    );
  });

  it("stays LTR for English", () => {
    render(
      <DirectionProvider dir="ltr">
        <Select open defaultValue="a">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </DirectionProvider>,
    );
    expect(
      document
        .querySelector('[data-slot="select-trigger"]')
        ?.getAttribute("dir"),
    ).toBe("ltr");
  });
});
