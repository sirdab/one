import Link from "next/link";
import { Button } from "@sirdab/one/components/button";

export default function NotFound(): React.JSX.Element {
  return (
    <main id="main-content" className="document-page">
      <p className="text-muted-foreground">404</p>
      <h1 className="text-display-lg">That page isn’t here.</h1>
      <p>Find a component in the lookbook or start with the setup guide.</p>
      <Button asChild>
        <Link href="/lookbook">Open the lookbook</Link>
      </Button>
    </main>
  );
}
