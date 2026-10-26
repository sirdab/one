import { cva } from "class-variance-authority";

/* Server components call the recipe directly, so it must stay outside the
   client Button module. */
const buttonVariants = cva(
  // Leading icons pull toward the start edge (a −3px optical pull,
  // taken at the nearest on-grid step); the 6px gap spaces icon from text.
  // Real disabled buttons KEEP pointer events (cursor feedback); aria-disabled
  // asChild elements drop them. [&:disabled] is deliberate: the redefined
  // `disabled:` variant also matches aria-disabled and would contradict the
  // very next class.
  "relative touch-target inline-flex shrink-0 items-center justify-center gap-1.5 text-label whitespace-nowrap transition-colors duration-75 select-none [&:disabled]:pointer-events-auto aria-disabled:pointer-events-none data-[loading=true]:text-transparent data-[loading=true]:[&>svg]:opacity-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>svg:first-child]:not-only:-ms-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-none hover:bg-primary-hover active:bg-primary-active data-[state=on]:bg-primary-active data-[state=open]:bg-primary-active disabled:bg-btn-disabled-surface disabled:text-btn-disabled-text",
        destructive:
          "border border-btn-destructive bg-background/20 text-btn-destructive hover:bg-btn-destructive/10 active:bg-btn-destructive/20 disabled:border-btn-destructive-border-disabled disabled:bg-background/20 disabled:text-btn-destructive-text-disabled",
        secondary:
          "border border-btn-border bg-background text-foreground hover:border-btn-border-hover hover:bg-btn-surface-hover active:border-btn-border-hover active:bg-btn-surface-active data-[state=open]:border-btn-border-hover data-[state=open]:bg-btn-surface-hover data-[state=on]:border-btn-border-hover data-[state=on]:bg-btn-surface-hover disabled:bg-background disabled:text-subtle disabled:[&_svg]:icon-quiet disabled:border-btn-border",
        outline:
          "border border-btn-border bg-transparent text-foreground hover:border-btn-border-hover hover:bg-btn-surface-hover active:border-btn-border-hover active:bg-btn-surface-active data-[state=open]:border-btn-border-hover data-[state=open]:bg-btn-surface-hover data-[state=on]:border-btn-border-hover data-[state=on]:bg-btn-surface-hover disabled:bg-transparent disabled:text-subtle disabled:[&_svg]:icon-quiet disabled:border-btn-border",
        /* A control sitting ON a photo. Secondary's hover and press
                   fills are alpha washes that replace its paper, so over an
                   image the plate turned see-through right under the pointer
                   and the glyph sank into the picture. The wash here layers
                   over the solid paper instead, so the plate never thins. */
        overlay:
          "border border-btn-border bg-background text-foreground hover:border-btn-border-hover hover:wash-50 active:wash-100 data-[state=open]:wash-50 disabled:text-subtle disabled:[&_svg]:icon-quiet",
        ghost:
          "duration-100 text-foreground hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active data-[state=open]:bg-btn-ghost-surface-active disabled:text-subtle disabled:[&_svg]:icon-quiet",
        chip: "border border-btn-border bg-transparent text-muted-foreground [&_svg]:icon-quiet hover:[&_svg]:icon-quiet-hover hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active data-[state=on]:bg-btn-ghost-surface-active data-[state=open]:bg-btn-ghost-surface-active disabled:bg-transparent disabled:text-subtle disabled:[&_svg]:icon-quiet",
        link: "text-foreground underline-offset-4 hover:underline disabled:text-subtle disabled:[&_svg]:icon-quiet",
      },
      /* Icons are half the control height. Labeled sizes scale only the
               LEADING icon (first-child) so trailing chevrons hold at 16px;
               icon-only squares scale their lone icon. The 16px base in the
               root covers default (32px) and all trailing icons. */
      size: {
        default: "h-control rounded-lg px-2.5",
        xs: "h-control-xs gap-1 rounded-md px-1.5 text-caption [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm rounded-lg px-2 [&>svg:first-child:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg rounded-lg px-3 text-body [&>svg:first-child:not([class*='size-'])]:size-4.5",
        xl: "h-control-xl gap-2 rounded-xl px-3 text-body [&>svg:first-child:not([class*='size-'])]:size-5",
        touch:
          "h-control-touch gap-2.5 rounded-xl px-3.5 text-body [&>svg:first-child:not([class*='size-'])]:size-5.5",
        // px-0 is load-bearing: the bridge's density rule pads every
        // button 12px inline; without an explicit padding utility the
        // icon squares grow to fit it and stop being square.
        icon: "aspect-square h-control rounded-lg px-0",
        "icon-xs":
          "aspect-square h-control-xs rounded-md px-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "aspect-square h-control-sm rounded-lg px-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":
          "aspect-square h-control-lg rounded-lg px-0 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-xl":
          "aspect-square h-control-xl rounded-xl px-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-touch":
          "aspect-square h-control-touch rounded-xl px-0 [&_svg:not([class*='size-'])]:size-5.5",
      },
      /* Radius stays a PROP, never a call-site override. `circle` is
               for IDENTITY triggers: the avatar that opens the account menu,
               where the round shape is the thing itself and the fill steps
               on hover instead of chrome appearing around it. One exception
               by Mustafa's call (2026-09-28): the assistant composer's send
               and stop, where the round button is the chat convention.
               Every other action keeps the house radii. */
      shape: {
        default: "",
        circle: "rounded-full",
      },
      /* A labelled button that becomes a square icon button on a phone,
               where the row has no room for its words. The label (any child
               that is not the glyph) goes screen-reader-only, the box goes
               square and padless, and the leading glyph's -2px optical pull
               toward the label goes with it: left on, it sat the lone glyph
               off centre. */
      phone: {
        default: "",
        icon: "max-sm:aspect-square max-sm:gap-0 max-sm:px-0 max-sm:[&>svg:first-child]:not-only:ms-0 max-sm:[&>:not(svg)]:sr-only",
      },
    },
    compoundVariants: [
      // A link is text, not a box, whatever size it inherits.
      { variant: "link", class: "h-auto rounded-none p-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      phone: "default",
    },
  },
);

export { buttonVariants };
