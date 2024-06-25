export const metricsConfig = [
    {
        "metricName": "BufferCacheHitRatio",
        "threshold": 90,
        "helpText": "This metric measures the percentage of requests that are served by the buffer cache of a DB instance in your DB cluster. This metric gives you an insight into the amount of data that is being served from memory. A high hit ratio indicates that your DB instance has enough memory available.A low hit ratio indicates that your queries on this DB instance are frequently going to disk.Investigate your workload to see which queries are causing this behavior"
    },
    {
        "metricName": "Freeable Memory",
        "threshold": 60,
        "helpText": "How much RAM is available on the DB instance, in bytes. The red line in the Monitoring tab metrics is marked at 75% for CPU, Memory and Storage Metrics. If instance memory consumption frequently crosses that line, then this indicates that you should check your workload or upgrade your instance. "
    },
    {
        "metricName": "CPU Utlization",
        "threshold": 75,
        "helpText": "Percentage of computer processing capacity used."
    },
]

export const metricSummary = {
    "BufferCacheHitRatio": [
        {
            "title": "Healthy Instances",
            "value": 60
        },
        {
            "title": "Unhealthy Instances",
            "value": 20
        }
    ],
    "Freeable Memory": [
        {
            "title": "Healthy Instances",
            "value": 80
        },
        {
            "title": "Unhealthy Instances",
            "value": 20
        }
    ],
    "CPU Utlization": [
        {
            "title": "Healthy Instances",
            "value": 20
        },
        {
            "title": "Unhealthy Instances",
            "value": 60
        }
    ],

}

export const metricDetails = [
    {
        "InstanceId": "i-0a1234567890abcd1",
        "MetricName": "CPUUtilization",
        "MetricValueAverage": 12.3,
        "DateHourTimeZone": 1622505600
    },
    {
        "InstanceId": "i-0a1234567890abcd2",
        "MetricName": "MemoryUsage",
        "MetricValueAverage": 65.4,
        "DateHourTimeZone": 1622509200
    },
    {
        "InstanceId": "i-0a1234567890abcd3",
        "MetricName": "DiskReadOps",
        "MetricValueAverage": 89.1,
        "DateHourTimeZone": 1622512800
    },
    {
        "InstanceId": "i-0a1234567890abcd4",
        "MetricName": "NetworkIn",
        "MetricValueAverage": 120.5,
        "DateHourTimeZone": 1622516400
    },
    {
        "InstanceId": "i-0a1234567890abcd5",
        "MetricName": "NetworkOut",
        "MetricValueAverage": 98.7,
        "DateHourTimeZone": 1622520000
    },
    {
        "InstanceId": "i-0a1234567890abcd6",
        "MetricName": "DiskWriteOps",
        "MetricValueAverage": 45.6,
        "DateHourTimeZone": 1622523600
    },
    {
        "InstanceId": "i-0a1234567890abcd7",
        "MetricName": "CPUUtilization",
        "MetricValueAverage": 23.8,
        "DateHourTimeZone": 1622527200
    },
    {
        "InstanceId": "i-0a1234567890abcd8",
        "MetricName": "MemoryUsage",
        "MetricValueAverage": 54.2,
        "DateHourTimeZone": 1622530800
    },
    {
        "InstanceId": "i-0a1234567890abcd9",
        "MetricName": "DiskReadOps",
        "MetricValueAverage": 32.4,
        "DateHourTimeZone": 1622534400
    },
    {
        "InstanceId": "i-0a1234567890abcd0",
        "MetricName": "NetworkIn",
        "MetricValueAverage": 200.9,
        "DateHourTimeZone": 1622538000
    }
]
