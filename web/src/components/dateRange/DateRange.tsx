import DateRangePicker, { DateRangePickerProps } from "@cloudscape-design/components/date-range-picker";
import { DEFAULT_DATE_FILTER } from "../../constant";

interface IDateRangeProps {
    value: DateRangePickerProps.Value,
    setValue: (value: DateRangePickerProps.Value) => void,
}
// Define the CustomEventStub interface
interface CustomEventStub<T = unknown> extends CustomEvent {
    detail: T;
}

const RelativeDateRangePicker = ({ value, setValue }: IDateRangeProps) => {

    return (
        <DateRangePicker
            value={value}
            onChange={(changeDetail: CustomEventStub<DateRangePickerProps.ChangeDetail>) => {

                if (changeDetail && changeDetail.detail && changeDetail.detail.value) {
                    setValue(changeDetail.detail.value)
                } else {
                    setValue(DEFAULT_DATE_FILTER)
                }
            }}
            rangeSelectorMode="relative-only"
            isValidRange={() => ({ valid: true })}
            relativeOptions={[
                {
                    key: "previous-90-days",
                    amount: 90,
                    unit: "day",
                    type: "relative"
                },
                {
                    key: "previous-30-days",
                    amount: 30,
                    unit: "day",
                    type: "relative"
                },
                {
                    key: "previous-7-days",
                    amount: 7,
                    unit: "day",
                    type: "relative"
                }
            ]}
            i18nStrings={{}}
            placeholder="Filter by a time range"
        />
    );
}

export default RelativeDateRangePicker;