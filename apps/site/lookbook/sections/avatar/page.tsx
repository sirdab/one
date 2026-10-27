import { StoreAvatar } from "@sirdab/one/components/store-avatar";
import { Avatar, AvatarFallback } from "@sirdab/one/components/avatar";
import { PageHeader, Section } from "../../../lookbook/components/section";

function Face({
  initial,
  size,
}: {
  initial: string;
  size: "default" | "xl";
}): React.JSX.Element {
  return (
    <Avatar size={size}>
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}

export default async function AvatarPage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Avatar"
        tagline="A stable orb for each store. A picture or an initial for each person."
      />
      <Section
        title="Store identity"
        caption="the topbar size (32) and the settings row size (56)"
      >
        <div className="flex items-center gap-4">
          {["store-a", "store-b", "store-c", "store-d"].map((seed: string) => (
            <StoreAvatar
              key={seed}
              seed={seed}
              size="xl"
              storeIds={["store-a", "store-b", "store-c", "store-d"]}
            />
          ))}
        </div>
      </Section>
      <Section title="Arabic initial" caption="one grapheme, the ink circle">
        <div className="flex items-center gap-4" dir="rtl">
          <Face initial="س" size="default" />
          <Face initial="س" size="xl" />
        </div>
      </Section>
      <Section title="Latin initial" caption="upper case, one letter">
        <div className="flex items-center gap-4">
          <Face initial="S" size="default" />
          <Face initial="S" size="xl" />
        </div>
      </Section>
    </>
  );
}
