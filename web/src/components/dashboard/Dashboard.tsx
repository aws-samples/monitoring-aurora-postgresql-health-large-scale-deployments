import { Container, Header } from "@cloudscape-design/components";
import DashboardPieChart from "../charts/PieChart";

export type metric = {
    name: string,
    threshold: number,
    thresholdOperator: string
}
const metricsTracked: metric[] = [
    {
        "name": "VolumeReadIOPS",
        "threshold": 90,
        "thresholdOperator": "<="
    },
    {
        "name": "BufferCacheHitRatio",
        "threshold": 100,
        "thresholdOperator": ">="
    }
];

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', gap: '1em' }}>
            {metricsTracked.map(metric =>
                <Container
                    header={
                        <Header
                            variant="h2"
                            description="Container description"
                        >
                            {metric.name}
                        </Header>
                    }
                >
                    <DashboardPieChart metric={metric} />
                </Container>)}
        </div>

    )
}
export default Dashboard;