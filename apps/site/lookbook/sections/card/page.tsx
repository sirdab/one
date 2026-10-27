import { Button } from "@sirdab/one/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sirdab/one/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldRow,
  FieldSet,
} from "@sirdab/one/components/field";
import { Input } from "@sirdab/one/components/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@sirdab/one/components/item";
import { Separator } from "@sirdab/one/components/separator";
import { PhoneFieldDemo } from "../../../lookbook/components/phone-field-demo";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

export default async function CardPage({
  lang,
}: {
  lang: string;
}): Promise<React.JSX.Element> {
  const locale = lang;
  const s = sampler(locale);
  return (
    <>
      <PageHeader
        title="Card"
        tagline="One raised plane for every page-level group."
      />

      <Section title="Anatomy" caption="header, action, sections, footer" bare>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{s("Contact details")}</CardTitle>
            <CardDescription>
              {s("Shown in the footer of your store's policy pages.")}
            </CardDescription>
            <CardAction>
              <Button variant="secondary" size="xl">
                {s("View in store")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="lb-card-email">
                  {s("Contact email")}
                </FieldLabel>
                <Input
                  id="lb-card-email"
                  type="email"
                  dir="ltr"
                  placeholder="hello@matjar.sa"
                  aria-describedby="lb-card-email-help"
                />
                <FieldDescription id="lb-card-email-help">
                  {s("Customers write here about their orders.")}
                </FieldDescription>
              </Field>
              <PhoneFieldDemo
                id="lb-card-phone"
                locale={locale}
                label={s("Contact phone")}
                countryLabelText={s("Country")}
                invalidText={s("Enter a valid mobile number.")}
              />
            </FieldGroup>
          </CardContent>
          <Separator />
          <CardContent>
            <FieldSet>
              <FieldLegend>{s("Analytics")}</FieldLegend>
              <FieldDescription>
                {s("Paste an id to measure your own visitors and ads.")}
              </FieldDescription>
              <FieldGroup>
                <FieldRow>
                  <Field>
                    <FieldLabel htmlFor="lb-card-ga4">
                      Google Analytics (GA4)
                    </FieldLabel>
                    <Input
                      id="lb-card-ga4"
                      dir="ltr"
                      inputClassName="latin"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lb-card-meta">
                      {s("Meta pixel")}
                    </FieldLabel>
                    <Input
                      id="lb-card-meta"
                      dir="ltr"
                      inputClassName="latin"
                      placeholder="123456789012345"
                    />
                  </Field>
                </FieldRow>
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter>
            <p className="text-caption-quiet text-muted-foreground me-auto">
              {s("Changes appear on your next publish.")}
            </p>
            <Button variant="ghost" size="xl">
              {s("Remove number")}
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section
        title="Header only"
        caption="closes itself; the action is the verb"
        bare
      >
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{s("Delete Steez Supply")}</CardTitle>
            <CardDescription>
              {s("Your orders stay for 30 days if you change your mind.")}
            </CardDescription>
            <CardAction>
              <Button variant="destructive" size="xl">
                {s("Delete store")}
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </Section>

      <Section title="Rows" caption="an item group is the whole body" bare>
        <Card className="max-w-2xl">
          <ItemGroup>
            <Item>
              <ItemContent>
                <ItemTitle>{s("Name")}</ItemTitle>
                <ItemDescription>{s("Sara Alqahtani")}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="secondary" size="xl">
                  {s("Change")}
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemContent>
                <ItemTitle>{s("Email")}</ItemTitle>
                <ItemDescription>
                  <bdi className="latin">sara@example.com</bdi>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="secondary" size="xl">
                  {s("Change")}
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemContent>
                <ItemTitle>{s("Password")}</ItemTitle>
                <ItemDescription>
                  <bdi className="latin">••••••••</bdi>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="secondary" size="xl">
                  {s("Change")}
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </Card>
      </Section>

      <Section
        title="Inside a card"
        caption="hairline or whisper, never a second shadow"
        bare
      >
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{s("Contact details")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>{s("Email")}</ItemTitle>
                <ItemDescription>
                  <bdi className="latin">sara@example.com</bdi>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="secondary" size="xl">
                  {s("Change")}
                </Button>
              </ItemActions>
            </Item>
            <Item variant="muted">
              <ItemContent>
                <ItemTitle>{s("National address code")}</ItemTitle>
                <ItemDescription>
                  <bdi className="latin">RRRD2929</bdi>
                </ItemDescription>
              </ItemContent>
            </Item>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Outline"
        caption="on a whisper well or carrying its own depth"
        bare
      >
        <div className="bg-surface-whisper max-w-2xl rounded-2xl p-6">
          <Card variant="outline">
            <CardHeader>
              <CardTitle>{s("Contact details")}</CardTitle>
              <CardDescription>
                {s("Shown in the footer of your store's policy pages.")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section
        title="Narrow column"
        caption="the two-up pair stacks by container width"
        bare
      >
        <Card className="w-72">
          <CardContent>
            <FieldGroup>
              <FieldRow>
                <Field>
                  <FieldLabel htmlFor="lb-card-first">
                    {s("First name")}
                  </FieldLabel>
                  <Input id="lb-card-first" placeholder={s("Sara")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lb-card-last">
                    {s("Last name")}
                  </FieldLabel>
                  <Input id="lb-card-last" placeholder={s("Alqahtani")} />
                </Field>
              </FieldRow>
            </FieldGroup>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
