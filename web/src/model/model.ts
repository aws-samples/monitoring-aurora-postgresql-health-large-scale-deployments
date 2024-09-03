export interface MetricSummary {
        metricName: string,
        UnhealthyInstances: number,
        HealthyInstances: number
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
    MetricValue: number,
    DateHourTimeZone: number
}