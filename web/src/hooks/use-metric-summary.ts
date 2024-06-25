import { DateRangePickerProps } from "@cloudscape-design/components";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getMetricSummary } from "../api/get-summary";


export const useMetricsSummary = (
    range: DateRangePickerProps.RelativeValue,
    options?: UseQueryOptions
) => {

    return useQuery({
        queryKey: ["metricsSummary", range],
        queryFn: () => {
            return getMetricSummary(range);
        },
        ...options,
    });
};


