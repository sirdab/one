"use client";

import { forwardRef, useId } from "react";

import { shellIcon, type IconProps } from "./house-icon";

export const HomeIcon = shellIcon(
  "HomeIcon",
  <>
    <path
      d="M4 10.2847C4 9.44537 4 9.02572 4.10594 8.63772C4.1998 8.29397 4.35414 7.9697 4.56174 7.68009C4.79607 7.3532 5.12176 7.08857 5.77316 6.55932L8.97316 3.95932C10.0521 3.08266 10.5916 2.64434 11.1913 2.47646C11.7203 2.3284 12.2797 2.3284 12.8087 2.47646C13.4084 2.64434 13.9479 3.08266 15.0268 3.95932L18.2268 6.55932C18.8782 7.08857 19.2039 7.3532 19.4383 7.68009C19.6459 7.9697 19.8002 8.29397 19.8941 8.63772C20 9.02572 20 9.44537 20 10.2847V15.2C20 16.8802 20 17.7202 19.673 18.362C19.3854 18.9265 18.9265 19.3854 18.362 19.673C17.7202 20 16.8802 20 15.2 20H8.8C7.11984 20 6.27976 20 5.63803 19.673C5.07354 19.3854 4.6146 18.9265 4.32698 18.362C4 17.7202 4 16.8802 4 15.2V10.2847Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 16H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const AlertsIcon = shellIcon(
  "AlertsIcon",
  <>
    <path
      d="M16 17C16 19.2091 14.2091 21 12 21C9.79086 21 8 19.2091 8 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M20 16.191C20 16.6378 19.6378 17 19.191 17H4.80902C4.36221 17 4 16.6378 4 16.191C4 16.0654 4.02924 15.9415 4.08541 15.8292L5.21846 13.5631C5.40413 13.1917 5.51071 12.7859 5.53144 12.3712L5.70037 8.99251C5.86822 5.63561 8.6389 3 12 3C15.3611 3 18.1318 5.63561 18.2996 8.99251L18.4686 12.3712C18.4893 12.7859 18.5959 13.1917 18.7815 13.5631L19.9146 15.8292C19.9708 15.9415 20 16.0654 20 16.191Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </>,
);

export const InfoIcon = shellIcon(
  "InfoIcon",
  <>
    <path
      d="M10.75 11H12L12 16.25M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7.375C11.6548 7.375 11.375 7.65482 11.375 8C11.375 8.34518 11.6548 8.625 12 8.625C12.3452 8.625 12.625 8.34518 12.625 8C12.625 7.65482 12.3452 7.375 12 7.375Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.25"
    />
  </>,
);

export const OrdersIcon = shellIcon(
  "OrdersIcon",
  <path
    d="M3 12H7.25C8.03689 12 8.77786 12.3705 9.25 13C9.72214 13.6295 10.4631 14 11.25 14H12.75C13.5369 14 14.2779 13.6295 14.75 13C15.2221 12.3705 15.9631 12 16.75 12H21M21.6047 11.3083L18.8638 6.51158C18.3296 5.57686 17.3356 5 16.259 5H7.74097C6.6644 5 5.67037 5.57686 5.13624 6.51158L2.39527 11.3083C2.13625 11.7616 2 12.2746 2 12.7967V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V12.7967C22 12.2746 21.8638 11.7616 21.6047 11.3083Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const ProductsIcon = shellIcon(
  "ProductsIcon",
  <>
    <path
      d="M8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M3 10.7574V6C3 4.34315 4.34315 3 6 3H10.7574C11.553 3 12.3161 3.31607 12.8787 3.87868L20.1287 11.1287C21.3003 12.3003 21.3003 14.1997 20.1287 15.3713L15.3713 20.1287C14.1997 21.3003 12.3003 21.3003 11.1287 20.1287L3.87868 12.8787C3.31607 12.3161 3 11.553 3 10.7574Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M7.39844 7.5H7.59844"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </>,
);

export const CustomersIcon = shellIcon(
  "CustomersIcon",
  <>
    <path
      d="M11 7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7C5 5.34315 6.34315 4 8 4C9.65685 4 11 5.34315 11 7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 7.5C19.5 8.88071 18.3807 10 17 10C15.6193 10 14.5 8.88071 14.5 7.5C14.5 6.11929 15.6193 5 17 5C18.3807 5 19.5 6.11929 19.5 7.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.70657 16.8713C2.03609 18.4769 3.48074 20 5.22066 20H10.7828C12.5227 20 13.9674 18.4769 13.2969 16.8713C11.1413 11.7096 4.86215 11.7096 2.70657 16.8713Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.9999 19H18.9266C20.6665 19 22.1288 17.4568 21.3502 15.9008C20.1901 13.5823 17.9918 12.6536 16 13.1147"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const AnalyticsIcon = shellIcon(
  "AnalyticsIcon",

  <path
    d="M19 11V11C17.8954 9.89543 16.1046 9.89543 15 11L13.25 12.75C12.5596 13.4404 11.4404 13.4404 10.75 12.75V12.75C10.0596 12.0596 8.94035 12.0596 8.25 12.75L4 17M4 4V17M20 20H7C5.34315 20 4 18.6569 4 17V17"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const DiscountsIcon = shellIcon(
  "DiscountsIcon",
  <>
    <path
      d="M19 21L18.3492 21.7593C18.6457 22.0134 19.0631 22.0717 19.4179 21.9085C19.7727 21.7453 20 21.3905 20 21H19ZM16.6667 19L17.3175 18.2407C16.943 17.9198 16.3904 17.9198 16.0159 18.2407L16.6667 19ZM14.3333 21L13.6825 21.7593C14.057 22.0802 14.6096 22.0802 14.9841 21.7593L14.3333 21ZM12 19L12.6508 18.2407C12.2763 17.9198 11.7237 17.9198 11.3492 18.2407L12 19ZM9.66667 21L9.01588 21.7593C9.39036 22.0802 9.94297 22.0802 10.3175 21.7593L9.66667 21ZM7.33333 19L7.98412 18.2407C7.60963 17.9198 7.05703 17.9198 6.68254 18.2407L7.33333 19ZM5 21H4C4 21.3905 4.22734 21.7453 4.58214 21.9085C4.93694 22.0717 5.35428 22.0134 5.65079 21.7593L5 21ZM15.9571 8.45711C16.3476 8.06658 16.3476 7.43342 15.9571 7.04289C15.5666 6.65237 14.9334 6.65237 14.5429 7.04289L15.9571 8.45711ZM8.04289 13.5429C7.65237 13.9334 7.65237 14.5666 8.04289 14.9571C8.43342 15.3476 9.06658 15.3476 9.45711 14.9571L8.04289 13.5429ZM8 4H16V2H8V4ZM18 6V21H20V6H18ZM19.6508 20.2407L17.3175 18.2407L16.0159 19.7593L18.3492 21.7593L19.6508 20.2407ZM16.0159 18.2407L13.6825 20.2407L14.9841 21.7593L17.3175 19.7593L16.0159 18.2407ZM14.9841 20.2407L12.6508 18.2407L11.3492 19.7593L13.6825 21.7593L14.9841 20.2407ZM11.3492 18.2407L9.01588 20.2407L10.3175 21.7593L12.6508 19.7593L11.3492 18.2407ZM10.3175 20.2407L7.98412 18.2407L6.68254 19.7593L9.01588 21.7593L10.3175 20.2407ZM6.68254 18.2407L4.34921 20.2407L5.65079 21.7593L7.98412 19.7593L6.68254 18.2407ZM6 21V6H4V21H6ZM16 4C17.1046 4 18 4.89543 18 6H20C20 3.79086 18.2091 2 16 2V4ZM8 2C5.79086 2 4 3.79086 4 6H6C6 4.89543 6.89543 4 8 4V2ZM14.5429 7.04289L8.04289 13.5429L9.45711 14.9571L15.9571 8.45711L14.5429 7.04289Z"
      fill="currentColor"
    />
    <path
      d="M9 8H9.01M9.25 8C9.25 8.13807 9.13807 8.25 9 8.25C8.86193 8.25 8.75 8.13807 8.75 8C8.75 7.86193 8.86193 7.75 9 7.75C9.13807 7.75 9.25 7.86193 9.25 8Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 14H15.01M15.25 14C15.25 14.1381 15.1381 14.25 15 14.25C14.8619 14.25 14.75 14.1381 14.75 14C14.75 13.8619 14.8619 13.75 15 13.75C15.1381 13.75 15.25 13.8619 15.25 14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const WorkspaceHomeIcon = shellIcon(
  "WorkspaceHomeIcon",
  <>
    <path
      d="M20.25 11.4087V18.25C20.25 19.3546 19.3546 20.25 18.25 20.25H5.75C4.64543 20.25 3.75 19.3546 3.75 18.25V11.4087"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.50026 3.75H14.5003M9.50026 3.75L8.90923 8.77398C8.69156 10.6243 10.1373 12.25 12.0003 12.25C13.8633 12.25 15.309 10.6243 15.0914 8.77397L14.5003 3.75M9.50026 3.75H5.88559C5.01164 3.75 4.2389 4.31745 3.9773 5.15132L2.97261 8.35377C2.36663 10.2853 3.80934 12.25 5.83373 12.25C7.3543 12.25 8.63416 11.1119 8.81182 9.60174L9.50026 3.75ZM14.5003 3.75H18.1149C18.9889 3.75 19.7616 4.31745 20.0232 5.15132L21.0279 8.35377C21.6339 10.2853 20.1912 12.25 18.1668 12.25C16.6462 12.25 15.3664 11.1119 15.1887 9.60174L14.5003 3.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const WorkspaceStudioIcon = shellIcon(
  "WorkspaceStudioIcon",
  <>
    <path
      d="M3.75 8V5.75C3.75 4.64543 4.64543 3.75 5.75 3.75H8M3.75 16V18.25C3.75 19.3546 4.64543 20.25 5.75 20.25H8M16 3.75H18.25C19.3546 3.75 20.25 4.64543 20.25 5.75V8M20.25 16V18.25C20.25 19.3546 19.3546 20.25 18.25 20.25H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M12.1845 9.28984C12.2813 9.24145 12.3598 9.16299 12.4081 9.06623L13.0531 7.77639C13.2373 7.40787 13.7632 7.40787 13.9475 7.77639L14.5924 9.06623C14.6408 9.16299 14.7192 9.24145 14.816 9.28984L16.1058 9.93475C16.4744 10.119 16.4744 10.6449 16.1058 10.8292L14.816 11.4741C14.7192 11.5225 14.6408 11.6009 14.5924 11.6977L13.9475 12.9875C13.7632 13.3561 13.2373 13.3561 13.0531 12.9875L12.4081 11.6977C12.3598 11.6009 12.2813 11.5225 12.1845 11.4741L10.8947 10.8292C10.5262 10.6449 10.5262 10.119 10.8947 9.93475L12.1845 9.28984Z"
      fill="currentColor"
    />
    <path
      d="M8.5775 13.5934C8.63556 13.5643 8.68263 13.5172 8.71166 13.4592L9.23194 12.4186C9.3425 12.1975 9.65804 12.1975 9.7686 12.4186L10.2889 13.4592C10.3179 13.5172 10.365 13.5643 10.423 13.5934L11.4636 14.1136C11.6847 14.2242 11.6847 14.5397 11.4636 14.6503L10.423 15.1706C10.365 15.1996 10.3179 15.2467 10.2889 15.3047L9.7686 16.3453C9.65804 16.5664 9.3425 16.5664 9.23194 16.3453L8.71166 15.3047C8.68263 15.2467 8.63556 15.1996 8.5775 15.1706L7.53693 14.6503C7.31582 14.5397 7.31581 14.2242 7.53693 14.1136L8.5775 13.5934Z"
      fill="currentColor"
    />
  </>,
);

export const PanelStartIcon = shellIcon(
  "PanelStartIcon",
  <>
    <path
      d="M2.75 6.75C2.75 5.64543 3.64543 4.75 4.75 4.75H19.25C20.3546 4.75 21.25 5.64543 21.25 6.75V17.25C21.25 18.3546 20.3546 19.25 19.25 19.25H4.75C3.64543 19.25 2.75 18.3546 2.75 17.25V6.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 8.25V15.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const PanelStartFilledIcon = shellIcon(
  "PanelStartFilledIcon",
  <>
    <path
      d="M2.75 6.75C2.75 5.64543 3.64543 4.75 4.75 4.75H19.25C20.3546 4.75 21.25 5.64543 21.25 6.75V17.25C21.25 18.3546 20.3546 19.25 19.25 19.25H4.75C3.64543 19.25 2.75 18.3546 2.75 17.25V6.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect
      x="5.5"
      y="7.5"
      width="6.25"
      height="9"
      rx="0.75"
      fill="currentColor"
    />
  </>,
);

export const PanelEndIcon = shellIcon(
  "PanelEndIcon",
  <>
    <path
      d="M2.75 6.75C2.75 5.64543 3.64543 4.75 4.75 4.75H19.25C20.3546 4.75 21.25 5.64543 21.25 6.75V17.25C21.25 18.3546 20.3546 19.25 19.25 19.25H4.75C3.64543 19.25 2.75 18.3546 2.75 17.25V6.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M17.75 8.25V15.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const AiIcon = shellIcon(
  "AiIcon",
  <>
    <path
      d="M16 6.5C16.1545 6.5 16.2931 6.5951 16.3486 6.73926L17.4736 9.66504C17.626 10.061 17.939 10.374 18.335 10.5264L21.2607 11.6514C21.4049 11.7069 21.5 11.8455 21.5 12C21.5 12.1545 21.4049 12.2931 21.2607 12.3486L18.335 13.4736C17.939 13.626 17.626 13.939 17.4736 14.335L16.3486 17.2607C16.2931 17.4049 16.1545 17.5 16 17.5C15.8455 17.5 15.7069 17.4049 15.6514 17.2607L14.5264 14.335C14.374 13.939 14.061 13.626 13.665 13.4736L10.7393 12.3486C10.5951 12.2931 10.5 12.1545 10.5 12C10.5 11.8455 10.5951 11.7069 10.7393 11.6514L13.665 10.5264C14.061 10.374 14.374 10.061 14.5264 9.66504L15.6514 6.73926C15.7069 6.5951 15.8455 6.5 16 6.5Z"
      fill="currentColor"
      stroke="currentColor"
    />
    <path
      d="M7.24045 6.18518L6.54359 4.37334C6.45708 4.14842 6.24099 4 6 4C5.75901 4 5.54292 4.14842 5.45641 4.37334L4.75955 6.18518C4.65797 6.44927 4.44927 6.65797 4.18518 6.75955L2.37334 7.45641C2.14842 7.54292 2 7.75901 2 8C2 8.24099 2.14842 8.45708 2.37334 8.54359L4.18518 9.24045C4.44927 9.34203 4.65797 9.55073 4.75955 9.81482L5.45641 11.6267C5.54292 11.8516 5.75901 12 6 12C6.24099 12 6.45708 11.8516 6.54359 11.6267L7.24045 9.81482C7.34203 9.55073 7.55073 9.34203 7.81482 9.24045L9.62666 8.54359C9.85158 8.45708 10 8.24099 10 8C10 7.75901 9.85158 7.54292 9.62666 7.45641L7.81482 6.75955C7.55073 6.65797 7.34203 6.44927 7.24045 6.18518Z"
      fill="currentColor"
    />
    <path
      d="M8.89045 15.5352L8.40769 14.28C8.34281 14.1113 8.18074 14 8 14C7.81926 14 7.65719 14.1113 7.59231 14.28L7.10955 15.5352C7.00797 15.7993 6.79927 16.008 6.53518 16.1095L5.28 16.5923C5.11131 16.6572 5 16.8193 5 17C5 17.1807 5.11131 17.3428 5.28 17.4077L6.53518 17.8905C6.79927 17.992 7.00797 18.2007 7.10955 18.4648L7.59231 19.72C7.65719 19.8887 7.81926 20 8 20C8.18074 20 8.34281 19.8887 8.40769 19.72L8.89045 18.4648C8.99203 18.2007 9.20073 17.992 9.46482 17.8905L10.72 17.4077C10.8887 17.3428 11 17.1807 11 17C11 16.8193 10.8887 16.6572 10.72 16.5923L9.46482 16.1095C9.20073 16.008 8.99203 15.7993 8.89045 15.5352Z"
      fill="currentColor"
    />
  </>,
);

export const NewChatIcon = shellIcon(
  "NewChatIcon",
  <path
    d="M12 5.25V12M12 12V18.75M12 12H5.25M12 12H18.75"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const HistoryIcon = shellIcon(
  "HistoryIcon",
  <>
    <path
      d="M12 7.75V12L15.5 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 4.75V8.75H6.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.25 15.0833C4.52169 18.676 7.95303 21.25 11.9864 21.25C17.1026 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1026 2.75 11.9864 2.75C8.14808 2.75 4.85497 5.08106 3.44947 8.40278"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const AssistantNewIcon = shellIcon(
  "AssistantNewIcon",
  <path
    d="M12 5.5V12M12 12V18.5M12 12H5.5M12 12H18.5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const AssistantFullScreenIcon = shellIcon(
  "AssistantFullScreenIcon",
  <path
    d="M7 5H6C4.34315 5 3 6.34315 3 8V9M17 5H18C19.6569 5 21 6.34315 21 8V9M21 15V16C21 17.6569 19.6569 19 18 19H17M7 19H6C4.34315 19 3 17.6569 3 16V15"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const AssistantExitFullScreenIcon = shellIcon(
  "AssistantExitFullScreenIcon",
  <path
    d="M3 9H4C5.65685 9 7 7.65685 7 6V5M21 9H20C18.3431 9 17 7.65685 17 6V5M17 19V18C17 16.3431 18.3431 15 20 15H21M7 19V18C7 16.3431 5.65685 15 4 15H3"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const AssistantHistoryIcon = shellIcon(
  "AssistantHistoryIcon",
  <>
    <path
      d="M3 5V9H7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.51172 15C4.74723 18.4956 8.08094 21 11.9996 21C16.9702 21 20.9996 16.9706 20.9996 12C20.9996 7.02944 16.9702 3 11.9996 3C8.27045 3 5.07102 5.26806 3.70551 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V12L15 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const AssistantCloseIcon = shellIcon(
  "AssistantCloseIcon",
  <path
    d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const AssistantSparklesIcon = shellIcon(
  "AssistantSparklesIcon",
  <>
    <path
      d="M14.0134 7C14.4272 7 14.7982 7.25482 14.9467 7.64101L16.2906 11.135C16.3922 11.3991 16.6009 11.6078 16.865 11.7094L20.359 13.0533C20.7452 13.2018 21 13.5728 21 13.9866V14.0134C21 14.4272 20.7452 14.7982 20.359 14.9467L16.865 16.2906C16.6009 16.3922 16.3922 16.6009 16.2906 16.865L14.9467 20.359C14.7982 20.7452 14.4272 21 14.0134 21H13.9866C13.5728 21 13.2018 20.7452 13.0533 20.359L11.7094 16.865C11.6078 16.6009 11.3991 16.3922 11.135 16.2906L7.64101 14.9467C7.25482 14.7982 7 14.4272 7 14.0134V13.9866C7 13.5728 7.25482 13.2018 7.64101 13.0533L11.135 11.7094C11.3991 11.6078 11.6078 11.3991 11.7094 11.135L13.0533 7.64101C13.2018 7.25482 13.5728 7 13.9866 7H14.0134Z"
      fill="currentColor"
    />
    <path
      d="M7 3C7.24122 3 7.45754 3.14856 7.54414 3.3737L8.24085 5.18485C8.34242 5.44891 8.55109 5.65758 8.81515 5.75915L10.6263 6.45586C10.8514 6.54246 11 6.75878 11 7C11 7.24122 10.8514 7.45754 10.6263 7.54414L8.81515 8.24085C8.55109 8.34242 8.34242 8.55109 8.24085 8.81515L7.54414 10.6263C7.45754 10.8514 7.24122 11 7 11C6.75878 11 6.54246 10.8514 6.45586 10.6263L5.75915 8.81515C5.65758 8.55109 5.44891 8.34242 5.18485 8.24085L3.3737 7.54414C3.14855 7.45754 3 7.24122 3 7C3 6.75878 3.14856 6.54246 3.3737 6.45586L5.18485 5.75915C5.44891 5.65758 5.65758 5.44891 5.75915 5.18485L6.45586 3.3737C6.54246 3.14855 6.75878 3 7 3Z"
      fill="currentColor"
    />
  </>,
);

export const AssistantAuroraIcon = forwardRef<
  SVGSVGElement,
  IconProps & {
    texture?: string | null;
  }
>(({ size = 24, texture = null, ...props }, ref) => {
  const id = useId();
  const ramp = `${id}-ramp`;
  const fill = `${id}-fill`;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <defs>
        <linearGradient
          id={ramp}
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.1" style={{ stopColor: "var(--aurora-mark-warm)" }} />
          <stop offset="0.4" style={{ stopColor: "var(--aurora-mark-cool)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--aurora-mark-fold)" }} />
        </linearGradient>
        {texture ? (
          <pattern
            id={fill}
            patternUnits="userSpaceOnUse"
            width="24"
            height="24"
          >
            <image
              href={texture}
              width="24"
              height="24"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        ) : null}
      </defs>
      <path
        d="M5.9772 2.76754C3.98919 2.08778 2.08777 3.98917 2.76754 5.97719L7.68519 20.3592C8.43653 22.5565 11.5045 22.663 12.4064 20.523L14.7382 14.9899C14.786 14.8764 14.8764 14.786 14.9899 14.7382L20.523 12.4064C22.663 11.5045 22.5565 8.43653 20.3592 7.68519L5.9772 2.76754Z"
        fill={`url(#${texture ? fill : ramp})`}
      />
    </svg>
  );
});
AssistantAuroraIcon.displayName = "AssistantAuroraIcon";

export const AssistantCopyIcon = shellIcon(
  "AssistantCopyIcon",
  <path
    d="M15 9V5.25C15 4.00736 13.9926 3 12.75 3H5.25C4.00736 3 3 4.00736 3 5.25V12.75C3 13.9926 4.00736 15 5.25 15H9M11.25 9H18.75C19.9926 9 21 10.0074 21 11.25V18.75C21 19.9926 19.9926 21 18.75 21H11.25C10.0074 21 9 19.9926 9 18.75V11.25C9 10.0074 10.0074 9 11.25 9Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const AssistantThumbsUpIcon = shellIcon(
  "AssistantThumbsUpIcon",
  <path
    d="M7 11H4C3.44772 11 3 11.4477 3 12V19C3 19.5523 3.44772 20 4 20H7M7 11V20M7 11L11 3H11.6156C12.843 3 13.7808 4.09535 13.5917 5.3081L13.0161 9H18.0631C19.8811 9 21.2813 10.6041 21.0356 12.4053L20.3538 17.4053C20.1511 18.8918 18.8815 20 17.3813 20H7"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
);

export const AssistantThumbsDownIcon = shellIcon(
  "AssistantThumbsDownIcon",
  <path
    d="M17 13H20C20.5523 13 21 12.5523 21 12L21 5C21 4.44772 20.5523 4 20 4H17M17 13L17 4M17 13L13.301 20.4505C13.1339 20.7871 12.7905 21 12.4147 21V21C11.1917 21 10.2572 19.9046 10.4456 18.6919L11.0192 15L5.98994 15C4.17839 15 2.78316 13.3959 3.02793 11.5947L3.70735 6.59466C3.90933 5.1082 5.17443 4 6.66936 4H17"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
);

export const AssistantThumbsUpFilledIcon = shellIcon(
  "AssistantThumbsUpFilledIcon",
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M11 2C10.6212 2 10.275 2.214 10.1056 2.55279L6.38197 10H4C2.89543 10 2 10.8954 2 12V19C2 20.1046 2.89543 21 4 21H17.3813C19.3816 21 21.0744 19.5224 21.3446 17.5405L22.0265 12.5405C22.354 10.1387 20.4871 8 18.0631 8H14.1841L14.5798 5.46216C14.8634 3.64303 13.4567 2 11.6156 2H11ZM6 19V12H4V19H6Z"
    fill="currentColor"
  />,
);

export const AssistantThumbsDownFilledIcon = shellIcon(
  "AssistantThumbsDownFilledIcon",
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M14.1967 20.8952C13.8607 21.572 13.1703 22 12.4147 22C10.5741 22 9.17547 20.3533 9.45744 18.5384L9.85181 16H5.98994C3.56858 16 1.71124 13.8576 2.03703 11.46L2.71645 6.46001C2.98543 4.48052 4.67151 3 6.66936 3L20 3C21.1046 3 22 3.89543 22 5L22 12C22 13.1046 21.1046 14 20 14H17.62L14.1967 20.8952ZM18 12H20L20 5H18L18 12Z"
    fill="currentColor"
  />,
);

export const AssistantRenameIcon = shellIcon(
  "AssistantRenameIcon",
  <>
    <path
      d="M13.5 5.99997L15.25 4.24997C16.4926 3.00733 18.5074 3.00733 19.75 4.24997C20.9926 5.49261 20.9926 7.50733 19.75 8.74997L18 10.5L7.79289 20.7071C7.60536 20.8946 7.351 21 7.08579 21H3V16.9142C3 16.649 3.10536 16.3946 3.29289 16.2071L13.5 5.99997Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 6L18 10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const AssistantDeleteIcon = shellIcon(
  "AssistantDeleteIcon",
  <>
    <path
      d="M5 6.5L5.80734 18.2064C5.91582 19.7794 7.22348 21 8.80023 21H15.1998C16.7765 21 18.0842 19.7794 18.1927 18.2064L19 6.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 11V16M14 11V16M3.5 6H20.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.07092 5.74621C8.42348 3.89745 10.0485 2.5 12 2.5C13.9515 2.5 15.5765 3.89745 15.9291 5.74621"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const SearchSparkleIcon = shellIcon(
  "SearchSparkleIcon",
  <>
    <path
      d="M9 4.29004C6.10851 5.15059 4 7.82914 4 11.0002C4 14.8662 7.13401 18.0002 11 18.0002C14.1711 18.0002 16.8497 15.8916 17.7102 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M19.9998 19.9998L16.0498 16.0498"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17.2405 4.18518L16.5436 2.37334C16.4571 2.14842 16.241 2 16 2C15.759 2 15.5429 2.14842 15.4564 2.37334L14.7595 4.18518C14.658 4.44927 14.4493 4.65797 14.1852 4.75955L12.3733 5.45641C12.1484 5.54292 12 5.75901 12 6C12 6.24099 12.1484 6.45708 12.3733 6.54359L14.1852 7.24045C14.4493 7.34203 14.658 7.55073 14.7595 7.81482L15.4564 9.62666C15.5429 9.85158 15.759 10 16 10C16.241 10 16.4571 9.85158 16.5436 9.62666L17.2405 7.81482C17.342 7.55073 17.5507 7.34203 17.8148 7.24045L19.6267 6.54359C19.8516 6.45708 20 6.24099 20 6C20 5.75901 19.8516 5.54292 19.6267 5.45641L17.8148 4.75955C17.5507 4.65797 17.342 4.44927 17.2405 4.18518Z"
      fill="currentColor"
    />
  </>,
);

export const StepUpIcon = shellIcon(
  "StepUpIcon",
  <>
    <path
      d="M12 5V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 10L12 4L18 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const StepDownIcon = shellIcon(
  "StepDownIcon",
  <>
    <path
      d="M18 14L12 20L6 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 19V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const FilterIcon = shellIcon(
  "FilterIcon",
  <>
    <path
      d="M5.95117 20.004V14.0015"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.95117 9.99999V3.99707"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 20.0038V13.0005"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8.99915V3.99707"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.0488 20.0036V16.002"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.0488 12.0008V3.99707"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0449 8.99902H13.9553"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.0938 16.002H20.0041"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.99609 14.0015H7.90643"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const SortIcon = shellIcon(
  "SortIcon",
  <>
    <path
      d="M6.0016 5V19M6.0016 19L3 16M6.0016 19L9 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 12H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const CardsViewIcon = shellIcon(
  "CardsViewIcon",
  <>
    <path
      d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z"
      stroke="currentColor"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z"
      stroke="currentColor"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z"
      stroke="currentColor"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 17C14 15.3431 15.3431 14 17 14C18.6569 14 20 15.3431 20 17C20 18.6569 18.6569 20 17 20C15.3431 20 14 18.6569 14 17Z"
      stroke="currentColor"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const ListViewIcon = shellIcon(
  "ListViewIcon",
  <>
    <path
      d="M10 6L20 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="4.5" cy="6" r="1.5" fill="currentColor" />
    <path
      d="M10 12L20 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
    <path
      d="M10 18L20 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="4.5" cy="18" r="1.5" fill="currentColor" />
  </>,
);

export const ManageIcon = shellIcon(
  "ManageIcon",
  <>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 10C16.6575 10 18 8.6575 18 7C18 5.3425 16.6575 4 15 4C13.3425 4 12 5.3425 12 7C12 8.6575 13.3425 10 15 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7H4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 7H18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 20C10.6575 20 12 18.6575 12 17C12 15.3425 10.6575 14 9 14C7.3425 14 6 15.3425 6 17C6 18.6575 7.3425 20 9 20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 17H4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 17H12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const ImportIcon = shellIcon(
  "ImportIcon",
  <>
    <path
      d="M3 9V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V8C21 6.34315 19.6569 5 18 5H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 5H7C9.76142 5 12 7.23858 12 10V15M12 15L15.75 11.25M12 15L8.25 11.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const WebsiteIcon = shellIcon(
  "WebsiteIcon",
  <>
    <path
      d="M17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V7C20 5.34315 18.6569 4 17 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.5L8.5 14L10 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 12.5L15.5 14L14 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const EditIcon = shellIcon(
  "EditIcon",
  <>
    <path
      d="M13.5 5.99997L15.25 4.24997C16.4926 3.00733 18.5074 3.00733 19.75 4.24997C20.9926 5.49261 20.9926 7.50733 19.75 8.74997L18 10.5L7.79289 20.7071C7.60536 20.8946 7.351 21 7.08579 21H3V16.9142C3 16.649 3.10536 16.3946 3.29289 16.2071L13.5 5.99997Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 6L18 10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const PlusIcon = shellIcon(
  "PlusIcon",
  <path
    d="M12 5.5V12M12 12V18.5M12 12H5.5M12 12H18.5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const CloseIcon = AssistantCloseIcon;

export const CopyIcon = AssistantCopyIcon;

export const DeleteIcon = AssistantDeleteIcon;
