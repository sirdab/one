"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/* The Sirdab slider: one value on a line, for a continuous amount (the crop's
   zoom). Added from shadcn and trued to the switch's family: the track is the
   gray-alpha rung a switch's OFF track is, the filled part is ink, and the
   thumb is the switch's knob (background fill, the contact shadow). A phone
   drags a 44px square around the 16px look (touch-target).

   A single thumb is the only shape here: a range slider has no screen to
   live on. The caller owns the label (a slider with no text is announced as
   its number alone), so pass `aria-label` or point a Label at it. RTL needs
   nothing from the caller beyond the `dir` the Radix provider already
   carries.

       <Slider aria-label="Zoom" min={1} max={3} step={0.01}
           value={[zoom]} onValueChange={([next]) => setZoom(next)} /> */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>): React.JSX.Element {
  const thumbs = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex h-5 w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-gray-alpha-300 relative h-1.5 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute h-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbs }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          /* The thumb is the element with role=slider, so it is
                       the one that carries the name. */
          aria-label={props["aria-label"]}
          className="touch-target shadow-raised relative block size-4 shrink-0 rounded-full bg-background disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
