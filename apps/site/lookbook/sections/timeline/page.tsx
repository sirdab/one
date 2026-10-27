import { formatPrice } from "@sirdab/one/foundation";

import { RotateCcwIcon } from "@sirdab/one/icons/general";
import {
  CustomersIcon,
  OrdersIcon,
  ProductsIcon,
} from "@sirdab/one/icons/shell";
import { MessageIcon } from "@sirdab/one/icons/system";
import {
  Timeline,
  TimelineDay,
  TimelineItem,
} from "@sirdab/one/components/timeline";
import { toNumeralLocale } from "../../../lookbook/components/numeral-locale";
import { PageHeader, Section } from "../../../lookbook/components/section";

interface Copy {
  locale: "ar" | "en";
  today: string;
  yesterday: string;
  placed: string;
  placedLine: string;
  refund: string;
  refundLine: string;
  message: string;
  messageLine: string;
  messageBody: string;
  stock: string;
  stockLine: string;
  shipped: string;
  shippedLine: string;
  paid: string;
  bare: string;
  bulk: string;
  bulkLine: string;
}

const AR: Copy = {
  locale: "ar",
  today: "اليوم",
  yesterday: "أمس",
  placed: "وصل طلب جديد رقم 1042",
  placedLine: "عطر عود ملكي",
  refund: "الاسترجاع لسا ما انتأكد",
  refundLine: "طلب 1038",
  message: "رسالة من سارة",
  messageLine: "على الطلب 1042",
  messageBody: "السلام عليكم، ممكن أغير عنوان التوصيل قبل الشحن؟",
  stock: "المخزون قارب على النفاد",
  stockLine: "شمعة معطرة",
  shipped: "تم شحن الطلب رقم 1041",
  shippedLine: "شنطة جلد يدوية",
  paid: "تم دفع الطلب رقم 1039",
  bare: "أحد أعضاء الفريق عدّل وصف المنتج",
  bulk: "تم تجهيز 12 طلب دفعة وحدة: عطر عود ملكي، شنطة جلد يدوية، شمعة معطرة، وبخور مبخرة فضية",
  bulkLine: "شحن جماعي إلى الرياض وجدة والدمام",
};

const EN: Copy = {
  locale: "en",
  today: "Today",
  yesterday: "Yesterday",
  placed: "New order 1042 came in",
  placedLine: "Royal oud perfume",
  refund: "Refund not confirmed yet",
  refundLine: "Order 1038",
  message: "Message from Sara",
  messageLine: "On order 1042",
  messageBody: "Hi, can I change the delivery address before it ships?",
  stock: "Stock is running low",
  stockLine: "Scented candle",
  shipped: "Order 1041 was shipped",
  shippedLine: "Handmade leather tote",
  paid: "Order 1039 was paid",
  bare: "A team member edited the product description",
  bulk: "12 orders were fulfilled in one go: royal oud perfume, handmade leather tote, scented candle, and a silver incense burner",
  bulkLine: "Bulk shipment to Riyadh, Jeddah and Dammam",
};

function Board({ copy }: { copy: Copy }): React.JSX.Element {
  const nl = toNumeralLocale(copy.locale);
  const dir = copy.locale === "ar" ? "rtl" : "ltr";
  return (
    <div dir={dir} lang={copy.locale} className="max-w-xl">
      <Timeline>
        <TimelineDay heading={copy.today}>
          <TimelineItem
            icon={OrdersIcon}
            title={copy.placed}
            description={`${copy.placedLine} · ${formatPrice(124950, { locale: nl })}`}
            time="09:40"
          />
          <TimelineItem
            icon={RotateCcwIcon}
            tone="critical"
            title={copy.refund}
            description={`${copy.refundLine} · ${formatPrice(24900, { locale: nl })}`}
            time="09:12"
          />
          <TimelineItem
            icon={MessageIcon}
            title={copy.message}
            description={copy.messageLine}
            time="08:30"
          >
            {copy.messageBody}
          </TimelineItem>
        </TimelineDay>
        <TimelineDay heading={copy.yesterday}>
          <TimelineItem
            icon={ProductsIcon}
            tone="warning"
            title={copy.stock}
            description={copy.stockLine}
            time="21:05"
          />
          <TimelineItem
            asChild
            icon={CustomersIcon}
            tone="success"
            title={copy.shipped}
            description={copy.shippedLine}
            time="16:20"
          >
            <a href="#" />
          </TimelineItem>
          <TimelineItem
            icon={OrdersIcon}
            title={copy.paid}
            description={formatPrice(4900, { locale: nl })}
            time="11:48"
          />
          <TimelineItem title={copy.bare} time="10:15" />
          <TimelineItem
            icon={OrdersIcon}
            title={copy.bulk}
            description={copy.bulkLine}
            time="09:02"
          />
        </TimelineDay>
      </Timeline>
    </div>
  );
}

export default async function TimelinePage(): Promise<React.JSX.Element> {
  return (
    <>
      <PageHeader
        title="Timeline"
        tagline="A log of what happened, one card per day."
      />
      <Section
        title="Arabic"
        caption="right to left, clock times stay LTR"
        bare
      >
        <Board copy={AR} />
      </Section>
      <Section
        title="English"
        caption="critical glyph, detail well, link row"
        bare
      >
        <Board copy={EN} />
      </Section>
    </>
  );
}
