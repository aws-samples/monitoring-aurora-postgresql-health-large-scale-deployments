import { Button, ContentLayout, DateRangePickerProps } from "@cloudscape-design/components";
import { useState } from "react";
import Dashboard from "../components/dashboard/Dashboard";
import RelativeDateRangePicker from "../components/dateRange/DateRange";
import { helpPanelType } from "../components/layout/Layout";
import MetricsTable from "../components/metricsTable/MetricsTable";
import { DEFAULT_DATE_FILTER } from "../constant";

export interface ICloudWatcherProps {
    setHelpPanel: (value: helpPanelType) => void,
}

const CloudWatcher = ({ setHelpPanel }: ICloudWatcherProps) => {

    const [selectedMetricName, setSelectedMetricName] = useState<string | undefined>(undefined);
    const [dateRangeFilter, setDateRangeFilter] = useState<DateRangePickerProps.Value>(DEFAULT_DATE_FILTER);

    return (
        <ContentLayout>
            {selectedMetricName && <Button iconName="arrow-left" variant="icon" onClick={() => setSelectedMetricName(undefined)} />}
            <br />
            <h3>Date Range filter</h3>
            <RelativeDateRangePicker value={dateRangeFilter} setValue={setDateRangeFilter} />
            <br />
            {!selectedMetricName && <Dashboard setHelpPanel={setHelpPanel} dateRange={dateRangeFilter} setSelectedMetricName={setSelectedMetricName} />}

            {selectedMetricName && <MetricsTable setHelpPanel={setHelpPanel} dateRange={dateRangeFilter} metricName={selectedMetricName} />}
            <p>
                <li>Some instructions</li>
            </p>
        </ContentLayout>
    )
}

export default CloudWatcher;