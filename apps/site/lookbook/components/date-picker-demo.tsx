"use client";

import { useState } from "react";

import {
  DatePicker,
  DateTimePicker,
  type DateTimePickerLabels,
} from "@sirdab/one/components/date-time-picker";
import { Label } from "@sirdab/one/components/label";
import { sampler } from "./samples";

export function DatePickerDemo({
  lang,
  withTime,
}: {
  lang: string;
  withTime: boolean;
}): React.JSX.Element {
  const s = sampler(lang);
  const [starts, setStarts] = useState<Date | null>(null);
  const [ends, setEnds] = useState<Date | null>(null);

  const labels: DateTimePickerLabels = {
    time: s("Time"),
    hour: s("Hour"),
    minute: s("Minute"),
    clear: s("Clear"),
  };

  const Picker = withTime ? DateTimePicker : DatePicker;

  return (
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label id="lookbook-starts">{s("Starts")}</Label>
        <Picker
          aria-labelledby="lookbook-starts"
          value={starts}
          onChange={setStarts}
          locale={lang}
          placeholder={s("Right away")}
          labels={labels}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label id="lookbook-ends">{s("Ends")}</Label>
        <Picker
          aria-labelledby="lookbook-ends"
          value={ends}
          onChange={setEnds}
          locale={lang}
          placeholder={s("Never")}
          labels={labels}
          defaultTime={{ hours: 23, minutes: 59 }}
        />
      </div>
    </div>
  );
}
