# Slider

Not rendered. The gallery page shows; this file explains.

From shadcn, trued to the switch's family: a gray-alpha track, an ink fill,
the switch's knob. One thumb only; a range slider has no screen to live on.

- The caller owns the name: pass `aria-label` (it lands on the thumb, the
  element with role slider) or point a Label at it.
- Controlled with `value={[n]}` and `onValueChange={([next]) => ...}`.
- A phone drags a 44px square around the 16px look.
- Used for the profile picture's zoom (`ImageEditor shape="circle"`).
