import { DateRangePickerProps } from "@cloudscape-design/components";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getMetricSummary } from "../api/get-summary";


export const useMetricsSummary = (
    range: DateRangePickerProps.RelativeValue,
    metricName : string,
    options?: UseQueryOptions
) => {

    return useQuery({
        queryKey: ["metricsSummary", range, metricName],
        queryFn: () => {
            return getMetricSummary(range, metricName);
        },
        ...options,
    });
};


