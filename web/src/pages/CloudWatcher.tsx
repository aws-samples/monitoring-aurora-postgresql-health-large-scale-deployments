import { Button, ContentLayout, DateRangePicker, Header } from "@cloudscape-design/components";
import { useState } from "react";
import Dashboard from "../components/dashboard/Dashboard";
import MetricsTable from "../components/metricsTable/MetricsTable";

export interface ICloudWatcherProps {
    setSidePanel: (value: string) => void,
}

const CloudWatcher = ({ setSidePanel }: ICloudWatcherProps) => {

    const [showDashboard, setShowDashboard] = useState<boolean>(false);
    return (
        <ContentLayout
            header={
                <Header variant="h1">
                    Aurora Cloud Watch Visualizer
                </Header>
            }
        >
            <h3>Date Range filter</h3>
            <DateRangePicker />
            <br />
            {showDashboard && <Dashboard setSidePanel={setSidePanel} setShowTable={setShowDashboard} />}
            {!showDashboard && <Button iconName="arrow-left" variant="icon" onClick={() => setShowDashboard(true)} />}
            {!showDashboard && <MetricsTable setSidePanel={setSidePanel} setShowTable={setShowDashboard} />}
        </ContentLayout>
    )
}

export default CloudWatcher;