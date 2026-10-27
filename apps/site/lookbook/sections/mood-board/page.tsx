import {
  MoodBoard,
  MoodBoardThumb,
  type MoodBoardLabels,
  type MoodBoardModel,
} from "@sirdab/one/components/mood-board";
import { sampler } from "../../../lookbook/components/samples";
import { PageHeader, Section } from "../../../lookbook/components/section";

function photo(fill: string, mark: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${fill}"/>` +
    `<circle cx="50" cy="56" r="24" fill="${mark}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function MoodBoardPage({
  lang,
}: {
  lang: string;
}): React.JSX.Element {
  const s = sampler(lang);
  const labels: MoodBoardLabels = {
    board: s("Your store at a glance"),
    tempName: s("Temporary name"),
    roles: {
      ground: s("Background"),
      ink: s("Text"),
      accent: s("Accent colour"),
      secondary: s("Supporting"),
    },
    typeRoles: { display: s("Brand font"), body: s("Interface font") },
    typeUse: {
      display: s("For big titles and product sections"),
      body: s("For buttons, body text and navigation"),
    },
    displaySample: s("This season's collection"),
    bodySample: s("The type your customers read every product's details in."),
    interfaceSample: {
      button: s("Add to cart"),
      nav: [s("Home"), s("Shop"), s("Contact")],
    },
    sections: {
      colors: s("Colors"),
      type: s("Typography"),
      radius: s("Corner radius"),
      spacing: s("Spacing"),
    },
    radiusFull: s("Round"),
  };

  const concept: MoodBoardModel = {
    name: s("Nakhla"),
    nameTemporary: true,
    nameAlternatives: [s("Date House"), s("Sudair Farm")],
    summary: s("Dates from Qassim, Sukkari and Ajwa in kilo boxes."),
    category: s("Premium dates"),
    palette: {
      ground: "#f6efe4",
      ink: "#2b1d12",
      accent: "#8a4b1f",
      secondary: ["#c9862b", "#3b5a3a"],
    },
    typography: { display: "Aref Ruqaa", body: "Readex Pro" },
    mood: s("An afternoon in a Qassim palm grove, coffee on the fire"),
    heroImageUrl: photo("#c9a15a", "#3b5a3a"),
    products: [
      {
        key: "sukkari",
        title: s("Sukkari dates"),
        priceMinor: 4500,
        panelColor: "#c9862b",
        panelShape: "box",
        imageUrl: photo("#c9862b", "#f6efe4"),
      },
      {
        key: "ajwa",
        title: s("Ajwa dates"),
        priceMinor: 8900,
        panelColor: "#3b2418",
        panelShape: "jar",
        imageUrl: photo("#3b2418", "#c9862b"),
      },
      {
        key: "khalas",
        title: s("Khalas dates"),
        priceMinor: 3900,
        panelColor: "#a8632a",
        panelShape: "bag",
        imageUrl: null,
      },
      {
        key: "paste",
        title: s("Date paste"),
        priceMinor: 2500,
        panelColor: "#6b3b1d",
        panelShape: "tin",
        imageUrl: photo("#6b3b1d", "#d9a441"),
      },
    ],
    source: null,
    locale: lang,
    currency: "SAR",
  };

  const drawing: MoodBoardModel = {
    ...concept,
    nameAlternatives: [],
    summary: null,
    category: null,
    palette: null,
    typography: null,
    mood: null,
    heroImageUrl: null,
    products: [],
  };

  const peek: MoodBoardModel = {
    name: s("Naqaa Coffee"),
    nameTemporary: false,
    nameAlternatives: [],
    summary: null,

    category: null,
    palette: {
      ground: "#f3ece4",
      ink: "#1f1712",
      accent: "#a2653a",
      secondary: [],
    },
    typography: null,
    mood: null,
    heroImageUrl: null,
    products: [
      {
        key: "ethiopia",
        title: s("Ethiopian beans"),
        priceMinor: 6900,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#3a2a22", "#c7a17a"),
      },
      {
        key: "colombia",
        title: s("Colombian beans"),
        priceMinor: 6500,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#5a3b2a", "#e0c3a0"),
      },
      {
        key: "saudi",
        title: s("Saudi coffee blend"),
        priceMinor: 5400,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#c9a15a", "#5a3b2a"),
      },
      {
        key: "cardamom",
        title: s("Cardamom"),
        priceMinor: 2200,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#8a9a5b", "#f3ece4"),
      },
      {
        key: "kit",
        title: s("Pour-over kit"),
        priceMinor: 18900,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#e6ded2", "#1f1712"),
      },
      {
        key: "cup",
        title: s("Ceramic cup"),
        priceMinor: null,
        panelColor: null,
        panelShape: null,
        imageUrl: photo("#a2653a", "#f3ece4"),
      },
    ],
    source: {
      platform: "salla",
      name: s("Naqaa Coffee"),
      logoUrl: photo("#1f1712", "#a2653a"),
    },
    locale: lang,
    currency: "SAR",
  };

  return (
    <>
      <PageHeader
        title="Mood board"
        tagline="Her store as its pieces, before it exists: a concept or a peek, filling in as it lands."
      />

      <Section title="Concept" caption="every tile, at desktop width" bare>
        <div className="border-border h-160 w-full overflow-hidden rounded-xl border">
          <MoodBoard model={concept} labels={labels} />
        </div>
      </Section>

      <Section title="Phone strip" caption="the opening's 224px" bare>
        <div className="border-border h-56 w-full max-w-sm overflow-hidden rounded-xl border">
          <MoodBoard model={concept} labels={labels} />
        </div>
      </Section>

      <Section title="Drawing" caption="the name landed first" bare>
        <div className="border-border h-96 w-full overflow-hidden rounded-xl border">
          <MoodBoard model={drawing} labels={labels} drawing />
        </div>
      </Section>

      <Section title="Peek" caption="her Salla store, read live" bare>
        <div className="border-border h-160 w-full max-w-2xl overflow-hidden rounded-xl border">
          <MoodBoard model={peek} labels={labels} />
        </div>
      </Section>

      <Section title="Thumbnail" caption="the deliver dialog's 64px">
        <div className="flex gap-4">
          <div className="size-16 overflow-hidden rounded-lg">
            <MoodBoardThumb model={concept} label={labels.board} />
          </div>
          <div className="size-16 overflow-hidden rounded-lg">
            <MoodBoardThumb
              model={{ ...peek, products: [] }}
              label={labels.board}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
