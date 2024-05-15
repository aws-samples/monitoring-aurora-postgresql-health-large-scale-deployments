//Create a react component, that will have one dropdown which will show values received from an Api Call using axios to this URL https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances. This url returns a string array which needs to be bound to the dropdown.
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { CacheRecord } from './CacheRecord';
import ReportingPeriodSelector from './ReportingPeriodSelector';

export default function InstanceSelector(props: { onMetricsFetch: (metrics: any[]) => void, onDataFetch: (startTime: number, endTime: number, metricsName: string, data: CacheRecord[]) => void }): JSX.Element {
    const [items, setItems] = useState([]);
    const [instanceId, setInstanceId] = useState('');
    const [metrics, setMetrics] = useState([{}]);
    const [selectedMetric, setSelectedMetric] = useState('');
    const [startTime, setStartTime] = useState(Date.now);
    const [endTime, setEndTime] = useState(Date.now);

    const handleChange = (event: SelectChangeEvent) => {
        setInstanceId(event.target.value);
    };

    useEffect(() => {
        let ignore = false;
        fetch('https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/metricslist')
            .then(response => response.json())
            .then(data => {
                if (!ignore) {
                    setMetrics(data);
                    props.onMetricsFetch(data);
                }
            });
    }, [])

    useEffect(() => {
        let ignore = false;
        fetch('https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances')
            .then(response => response.json())
            .then(data => {
                if (!ignore) {
                    setItems(data);
                }
            });
    }, [])


    const handleMetricsChange = (event: SelectChangeEvent) => {
        setSelectedMetric(event.target.value);
    }

    const getReportData = () => {
        let query = `https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=${instanceId}&startTimeEpoch=${startTime}&endTimeEpoch=${endTime}`;
        if (selectedMetric !== 'all')
            query += `&metricName=${selectedMetric}`;
        fetch(query)
            .then(response => response.json())
            .then(data => {
                props.onDataFetch(startTime, endTime, selectedMetric, data);
            });
    }

    return (
        <Box>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <FormControl fullWidth> <InputLabel id="demo-simple-select-label">Select Instance</InputLabel>  <Select
                            labelId="instances-label"
                            id="instances"
                            label="Instances"
                            onChange={handleChange}
                        >
                            {items.map((item: any) => <MenuItem value={item}>{item}</MenuItem>)}
                        </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth> <InputLabel id="demo-simple-select-label">Metrics</InputLabel>   <Select label="Metrics"
                            onChange={handleMetricsChange}>
                            <MenuItem value={"all"}>All</MenuItem>
                            {metrics.map((item: any) => <MenuItem value={item.name}>{item.name}</MenuItem>)}
                        </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <ReportingPeriodSelector onStartTimeChange={(startTime: number) => setStartTime(startTime)} onEndTimeChange={(endTime: number) => setEndTime(endTime)} />
                    </Grid>
                </Grid>
            </Box >
            <Box className="ReportingButton">
                <Button variant='contained' onClick={() => { getReportData(); }}>
                    Report
                </Button>
            </Box>
        </Box>

    )
}
