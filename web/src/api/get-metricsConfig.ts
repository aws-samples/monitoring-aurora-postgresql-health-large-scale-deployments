import { ApiError, get } from 'aws-amplify/api';

export const getMetricsConfig = async (): Promise<unknown> => {
    try {
        const restOperation = get({
            apiName: 'myRestApi',
            path: 'metricslist'
        });
        const { body } = await restOperation.response;
        const response = await body.json() as [];
        return response?.map((metric: { name: string, threshold: number, thresholdOperator: string }) => {
            return {
                metricName: metric.name,
                threshold: metric.threshold,
                thresholdOperator: metric.thresholdOperator,
                "helpText": "Percentage of computer processing capacity used."
            }
        })
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