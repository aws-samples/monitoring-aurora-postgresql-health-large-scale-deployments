export interface MetricSummary {
    [k: string]: MetricInfo[]
}

export interface MetricInfo {
    title: string
    value: number
}

export interface MetricConfig {
    metricName: string,
    threshold: number,
    helpText: string
}

export interface MetricItem {
    InstanceId: string,
    MetricName: string,
    MetricValueAverage: number,
    DateHourTimeZone: number
}