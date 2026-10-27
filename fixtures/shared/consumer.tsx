"use client";

import { useEffect, useState, type JSX, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Button, OneProvider } from "@sirdab/one";
import { formatField, type FieldName } from "@sirdab/one/foundation";
import { StoreAvatar } from "@sirdab/one/components/store-avatar";
import { Input } from "@sirdab/one/components/input";
import { PhoneInput } from "@sirdab/one/components/phone-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sirdab/one/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sirdab/one/components/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@sirdab/one/components/sheet";

function ThemeControls(): JSX.Element {
  const { setTheme } = useTheme();
  return (
    <div className="fixture-row" aria-label="Theme">
      <Button variant="secondary" onClick={(): void => setTheme("light")}>
        Light
      </Button>
      <Button variant="secondary" onClick={(): void => setTheme("dark")}>
        Dark
      </Button>
      <Button variant="secondary" onClick={(): void => setTheme("system")}>
        System
      </Button>
    </div>
  );
}

export function Consumer({ children }: { children?: ReactNode }): JSX.Element {
  const countField: FieldName = "quantity";
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [ready, setReady] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [choice, setChoice] = useState<string>("riyadh");
  useEffect((): void => {
    setReady(true);
  }, []);
  useEffect((): void => {
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === "rtl" ? "ar" : "en";
  }, [dir]);
  return (
    <OneProvider dir={dir}>
      <main className="fixture" data-ready={ready}>
        <h1>Sirdab One consumer</h1>
        <StoreAvatar seed="consumer-store" />
        <p lang="ar" dir="rtl">
          مكونات تناسب العربية
        </p>
        <p data-testid="riyal" dir="ltr">
          {"\u20c1"} 100
        </p>
        <output data-testid="foundation-value">
          {formatField(countField, 1234, "en-US")}
        </output>
        {children}
        <ThemeControls />
        <div className="fixture-row">
          <Button variant="secondary" onClick={(): void => setDir("ltr")}>
            English / LTR
          </Button>
          <Button variant="secondary" onClick={(): void => setDir("rtl")}>
            العربية / RTL
          </Button>
        </div>
        <Button data-testid="sized-button">Save changes</Button>
        <Input aria-label="Name" placeholder="Name" />
        <Select value={choice} onValueChange={setChoice}>
          <SelectTrigger aria-label="City">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="riyadh">Riyadh</SelectItem>
            <SelectItem value="jeddah">Jeddah</SelectItem>
            <SelectItem value="dammam">Dammam</SelectItem>
          </SelectContent>
        </Select>
        <output aria-label="Chosen city">{choice}</output>
        <PhoneInput
          aria-label="Phone number"
          countryLabelText="Country"
          locale="en"
          defaultCountry="SA"
          value={phone}
          onChange={setPhone}
        />
        <output aria-label="Phone value">{phone}</output>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Consumer dialog</DialogTitle>
              <DialogDescription>
                Dialog behavior from an installed package.
              </DialogDescription>
            </DialogHeader>
            <Input aria-label="Dialog name" />
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <Sheet side="end">
          <SheetTrigger asChild>
            <Button variant="secondary">Open drawer</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Consumer drawer</SheetTitle>
              <SheetDescription>
                A logical end drawer follows the reading direction.
              </SheetDescription>
            </SheetHeader>
            <SheetClose asChild>
              <Button>Close drawer</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </main>
    </OneProvider>
  );
}
