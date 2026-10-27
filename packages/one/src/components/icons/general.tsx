"use client";

import { shellIcon } from "./house-icon";

export const ArrowUpIcon = shellIcon(
  "ArrowUpIcon",
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

export const ArrowDownIcon = shellIcon(
  "ArrowDownIcon",
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

export const ArrowUpRightIcon = shellIcon(
  "ArrowUpRightIcon",
  <path
    d="M18 15V6M18 6H9M18 6L6.25 17.75"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const ChevronUpIcon = shellIcon(
  "ChevronUpIcon",
  <path
    d="M6 14.5L12 8.5L18 14.5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const ChevronUpDownIcon = shellIcon(
  "ChevronUpDownIcon",
  <>
    <path
      d="M8 8.99981L11.1161 5.88369C11.6043 5.39554 12.3957 5.39554 12.8839 5.8837L16 8.99981"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 15L11.1161 18.1161C11.6043 18.6043 12.3957 18.6043 12.8839 18.1161L16 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const CornerDownLeftIcon = shellIcon(
  "CornerDownLeftIcon",
  <>
    <path
      d="M20 5V12C20 13.6569 18.6569 15 17 15H5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 11L4 15L8 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const CircleIcon = shellIcon(
  "CircleIcon",
  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />,
);

export const AlertCircleIcon = shellIcon(
  "AlertCircleIcon",
  <>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M11.157 12.2558L10.6861 8.48843C10.5873 7.69809 11.2035 7 12 7C12.7965 7 13.4127 7.69807 13.314 8.4884L12.8431 12.2558C12.7899 12.6809 12.4285 13 12.0001 13C11.5716 13 11.2102 12.681 11.157 12.2558Z"
      fill="currentColor"
    />
    <circle cx="12" cy="15.7996" r="1.2" fill="currentColor" />
  </>,
);

export const CircleXIcon = shellIcon(
  "CircleXIcon",
  <path
    d="M15 9L9 15M15 15L9 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const HelpIcon = shellIcon(
  "HelpIcon",
  <>
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16V16.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 13C12 11.3608 14 11.9319 14 10C14 8.89543 13.1046 8 12 8C11.2597 8 10.6134 8.4022 10.2676 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const UserCircleIcon = shellIcon(
  "UserCircleIcon",
  <>
    <path
      d="M17.8841 18.8103C16.5544 17.0943 14.4995 16 12 16C9.50054 16 7.44562 17.0943 6.11594 18.8103M17.8841 18.8103C19.7925 17.16 21 14.721 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 14.721 4.20753 17.16 6.11594 18.8103M17.8841 18.8103C16.3063 20.1747 14.2495 21 12 21C9.75046 21 7.69368 20.1747 6.11594 18.8103"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </>,
);

export const BanIcon = shellIcon(
  "BanIcon",
  <>
    <path
      d="M21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364C4.00736 16.7353 3 14.4853 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604C19.9926 7.26472 21 9.51472 21 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </>,
);

export const VerifiedIcon = shellIcon(
  "VerifiedIcon",
  <>
    <path
      d="M10.8014 3.54682C11.4349 2.81773 12.567 2.81773 13.2005 3.54682L14.0044 4.47215C14.364 4.88598 14.9115 5.08524 15.4529 4.99935L16.6636 4.8073C17.6175 4.65598 18.4847 5.38364 18.5013 6.34935L18.5224 7.57499C18.5319 8.12312 18.8232 8.62767 19.2931 8.9099L20.344 9.541C21.1721 10.0382 21.3686 11.1531 20.7606 11.9036L19.989 12.856C19.6439 13.282 19.5427 13.8557 19.7213 14.374L20.1207 15.533C20.4353 16.4461 19.8693 17.4265 18.9211 17.6106L17.7178 17.8442C17.1796 17.9486 16.7333 18.3231 16.537 18.835L16.098 19.9795C15.7521 20.8813 14.6883 21.2685 13.8436 20.8L12.7717 20.2055C12.2922 19.9396 11.7096 19.9396 11.2302 20.2055L10.1583 20.8C9.31361 21.2685 8.24983 20.8813 7.90392 19.9795L7.4649 18.835C7.26856 18.3231 6.82226 17.9486 6.2841 17.8442L5.08075 17.6106C4.13259 17.4265 3.56657 16.4461 3.88124 15.533L4.28061 14.374C4.45921 13.8557 4.35804 13.282 4.01294 12.856L3.24128 11.9036C2.63326 11.1531 2.82984 10.0382 3.65786 9.541L4.70875 8.9099C5.17872 8.62767 5.47002 8.12312 5.47946 7.57499L5.50056 6.34935C5.51718 5.38364 6.38438 4.65597 7.33831 4.8073L8.54899 4.99935C9.09043 5.08524 9.6379 4.88598 9.99745 4.47215L10.8014 3.54682Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9.5 12.5L10.6465 13.6465C10.8417 13.8417 11.1583 13.8417 11.3536 13.6465L14.5 10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const ShieldCheckIcon = shellIcon(
  "ShieldCheckIcon",
  <path
    d="M9 12L11 14L15 9.99999M10.7975 3.02606L5.79754 5.21356C4.70558 5.6913 4 6.77014 4 7.96204V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V7.96204C20 6.77014 19.2944 5.6913 18.2025 5.21356L13.2025 3.02606C12.4359 2.69069 11.5641 2.69069 10.7975 3.02606Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const LockIcon = shellIcon(
  "LockIcon",
  <>
    <path
      d="M5 13C5 11.3431 6.34315 10 8 10H16C17.6569 10 19 11.3431 19 13V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V13Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 9.5V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V9.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const MinusIcon = shellIcon(
  "MinusIcon",
  <path
    d="M5.5 12H18.5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const SquareIcon = shellIcon(
  "SquareIcon",
  <path
    d="M17 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V7C20 5.34315 18.6569 4 17 4Z"
    stroke="currentColor"
    strokeWidth="2"
  />,
);

export const LoaderIcon = shellIcon(
  "LoaderIcon",
  <path
    d="M12.0003 3V6M12.0003 18V21M5.63634 5.63604L7.75766 7.75736M16.2429 16.2426L18.3643 18.364M3 12.0007H6M18 12.0007H21M5.63634 18.364L7.75766 16.2426M16.2429 7.75736L18.3643 5.63604"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const RotateCcwIcon = shellIcon(
  "RotateCcwIcon",
  <>
    <path
      d="M4.4834 14.6667C5.58163 17.7738 8.54493 20 12.0282 20C16.4465 20 20.0282 16.4183 20.0282 12C20.0282 7.58172 16.4465 4 12.0282 4C8.93224 4 6.99986 5.5 4.99986 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 4V8H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const RotateCwIcon = shellIcon(
  "RotateCwIcon",
  <>
    <path
      d="M19.5165 14.6667C18.4182 17.7738 15.4549 20 11.9717 20C7.5534 20 3.97168 16.4183 3.97168 12C3.97168 7.58172 7.5534 4 11.9717 4C15.0676 4 17 5.5 19 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 4V8H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const RepeatIcon = shellIcon(
  "RepeatIcon",
  <>
    <path
      d="M17.5 3L19.7929 5.29289C20.1834 5.68342 20.1834 6.31658 19.7929 6.70711L17.5 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.49985 21L4.20696 18.7071C3.81643 18.3166 3.81643 17.6834 4.20696 17.2929L6.49985 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 18H17C18.6569 18 20 16.6569 20 15V13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 11V9C4 7.34315 5.34315 6 7 6H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const StoreIcon = shellIcon(
  "StoreIcon",
  <>
    <path
      d="M14.4996 4H9.49956L9.2133 8.00762C9.0978 9.62461 10.3785 11 11.9996 11C13.6207 11 14.9013 9.62461 14.7858 8.00763L14.4996 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.50047 4H6.60236C5.10941 4 3.84364 5.09779 3.63251 6.57573L3.4699 7.71396C3.22214 9.44831 4.56792 11 6.31987 11C7.83025 11 9.08385 9.83276 9.19146 8.32621L9.50047 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.3981 4H14.5L14.809 8.32621C14.9166 9.83276 16.1702 11 17.6806 11C19.4326 11 20.7783 9.44831 20.5306 7.71396L20.368 6.57574C20.1568 5.09779 18.8911 4 17.3981 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 10V17C4 18.6569 5.34315 20 7 20H10V17C10 15.8954 10.8954 15 12 15C13.1046 15 14 15.8954 14 17V20H17C18.6569 20 20 18.6569 20 17V10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const ShoppingBagIcon = shellIcon(
  "ShoppingBagIcon",
  <path
    d="M14.9982 8C14.9982 9.65685 13.655 11 11.9982 11C10.3413 11 8.99817 9.65685 8.99817 8M4.82237 6.81287L4.19737 16.8129C4.08942 18.54 5.46106 20 7.19153 20H16.8048C18.5353 20 19.9069 18.54 19.799 16.8129L19.174 6.81287C19.0752 5.23176 17.764 4 16.1798 4H7.81653C6.23234 4 4.92119 5.23176 4.82237 6.81287Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />,
);

export const CartIcon = shellIcon(
  "CartIcon",
  <path
    d="M2 3H2.72931C3.46257 3 4.08835 3.53012 4.2089 4.2534L4.5 6M4.5 6L5.5822 12.4932C5.82329 13.9398 7.07486 15 8.54138 15H17.0271C18.4632 15 19.6979 13.9823 19.972 12.5726L20.9027 7.7863C21.0827 6.86035 20.3735 6 19.4302 6H4.5ZM9 19C9 19.5523 8.55228 20 8 20C7.44772 20 7 19.5523 7 19C7 18.4477 7.44772 18 8 18C8.55228 18 9 18.4477 9 19ZM18 19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19C16 18.4477 16.4477 18 17 18C17.5523 18 18 18.4477 18 19Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const ReceiptTextIcon = shellIcon(
  "ReceiptTextIcon",
  <path
    d="M9 8H15M9 12H11M19 21V6C19 4.34315 17.6569 3 16 3H8C6.34315 3 5 4.34315 5 6V21L7.33333 19L9.66667 21L12 19L14.3333 21L16.6667 19L19 21Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const ReceiptIcon = shellIcon(
  "ReceiptIcon",
  <>
    <path
      d="M19 6V21L16.6667 19L14.3333 21L12 19L9.66667 21L7.33333 19L5 21V6C5 4.34315 6.34315 3 8 3H16C17.6569 3 19 4.34315 19 6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 13.9076C10.1429 16.0273 15 15.8295 15 13.4502C15 10.6787 9.25 12.1055 9.25 9.03571C9.25 6.87716 13.1144 6.51466 14.64 8.11595"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 16.5V6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const CreditCardIcon = shellIcon(
  "CreditCardIcon",
  <path
    d="M3 10V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V10M3 10V8C3 6.34315 4.34315 5 6 5H18C19.6569 5 21 6.34315 21 8V10M3 10H21M7 14H10"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const CoinsIcon = shellIcon(
  "CoinsIcon",
  <path
    d="M9 16C5.68629 16 3 13.3137 3 10C3 6.68629 5.68629 4 9 4C11.4597 4 13.5737 5.48012 14.5 7.59829M21 14C21 17.3137 18.3137 20 15 20C12.3841 20 10.1591 18.3259 9.33811 15.9906C9.11911 15.3677 9 14.6978 9 14C9 10.7998 11.5055 8.1847 14.6619 8.00937C14.7738 8.00315 14.8865 8 15 8C18.3137 8 21 10.6863 21 14Z"
    stroke="currentColor"
    strokeWidth="2"
  />,
);

export const BankIcon = shellIcon(
  "BankIcon",
  <>
    <path
      d="M10.6584 3.17084L3.68328 6.65838C3.26452 6.86776 3 7.29577 3 7.76396C3 8.44662 3.55341 9.00002 4.23607 9.00002H19.7639C20.4466 9.00002 21 8.44662 21 7.76396C21 7.29577 20.7355 6.86776 20.3167 6.65838L13.3416 3.17084C12.4971 2.74855 11.5029 2.74855 10.6584 3.17084Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M19.7643 20H4.23627C3.62821 20 3.19884 19.4043 3.39113 18.8274C3.7549 17.7361 4.77619 17 5.92655 17H18.074C19.2243 17 20.2456 17.7361 20.6094 18.8274C20.8017 19.4043 20.3723 20 19.7643 20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M19 9V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M15 17V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M5 9V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
    <path
      d="M9 17V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </>,
);

export const TruckIcon = shellIcon(
  "TruckIcon",
  <>
    <path
      d="M4.5 17H4C2.89543 17 2 16.1046 2 15V8C2 6.34315 3.34315 5 5 5H11C12.1046 5 13 5.89543 13 7H16.4174C17.7226 7 18.9458 7.63684 19.6943 8.70615L21.2769 10.967C21.7476 11.6394 22 12.4402 22 13.2609V15C22 16.1046 21.1046 17 20 17H19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M13 7V16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 17H14.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7"
      cy="16.75"
      r="2.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="17"
      cy="16.75"
      r="2.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const TagIcon = shellIcon(
  "TagIcon",
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

export const TagsIcon = shellIcon(
  "TagsIcon",
  <>
    <path
      d="M9.61611 7.28462C9.61611 7.54751 9.40298 7.76064 9.14009 7.76064C8.87719 7.76064 8.66406 7.54751 8.66406 7.28462C8.66406 7.02172 8.87719 6.80859 9.14009 6.80859C9.40298 6.80859 9.61611 7.02172 9.61611 7.28462Z"
      stroke="currentColor"
      strokeWidth="1.90409"
      strokeLinecap="square"
    />
    <path
      d="M4.85547 10.3854V5.85614C4.85547 4.27874 6.13421 3 7.71161 3H12.2409C12.9983 3 13.7248 3.30091 14.2604 3.83654L21.1628 10.7389C22.2782 11.8543 22.2782 13.6626 21.1628 14.778L16.6335 19.3073C15.5181 20.4227 13.7098 20.4227 12.5944 19.3073L5.69201 12.405C5.15638 11.8694 4.85547 11.1428 4.85547 10.3854Z"
      stroke="currentColor"
      strokeWidth="1.90409"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M9.04297 7.28418H9.23338"
      stroke="currentColor"
      strokeWidth="1.90409"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M2 8.71191V13.2412C2 13.9986 2.30091 14.7251 2.83654 15.2607L9.73889 22.1631C10.8543 23.2785 12.6626 23.2785 13.778 22.1631"
      stroke="currentColor"
      strokeWidth="1.90409"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const PackageXIcon = shellIcon(
  "PackageXIcon",
  <>
    <path
      d="M20.6604 9.77106C20.6604 8.76147 20.6604 8.25666 20.5135 7.80477C20.3836 7.40493 20.1711 7.03686 19.8898 6.72442C19.5718 6.37132 19.1347 6.11892 18.2604 5.61413L14.4001 3.38541C13.5258 2.88061 13.0886 2.62821 12.6238 2.52942C12.2126 2.44201 11.7876 2.44201 11.3764 2.52942C10.9116 2.62821 10.4744 2.88061 9.6001 3.38541L5.73984 5.61413C4.86551 6.11892 4.42835 6.37132 4.11041 6.72442C3.8291 7.03686 3.61659 7.40493 3.48667 7.80477C3.33984 8.25666 3.33984 8.76147 3.33984 9.77106V14.2285C3.33984 15.2381 3.33984 15.7429 3.48667 16.1948C3.61659 16.5946 3.8291 16.9627 4.11041 17.2751C4.42835 17.6282 4.86551 17.8806 5.73984 18.3854L9.6001 20.6141C10.4744 21.1189 10.9116 21.3713 11.3764 21.4701C11.7876 21.5575 12.2126 21.5575 12.6238 21.4701C13.0886 21.3713 13.5258 21.1189 14.4001 20.6141"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20.6604 7L12.0001 12M12.0001 12V22M12.0001 12L3.33984 7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M7.67188 4.5L16.3321 9.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 13L21 18M21 13L16 18"
      stroke="currentColor"
      strokeWidth="1.81818"
      strokeLinecap="round"
    />
  </>,
);

export const ScaleIcon = shellIcon(
  "ScaleIcon",
  <path
    d="M12 3V20M12 20H7M12 20H17M3 6H7.2918C7.75753 6 8.21687 5.89156 8.63344 5.68328L9.36656 5.31672C9.78313 5.10844 10.2425 5 10.7082 5H13.2918C13.7575 5 14.2169 5.10844 14.6334 5.31672L15.3666 5.68328C15.7831 5.89156 16.2425 6 16.7082 6H21M5.5 6L3.28066 12.658C2.82713 14.0186 3.38797 15.6344 4.80823 15.8338C5.27041 15.8987 5.72959 15.8987 6.19177 15.8338C7.61203 15.6344 8.17287 14.0186 7.71934 12.658L5.5 6ZM18.5 6L16.2807 12.658C15.8271 14.0186 16.388 15.6344 17.8082 15.8338C18.2704 15.8987 18.7296 15.8987 19.1918 15.8338C20.612 15.6344 21.1729 14.0186 20.7193 12.658L18.5 6Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const UsersIcon = shellIcon(
  "UsersIcon",
  <>
    <path
      d="M9 10C7.067 10 5.5 8.433 5.5 6.5C5.5 4.567 7.067 3 9 3C10.933 3 12.5 4.567 12.5 6.5C12.5 8.433 10.933 10 9 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3C16.933 3 18.5 4.567 18.5 6.5C18.5 8.433 16.933 10 15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.00046 13C5.75801 13 2.9661 14.6879 1.70973 17.1143C0.947894 18.5856 2.3436 20 4.00046 20H14.0005C15.6573 20 17.053 18.5856 16.2912 17.1143C15.0348 14.6879 12.2429 13 9.00046 13Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13.5088C20.0779 14.2448 21.722 15.7225 22.5034 17.5667C23.0421 18.838 21.8807 20 20.5 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const UserIcon = shellIcon(
  "UserIcon",
  <>
    <path
      d="M7.75 20C6.09315 20 4.69455 18.6232 5.20302 17.0463C6.12257 14.1946 8.42872 12 12 12C15.5713 12 17.8774 14.1946 18.797 17.0463C19.3055 18.6232 17.9069 20 16.25 20H7.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7.75"
      r="4.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </>,
);

export const UserPlusIcon = shellIcon(
  "UserPlusIcon",
  <>
    <path
      d="M11 20H7.75C6.09315 20 4.69455 18.6232 5.20302 17.0463C6.12257 14.1946 8.42872 12 12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7.75"
      r="4.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M18 14V20M21 17H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const UserSearchIcon = shellIcon(
  "UserSearchIcon",
  <>
    <path
      d="M10.0006 20H7.7506C6.09375 20 4.69515 18.6232 5.20362 17.0463C6.12317 14.1946 8.42932 12 12.0006 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12C14.3472 12 16.25 10.0972 16.25 7.75C16.25 5.40279 14.3472 3.5 12 3.5C9.65279 3.5 7.75 5.40279 7.75 7.75C7.75 10.0972 9.65279 12 12 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M16.5037 18.4496C14.9988 18.4496 13.7789 17.2297 13.7789 15.7248C13.7789 14.2199 14.9988 13 16.5037 13C18.0086 13 19.2285 14.2199 19.2285 15.7248C19.2285 17.2297 18.0086 18.4496 16.5037 18.4496Z"
      stroke="currentColor"
      strokeWidth="2.07615"
      strokeLinecap="round"
    />
    <path
      d="M13 20L15 18"
      stroke="currentColor"
      strokeWidth="2.07615"
      strokeLinecap="round"
    />
  </>,
);

export const UserXIcon = shellIcon(
  "UserXIcon",
  <>
    <path
      d="M11 20H7.75C6.09315 20 4.69455 18.6232 5.20302 17.0463C6.12257 14.1946 8.42872 12 12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7.75"
      r="4.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M20.25 15L18 17.25M18 17.25L15.75 19.5M18 17.25L15.75 15M18 17.25L20.25 19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const FileTextIcon = shellIcon(
  "FileTextIcon",
  <>
    <path
      d="M12.1716 3H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V9.82843C19 9.29799 18.7893 8.78929 18.4142 8.41421L13.5858 3.58579C13.2107 3.21071 12.702 3 12.1716 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M13 3.5V7C13 8.10457 13.8954 9 15 9H18.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 13H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 17H15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>,
);

export const FileDownIcon = shellIcon(
  "FileDownIcon",
  <>
    <path
      d="M8 21C6.34315 21 5 19.6569 5 18V6C5 4.34315 6.34315 3 8 3H12.1716C12.702 3 13.2107 3.21071 13.5858 3.58579L18.4142 8.41421C18.7893 8.78929 19 9.29799 19 9.82843V18C19 19.6569 17.6569 21 16 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 3.5V7C13 8.10457 13.8954 9 15 9H18.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V20L14.5 17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 20L9.5 17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const FilesIcon = shellIcon(
  "FilesIcon",
  <>
    <path
      d="M11 3H13.7574C14.553 3 15.3161 3.31607 15.8787 3.87868L19.1213 7.12132C19.6839 7.68393 20 8.44699 20 9.24264V15C20 16.6569 18.6569 18 17 18H11C9.34315 18 8 16.6569 8 15V6C8 4.34315 9.34315 3 11 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 18C17 19.6569 15.6569 21 14 21H8C6.34315 21 5 19.6569 5 18V9C5 7.34315 6.34315 6 8 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3V6C15 7.10457 15.8954 8 17 8H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const ScrollIcon = shellIcon(
  "ScrollIcon",
  <>
    <path
      d="M7 20H5.5C4.39543 20 3.5 19.1046 3.5 18V17C3.5 16.4477 3.94772 16 4.5 16H12.5C13.0523 16 13.5 16.4477 13.5 17V18.25C13.5 19.2165 14.2835 20 15.25 20C16.2165 20 17 19.2165 17 18.25V5.75C17 4.7835 17.7835 4 18.75 4C19.7165 4 20.5 4.7835 20.5 5.75V8C20.5 8.55228 20.0523 9 19.5 9H17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 4H8C6.89543 4 6 4.89543 6 6V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 20H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 8.5H10L11 8L12 8.5H13.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 12H10L11 11.5L12 12H13.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const SaveIcon = shellIcon(
  "SaveIcon",
  <>
    <path
      d="M4 7C4 5.34315 5.34315 4 7 4H15.7574C16.553 4 17.3161 4.31607 17.8787 4.87868L19.1213 6.12132C19.6839 6.68393 20 7.44699 20 8.24264V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 19V14C8 13.4477 8.44772 13 9 13H15C15.5523 13 16 13.4477 16 14V19C16 19.5523 15.5523 20 15 20H9C8.44772 20 8 19.5523 8 19Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 4V7C8 7.55228 8.44772 8 9 8H15C15.5523 8 16 7.55228 16 7V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

export const InboxIcon = shellIcon(
  "InboxIcon",
  <path
    d="M3 12H7.25C8.03689 12 8.77786 12.3705 9.25 13C9.72214 13.6295 10.4631 14 11.25 14H12.75C13.5369 14 14.2779 13.6295 14.75 13C15.2221 12.3705 15.9631 12 16.75 12H21M21.6047 11.3083L18.8638 6.51158C18.3296 5.57686 17.3356 5 16.259 5H7.74097C6.6644 5 5.67037 5.57686 5.13624 6.51158L2.39527 11.3083C2.13625 11.7616 2 12.2746 2 12.7967V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V12.7967C22 12.2746 21.8638 11.7616 21.6047 11.3083Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);

export const BookOpenIcon = shellIcon(
  "BookOpenIcon",
  <path
    d="M12 8C12 6.34315 13.3431 5 15 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H15.277C14.5966 19 13.9296 19.1642 13.3508 19.5219C12.772 19.8796 12.3043 20.3914 12 21M12 8C12 6.34315 10.6569 5 9 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H8.723C9.40341 19 10.0704 19.1642 10.6492 19.5219C11.228 19.8796 11.6957 20.3914 12 21M12 8V21"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);
