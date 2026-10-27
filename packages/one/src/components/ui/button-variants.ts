import { cva } from "class-variance-authority";

const buttonVariants = cva(
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

        overlay:
          "border border-btn-border bg-background text-foreground hover:border-btn-border-hover hover:wash-50 active:wash-100 data-[state=open]:wash-50 disabled:text-subtle disabled:[&_svg]:icon-quiet",
        ghost:
          "duration-100 text-foreground hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active data-[state=open]:bg-btn-ghost-surface-active disabled:text-subtle disabled:[&_svg]:icon-quiet",
        chip: "border border-btn-border bg-transparent text-muted-foreground [&_svg]:icon-quiet hover:[&_svg]:icon-quiet-hover hover:bg-btn-ghost-surface-hover active:bg-btn-ghost-surface-active data-[state=on]:bg-btn-ghost-surface-active data-[state=open]:bg-btn-ghost-surface-active disabled:bg-transparent disabled:text-subtle disabled:[&_svg]:icon-quiet",
        link: "text-foreground underline-offset-4 hover:underline disabled:text-subtle disabled:[&_svg]:icon-quiet",
      },

      size: {
        default: "h-control rounded-lg px-2.5",
        xs: "h-control-xs gap-1 rounded-md px-1.5 text-caption [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm rounded-lg px-2 [&>svg:first-child:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg rounded-lg px-3 text-body [&>svg:first-child:not([class*='size-'])]:size-4.5",
        xl: "h-control-xl gap-2 rounded-xl px-3 text-body [&>svg:first-child:not([class*='size-'])]:size-5",
        touch:
          "h-control-touch gap-2.5 rounded-xl px-3.5 text-body [&>svg:first-child:not([class*='size-'])]:size-5.5",

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

      shape: {
        default: "",
        circle: "rounded-full",
      },

      phone: {
        default: "",
        icon: "max-sm:aspect-square max-sm:gap-0 max-sm:px-0 max-sm:[&>svg:first-child]:not-only:ms-0 max-sm:[&>:not(svg)]:sr-only",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto rounded-none p-0" }],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      phone: "default",
    },
  },
);

export { buttonVariants };
