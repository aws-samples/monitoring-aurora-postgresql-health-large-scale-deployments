//Create a react component, that will have one dropdown which will show values received from an Api Call using axios to this URL https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all-instances. This url returns a string array which needs to be bound to the dropdown.
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

export default function InstanceSelector(props: { onDataFetch: (data: { id: string, InstanceId: string; MetricValueAverage: number; DateHourTimeZone: string; }[]) => void }): JSX.Element {
    const [items, setItems] = useState([]);
    const [startTime, setStartTime] = useState(Date.now);
    const [endTime, setEndTime] = useState(Date.now);
    const [instanceId, setInstanceId] = useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setInstanceId(event.target.value);
    };

    const handleStartDateChagnge = (event: any) => {
        const startTimeMs = event.$d.getTime();
        const startTimeEpoch = Math.floor(startTimeMs / 1000);
        console.log(startTimeEpoch);
        setStartTime(startTimeEpoch);
    }
    const handleEndDateChagnge = (event: any) => {
        const endTimeMs = event.$d.getTime();
        const endTimeEpoch = Math.floor(endTimeMs / 1000);
        console.log(endTimeEpoch);
        setEndTime(endTimeEpoch);
    }

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

    const getReportData = () => {
        fetch(`https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=${instanceId}&startTimeEpoch=${startTime}&endTimeEpoch=${endTime}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                props.onDataFetch(data);
            });
    }

    return (
        <Box sx={{ minWidth: 120, boxShadow: 0 }}>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    < FormControl fullWidth> <InputLabel id="demo-simple-select-label">Instance</InputLabel>  <Select
                        labelId="instances-label"
                        id="instances"
                        label="Instances"
                        onChange={handleChange}
                    >
                        {items.map((item: any) => <MenuItem value={item}>{item}</MenuItem>)}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <DateTimePicker label="Start Date/Time" onAccept={handleStartDateChagnge} />
                </Grid>
                <Grid item>
                    <DateTimePicker label="End Date/Time" onAccept={handleEndDateChagnge} />
                </Grid>
                <Grid item>
                    <Box textAlign='center'>
                        <Button variant='contained' onClick={() => {
                            console.log('clicked')
                            getReportData();
                        }}>
                            Report
                        </Button>
                    </Box>
                </Grid>
            </Grid>




        </Box >
    )
}
