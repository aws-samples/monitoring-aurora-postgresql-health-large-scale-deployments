import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


export default function BasicCard() {
    return (
        <Card sx={{ minWidth: 275 }} raised={true}>
            <CardContent>
                <Typography sx={{ fontSize: 16 }} color="info.main" gutterBottom>
                    What's this?
                </Typography>
                <Typography variant="body1">
                    The BufferCacheHitRatio CloudWatch metric measures the percentage of data and indexes served from an instance's memory cache (versus the storage volume). Generally speaking, the value of BufferCacheHitRatio should be as high as possible, as reading data from working set memory is faster and more cost-effective than reading from the storage volume.
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" variant="contained" target="_blank" href="https://docs.aws.amazon.com/documentdb/latest/developerguide/best_practices.html#best_practices-instance_sizing">Learn More</Button>
            </CardActions>
        </Card>
    );
}
