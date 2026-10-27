"use client";

import { toast } from "sonner";

import { Button } from "@sirdab/one/components/button";
import { sampler } from "./samples";

export function ToastDemo({
  locale = "en",
}: {
  locale?: string;
}): React.JSX.Element {
  const s = sampler(locale);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={() => toast(s("Draft saved"))}>
        Default
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.success(s("Product published"))}
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error(s("Payment failed"))}
      >
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast(s("Store created"), {
            description: s("Your storefront is being generated."),
          })
        }
      >
        With description
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast(s("Product deleted"), {
            action: { label: s("Undo"), onClick: () => {} },
          })
        }
      >
        With action
      </Button>
    </div>
  );
}
