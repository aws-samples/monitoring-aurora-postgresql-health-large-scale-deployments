import { DateRangePickerProps } from '@cloudscape-design/components';
import { ApiError } from 'aws-amplify/api';
import { metricSummary } from './mock/mockData';
import { getCurrentEpochTime, getRangeStartAsEpoc } from './utils/utils';


export const getMetricSummary = async (range: DateRangePickerProps.RelativeValue): Promise<unknown> => {
    try {
        const path = `summary?startDate=${getRangeStartAsEpoc(range.amount, range.unit)}&endDate=${getCurrentEpochTime()}`
        // const restOperation = get({
        //     apiName: 'myRestApi',
        //     path: path
        // });
        // const { body } = await restOperation.response;
        // return await body.json();


        console.log('Fetching getMetricSummary using path = ', path);

        return metricSummary;
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`Received ${statusCode} error response with payload: ${body}`);
            }
        } else {
            console.log('GET call failed: ');
        }
        return undefined
    }
}