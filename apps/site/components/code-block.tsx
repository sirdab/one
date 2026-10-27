"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@sirdab/one/components/button";

export function CodeBlock({
  code,
  label = "Code",
}: {
  code: string;
  label?: string;
}): React.JSX.Element {
  const [status, setStatus] = useState<string>("");
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("");
      toast.success("Code copied");
    } catch {
      setStatus("Select the code to copy it manually.");
    }
  }
  return (
    <div className="code-block" dir="ltr" lang="en">
      <div className="code-toolbar">
        <span>{label}</span>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Copy ${label}`}
          onClick={copy}
        >
          Copy
        </Button>
      </div>
      <pre tabIndex={0} aria-label={label}>
        <code>{code}</code>
      </pre>
      <span className="copy-status" role="status">
        {status}
      </span>
    </div>
  );
}
