import { DateRangePickerProps } from "@cloudscape-design/components";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getMetricDetails } from "../api/get-metricDetails";


export const useMetricsDetails = (
    range: DateRangePickerProps.RelativeValue,
    metricName: string,
    options?: UseQueryOptions
) => {
    return useQuery({
        queryKey: ["metricsDetails", range.amount, range.unit, metricName],
        queryFn: () => {
            return getMetricDetails(range, metricName);
        },
        ...options,
    });
};


