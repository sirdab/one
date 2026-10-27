import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@sirdab/one/styles.css";
import "@sirdab/one/fonts.css";
import "../shared/layout.css";
import { Consumer } from "../shared/consumer";

const root: HTMLElement | null = document.getElementById("root");
if (!root) throw new Error("Missing consumer root");
createRoot(root).render(
  <StrictMode>
    <Consumer />
  </StrictMode>,
);
