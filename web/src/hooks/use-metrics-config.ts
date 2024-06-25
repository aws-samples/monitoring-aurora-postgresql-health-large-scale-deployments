import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getMetricsConfig } from "../api/get-metricsConfig";


export const useMetricsConfig = (
    options?: UseQueryOptions
) => {
    return useQuery({
        queryKey: ["metricsConfig"],
        queryFn: () => {
            return getMetricsConfig();
        },
        ...options,
    });
};


