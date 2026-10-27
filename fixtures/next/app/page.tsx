import type { JSX } from "react";
import { Button, buttonVariants } from "@sirdab/one";
import { buttonVariants as recipe } from "@sirdab/one/components/button-variants";
import { SearchIcon } from "@sirdab/one/icons/catalogue";
import { PaletteItemIcon } from "@sirdab/one/components/palette";
import { Consumer } from "../shared/consumer";

export default function Page(): JSX.Element {
  return (
    <Consumer>
      <a
        href="#server-proof"
        id="server-proof"
        data-testid="server-recipe"
        className={buttonVariants({ variant: "secondary" })}
      >
        Server recipe
      </a>
      <span
        data-testid="subpath-recipe"
        className={recipe({ variant: "ghost" })}
      >
        Subpath recipe
      </span>
      <Button variant="secondary">Server rendered button</Button>
      <span data-testid="server-icon-prop">
        <PaletteItemIcon icon={SearchIcon} />
      </span>
    </Consumer>
  );
}
