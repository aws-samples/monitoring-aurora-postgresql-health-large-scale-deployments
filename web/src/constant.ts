import { DateRangePickerProps } from "@cloudscape-design/components";

export const DEFAULT_DATE_FILTER: DateRangePickerProps.RelativeValue = {
    key: "previous-90-days",
    type: "relative",
    amount: 90,
    unit: "day"
}

export const APP_NAME = "Aurora Postgres Health Monitor";