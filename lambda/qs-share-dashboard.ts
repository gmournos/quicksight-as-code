import { QuickSightClient, UpdateDashboardPermissionsCommand } from '@aws-sdk/client-quicksight';
import { CdkCustomResourceEvent, CdkCustomResourceResponse } from 'aws-lambda';

// export const shareDashboard: Handler = async (event) => {
export const shareDashboard = async (event: CdkCustomResourceEvent): Promise<CdkCustomResourceResponse> => {
    console.log('Received event:', JSON.stringify(event));

    const { DashboardId, AwsAccountId, Region } = event.ResourceProperties;
    
    try {
        const client = new QuickSightClient({});
            
        console.log('Sharing dashboard:', DashboardId);
        const command = new UpdateDashboardPermissionsCommand({
            DashboardId,
            AwsAccountId,
            GrantLinkPermissions: [{
                Principal: `arn:aws:quicksight:${Region}:${AwsAccountId}:namespace/default`,
                Actions: [
                    'quicksight:DescribeDashboard',
                    'quicksight:ListDashboardVersions',
                    'quicksight:QueryDashboard',
                ],
            }],
        });
        const response = await client.send(command);
        console.log('Generated response:', JSON.stringify(response));
        return {
            status: 'SUCCESS',
            data: response,
        };
    } catch (e) {
        let reason = 'Internal Server Error';
        if (e instanceof Error) {
            reason = e.message;
        }
        console.log(e);
        return {
            status: 'FAILED',
            reason,
        };
    }
};