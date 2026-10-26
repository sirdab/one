# Mood board notes

Not rendered. The gallery page shows; this file explains. Component usage
stays canonical in `components/ui/mood-board.tsx`'s header comment.

## Doctrine

The board is the canvas's cover while a store is on its way (it replaced the
store sketch on 2026-10-04). It is drawn from a model the studio assembles
from the pipeline's concept or from a peek of her existing store, and with
the product panel it is the one surface in the app that paints colour: hers,
from the model, never a token. Ink and accent are pushed by the foundation's
contrast rule before anything is painted, the rule the generated store
applies, so the swatches show the values the store will wear.

Each piece is a tile that draws once its piece exists: the name with the
summary and the two other names, the palette as tall swatches, the type
specimen in her two families, the mood line on her accent, the opening
photograph, the products. While a stream is drawing, a missing tile holds
its place with a pulse; once nothing is drawing, a missing tile is simply
not there. Tiles fade in over 200ms on the kit's `animate-in` vocabulary and
stand still under reduced motion.

Her two families load from Google Fonts while a board shows them, one
stylesheet for the pair, shared and counted across boards, with the house
face behind each until the file lands.

## The demos

Concept: a dates store the sentence door produced, every tile, wide enough
for the six-column grid. Phone strip: the same board in the opening's 224px,
where the name and the swatches sit up top and the rest is a scroll away.
Drawing: the first frame of a stream, the name alone and every other tile
pulsing. Peek: a coffee store on Salla read live, the logo, six real images,
a sampled palette, no type and no mood. Thumbnail: the deliver dialog's
64px well, with and without a photograph.

## Usage

```tsx
import { MoodBoard, type MoodBoardModel } from "@sirdab/one";

<MoodBoard
  model={model}
  labels={{
    board: "ملامح متجرك",
    tempName: "اسم مؤقت",
    roles: {
      ground: "الخلفية",
      ink: "النص",
      accent: "اللون المميز",
      secondary: "لون مساند",
    },
    typeRoles: { display: "العناوين", body: "النصوص" },
    bodySample: "بهذا الخط يقرا عملاؤك تفاصيل كل منتج.",
  }}
  drawing={streaming}
/>;
```

The 390px fixture in `tests/mood-board-390.png` is shot from the Concept
demo (see `packages/ui/AGENTS.md`, "The mood board").
