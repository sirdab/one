"use client";

import { useId, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { lookbookHref } from "../lookbook/routing";
import { Direction } from "radix-ui";
import { Badge } from "@sirdab/one/components/badge";
import { Button } from "@sirdab/one/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@sirdab/one/components/card";
import { Input } from "@sirdab/one/components/input";
import { Label } from "@sirdab/one/components/label";
import { Switch } from "@sirdab/one/components/switch";
import { StoreAvatar } from "@sirdab/one/components/store-avatar";
import { Icon } from "@sirdab/one/components/icon";
import { ArrowRightIcon, CheckIcon } from "@sirdab/one/icons/catalogue";

export function ConnectedDemo(): React.JSX.Element {
  const id: string = useId();
  const [name, setName] = useState<string>("مساحتي");
  const [notifications, setNotifications] = useState<boolean>(true);
  const [created, setCreated] = useState<boolean>(false);
  const [revision, setRevision] = useState<number>(0);
  function changed(): void {
    setCreated(false);
    setRevision((value: number): number => value + 1);
  }
  function updateName(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
    changed();
  }
  function updateNotifications(value: boolean): void {
    setNotifications(value);
    changed();
  }
  function create(): void {
    if (name.trim()) {
      setCreated(true);
      setRevision((value: number): number => value + 1);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    create();
  }

  return (
    <section
      className="connected-section"
      id="see-the-flow"
      aria-label="جرّب المكوّنات"
      lang="ar"
      dir="rtl"
    >
      <div className="flow-workbench">
        <div className="flow-toolbar">
          <div className="flow-foundation-label">
            <span className="flow-brand-dot" />
            <span>جرّب المكوّنات</span>
          </div>
        </div>
        <Direction.Provider dir="rtl">
          <div className="flow-canvas" dir="rtl" lang="ar">
            <div
              className="flow-composition"
              role="group"
              aria-label="الواجهة المتكاملة"
            >
              <div className="flow-panel-heading">
                <span className="text-label">واجهة واحدة</span>
              </div>
              <Card className="flow-app">
                <CardHeader>
                  <div className="flow-app-kicker">
                    <span className="text-caption-quiet text-muted-foreground">
                      بداية جديدة
                    </span>
                    <Badge tone={created ? "success" : "attention"}>
                      {created ? "جاهزة" : "مسودة"}
                    </Badge>
                  </div>
                  <CardTitle className="text-heading-sm flow-workspace-title">
                    {name.trim() || "مساحتك"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="flow-form" onSubmit={submit}>
                    <div className="flow-field">
                      <Label htmlFor={`${id}-composed`}>اسم المساحة</Label>
                      <Input
                        id={`${id}-composed`}
                        value={name}
                        onChange={updateName}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className="flow-preference">
                      <div>
                        <Label htmlFor={`${id}-composed-notify`}>
                          تنبيهات الفريق
                        </Label>
                      </div>
                      <Switch
                        id={`${id}-composed-notify`}
                        checked={notifications}
                        onCheckedChange={updateNotifications}
                      />
                    </div>
                    <div className="flow-app-team">
                      <div className="flow-people" aria-hidden="true">
                        <StoreAvatar
                          size="sm"
                          seed="space-N"
                          storeIds={["space-N", "space-O", "space-S"]}
                        />
                        <StoreAvatar
                          size="sm"
                          seed="space-O"
                          storeIds={["space-N", "space-O", "space-S"]}
                        />
                        <StoreAvatar
                          size="sm"
                          seed="space-S"
                          storeIds={["space-N", "space-O", "space-S"]}
                        />
                      </div>
                      <span className="text-caption-quiet text-muted-foreground">
                        مساحاتكم معًا.
                      </span>
                    </div>
                    <Button type="submit" disabled={!name.trim()}>
                      {created ? (
                        <>
                          <Icon icon={CheckIcon} />
                          مساحتك جاهزة
                        </>
                      ) : (
                        "إنشاء المساحة"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="flow-connection" aria-hidden="true">
              <span />
              <i
                key={revision}
                className={revision > 0 ? "flow-signal" : undefined}
              />
              <Icon icon={ArrowRightIcon} flip />
            </div>
            <div className="flow-parts" role="group" aria-label="عناصر الواجهة">
              <div className="flow-panel-heading">
                <span className="text-label">العناصر</span>
              </div>
              <div className="flow-part">
                <Link
                  href={lookbookHref("inputs")}
                  className="flow-part-name"
                  lang="en"
                >
                  Input
                </Link>
                <Label htmlFor={`${id}-source`}>اسم المساحة</Label>
                <Input
                  id={`${id}-source`}
                  value={name}
                  onChange={updateName}
                  placeholder="اختر لها اسم"
                  maxLength={50}
                />
              </div>
              <div className="flow-part">
                <Link
                  href={lookbookHref("forms")}
                  className="flow-part-name"
                  lang="en"
                >
                  Switch
                </Link>
                <div className="flow-between">
                  <Label htmlFor={`${id}-source-notify`}>تنبيهات الفريق</Label>
                  <Switch
                    id={`${id}-source-notify`}
                    checked={notifications}
                    onCheckedChange={updateNotifications}
                  />
                </div>
              </div>
              <div className="flow-part">
                <Link
                  href={lookbookHref("badge")}
                  className="flow-part-name"
                  lang="en"
                >
                  Badge
                </Link>
                <Badge tone={created ? "success" : "attention"}>
                  {created ? "جاهزة" : "مسودة"}
                </Badge>
              </div>
              <div className="flow-part">
                <Link
                  href={lookbookHref("buttons")}
                  className="flow-part-name"
                  lang="en"
                >
                  Button
                </Link>
                <Button
                  variant="secondary"
                  onClick={create}
                  disabled={!name.trim()}
                >
                  {created ? "أنشئها مرة ثانية" : "إنشاء المساحة"}
                </Button>
              </div>
            </div>
            <div className="flow-shared">
              <span>مشتركة بين كل العناصر</span>
              <div>
                <Link href={lookbookHref("colors")}>
                  <span
                    className="flow-token-preview flow-palette"
                    aria-hidden="true"
                  >
                    {[200, 300, 400, 500, 600, 700].map(
                      (step: number): React.JSX.Element => (
                        <span
                          key={step}
                          style={{ background: `var(--brand-${step})` }}
                        />
                      ),
                    )}
                  </span>
                  الألوان
                </Link>
                <Link href={lookbookHref("typography")}>
                  <span
                    className="flow-token-preview flow-type"
                    aria-hidden="true"
                  >
                    <span lang="en">Aa</span>
                    <span>أب</span>
                  </span>
                  الخطوط
                </Link>
                <Link href={lookbookHref("spacing")}>
                  <span
                    className="flow-token-preview flow-spacing"
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  المسافات
                </Link>
                <Link href="/docs#arabic">
                  <span
                    className="flow-token-preview flow-direction"
                    aria-hidden="true"
                  >
                    <Icon icon={ArrowRightIcon} flip />
                    <Icon icon={ArrowRightIcon} />
                  </span>
                  اتجاه القراءة
                </Link>
              </div>
            </div>
          </div>
        </Direction.Provider>
        <p className={created ? "flow-status" : "sr-only"} role="status">
          {created ? "مساحتك التجريبية جاهزة. ما حفظنا أي شيء." : ""}
        </p>
      </div>
    </section>
  );
}
