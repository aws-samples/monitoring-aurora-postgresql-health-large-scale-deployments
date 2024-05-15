import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

interface ReportingPeriodSelectorProps {
    onStartTimeChange: (startTime: number) => void;
    onEndTimeChange: (endTime: number) => void;
}

export default function ReportingPeriodSelector(props: ReportingPeriodSelectorProps) {
    const [showDateRange, setShowDateRange] = useState(false);
    const [startTime, setStartTime] = useState(Date.now);
    const [endTime, setEndTime] = useState(Date.now);

    const handleStartDateChange = (event: any) => {
        const startTimeMs = event.$d.getTime();
        const startTimeEpoch = Math.floor(startTimeMs / 1000);
        setStartTime(startTimeEpoch);
        props.onStartTimeChange(startTimeEpoch);
    }

    const handleEndDateChange = (event: any) => {
        const endTimeMs = event.$d.getTime();
        const endTimeEpoch = Math.floor(endTimeMs / 1000);
        setEndTime(endTimeEpoch);
        props.onEndTimeChange(endTimeEpoch);
    }

    const handleSelectChange = (event: SelectChangeEvent) => {

        switch (event.target.value) {
            case "seven":
                props.onStartTimeChange(Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) * 1000);
                props.onEndTimeChange(Date.now());
                setShowDateRange(false);
                break;
            case "month":
                props.onStartTimeChange(Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) * 1000);
                props.onEndTimeChange(Date.now());
                setShowDateRange(false);
                break;
            case "90":
                props.onStartTimeChange(Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60) * 1000);
                props.onEndTimeChange(Date.now());
                setShowDateRange(false);
                break;
            case "custom":
                setShowDateRange(true);
                break;
            default:
                break;
        }
    }


    return (
        <Box>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Reporting Period</InputLabel>
                <Select label="Date Range"
                    onChange={handleSelectChange}>
                    <MenuItem value={"sevent"}>Last 7 Days</MenuItem>
                    <MenuItem value={"month"}>Last Month</MenuItem>
                    <MenuItem value={"90"}>Last 90 Days</MenuItem>
                    <MenuItem value={"custom"}>Custom Range</MenuItem>
                </Select>
            </FormControl>
            {showDateRange &&
                <Box>
                    <DateTimePicker label="Start Date"
                        value={new Date(startTime * 1000)}
                        onChange={handleStartDateChange} />
                    <DateTimePicker label="End Date"
                        value={new Date(endTime * 1000)}
                        onChange={handleEndDateChange} />
                </Box>
            }
        </Box>

    );
};