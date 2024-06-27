import { DateRangePickerProps } from "@cloudscape-design/components";

export const getRangeStartAsEpoc = (range: number, unit = 'minutes') => {
    const currentEpochTime = getCurrentEpochTime();
    switch (unit) {
        case 'second':
            return currentEpochTime - range;
        case 'minute':
            return currentEpochTime - range * 60;
        case 'hour':
            return currentEpochTime - range * 60 * 60;
        case 'day':
            return currentEpochTime - range * 24 * 60 * 60;
        case 'week':
            return currentEpochTime - range * 7 * 24 * 60 * 60;
        case 'month':
            return currentEpochTime - range * 30 * 24 * 60 * 60; // Assuming 30 days per month
        case 'year':
            return currentEpochTime - range * 365 * 24 * 60 * 60; // Assuming 365 days per year
        default:
            return currentEpochTime;
    }
}

export const getCurrentEpochTime = (): number => {
    return Math.floor(Date.now() / 1000);
}

export const wait = async (ms: number = 500) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isRelativeValue = (value: DateRangePickerProps.Value): value is DateRangePickerProps.RelativeValue => {
    return (value as DateRangePickerProps.RelativeValue).type === 'relative';
}