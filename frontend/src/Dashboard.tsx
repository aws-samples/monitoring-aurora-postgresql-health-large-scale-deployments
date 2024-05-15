import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import ReportingPeriodSelector from './ReportingPeriodSelector';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

export default function Dashboard() {
    const [items, setItems] = useState([]);
    const [startTime, setStartTime] = useState(Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) * 1000);
    const [endTime, setEndTime] = useState(Date.now);

    useEffect(() => {
        let ignore = false;
        let instances = [];
        let metricsData: any[] = [];
        fetch('https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances')
            .then(response => response.json())
            .then(async data => {
                if (!ignore) {
                    instances = data;
                    for (let i = 0; i < instances.length; i++) {
                        metricsData.push(await fetch(`https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?startTimeEpoch=${startTime}&endTimeEpoch=${endTime}&instanceId=${instances[i]}`)
                            .then(response => response.json()))
                    }
                    console.log(metricsData);
                }
            });
    }, []);

    return (
        <Box>
            <Grid item xs={12}>
                <ReportingPeriodSelector onStartTimeChange={(startTime: number) => setStartTime(startTime)} onEndTimeChange={(endTime: number) => setEndTime(endTime)} />
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={4}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="text.secondary">
                        Buffer Cache Hit Ratio
                    </Typography>
                    <PieChart
                        series={[
                            {
                                data: [
                                    { id: 0, value: 10, color: 'purple', label: 'Instances Reported Issues' },
                                    { id: 1, value: 15, color: '#90EE90', label: 'Instances Successful' },
                                ],
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                            },
                        ]}
                        width={800}
                        height={200}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="text.secondary">
                            CPU Utilization
                        </Typography>
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 5, color: 'purple', label: 'Instances Reported Issues' },
                                        { id: 1, value: 20, color: '#90EE90', label: 'Instances Successful' },
                                    ],
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                            width={800}
                            height={200}
                        />
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color="text.secondary">
                        Volume Read IOPS
                        </Typography>
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, color: 'purple', label: 'Instances Reported Issues' },
                                        { id: 1, value: 20, color: '#90EE90', label: 'Instances Successful' },
                                    ],
                                    highlightScope: { faded: 'global', highlighted: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                            width={800}
                            height={200}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>

    );
}