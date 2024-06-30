import { Container, DateRangePickerProps, Header, Link } from '@cloudscape-design/components';
import { useEffect, useState } from "react";
import { useMetricsConfig } from "../../hooks/use-metrics-config";
import { MetricConfig } from '../../model/model';
import { ICloudWatcherProps } from "../../pages/CloudWatcher";
import DashboardPieChart from "../charts/PieChart";
export interface IPageProps extends ICloudWatcherProps {
    dateRange: DateRangePickerProps.Value,
    setSelectedMetricName: (value: string) => void
}

const Dashboard = ({ setSidePanel, dateRange, setSelectedMetricName }: IPageProps) => {
    const [metricsConfig, setMetricsConfig] = useState<MetricConfig[]>();
    const { data: metricsInfo } = useMetricsConfig();
    useEffect(() => {
        setMetricsConfig(metricsInfo as MetricConfig[])
    }, [metricsInfo]);

    return (
        <div style={{ display: 'flex', gap: '1em' }}>
            {metricsConfig && metricsConfig.map((metric, index) =>
                <Container
                    key={index}
                    header={
                        <Header
                            variant="h2"
                            info={<Link variant="info" onClick={() => setSidePanel(metric.helpText)}>Info</Link>}
                        >
                            {metric.metricName}
                        </Header>
                    }
                >
                    <DashboardPieChart dateRange={dateRange} metricName={metric.metricName} setSelectedMetricName={setSelectedMetricName} />
                </Container>
            )}
        </div>
    )
}
export default Dashboard;