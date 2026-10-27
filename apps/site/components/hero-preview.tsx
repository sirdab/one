"use client";

import { useId, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Direction } from "radix-ui";
import { Badge } from "@sirdab/one/components/badge";
import { Button } from "@sirdab/one/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sirdab/one/components/card";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import { Segmented, SegmentedItem } from "@sirdab/one/components/segmented";
import { Switch } from "@sirdab/one/components/switch";

export function HeroPreview(): React.JSX.Element {
  const id: string = useId();
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [name, setName] = useState<string>("Sirdab Studio");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);
  const arabic: boolean = direction === "rtl";
  function save(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <div className="hero-preview">
      <div className="preview-toolbar">
        <span>Made with One</span>
        <Segmented
          value={direction}
          onValueChange={(value: string): void =>
            setDirection(value === "rtl" ? "rtl" : "ltr")
          }
          aria-label="Preview language and direction"
        >
          <SegmentedItem value="ltr" label="English" />
          <SegmentedItem value="rtl" label="العربية" lang="ar" />
        </Segmented>
      </div>
      <Direction.Provider dir={direction}>
        <div
          dir={direction}
          lang={arabic ? "ar" : "en"}
          className="preview-canvas"
        >
          <div className="preview-heading">
            <div>
              <p className="text-caption-quiet text-muted-foreground">
                {arabic
                  ? "مساحتك، على طريقتك"
                  : "A little space to make your own"}
              </p>
              <h2 className="text-heading-sm">
                {arabic ? "إعدادات المساحة" : "Workspace settings"}
              </h2>
            </div>
            <Badge tone="success">{arabic ? "نشطة" : "Active"}</Badge>
          </div>
          <form onSubmit={save}>
            <Card>
              <CardHeader>
                <CardTitle>{arabic ? "التفاصيل" : "The details"}</CardTitle>
                <CardDescription>
                  {arabic
                    ? "كل شيء يبدأ باسم."
                    : "Every good workspace starts with a name."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`${id}-name`}>
                    {arabic ? "اسم المساحة" : "Workspace name"}
                  </Label>
                  <Input
                    id={`${id}-name`}
                    value={name}
                    required
                    onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                      setName(event.target.value);
                      setSaved(false);
                    }}
                  />
                </div>
                <div className="preview-switch-row">
                  <div>
                    <Label htmlFor={`${id}-notifications`}>
                      {arabic ? "تنبيهات الفريق" : "Team notifications"}
                    </Label>
                    <p
                      className="text-caption-quiet text-muted-foreground"
                      id={`${id}-hint`}
                    >
                      {arabic
                        ? "آخر أخبار الفريق في مكان واحد."
                        : "Keep the latest from your team close by."}
                    </p>
                  </div>
                  <Switch
                    id={`${id}-notifications`}
                    checked={notifications}
                    aria-describedby={`${id}-hint`}
                    onCheckedChange={(checked: boolean): void => {
                      setNotifications(checked);
                      setSaved(false);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="preview-save-row">
              <p
                role="status"
                className="text-caption-quiet text-muted-foreground"
              >
                {saved
                  ? arabic
                    ? "تم الحفظ في هذا العرض."
                    : "Saved in this preview."
                  : arabic
                    ? "جرّبها. هذه مساحة للتجربة."
                    : "Try it. This space is yours to play with."}
              </p>
              <Button type="submit">
                {arabic ? "حفظ التغييرات" : "Save changes"}
              </Button>
            </div>
          </form>
          <div className="preview-anatomy" lang="en" dir="ltr">
            <span>Card</span>
            <span>Input</span>
            <span>Switch</span>
            <span>Badge</span>
            <span>Button</span>
          </div>
        </div>
      </Direction.Provider>
    </div>
  );
}
