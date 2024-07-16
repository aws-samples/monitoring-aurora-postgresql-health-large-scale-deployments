import { RDS } from '@aws-sdk/client-rds';

export async function listAuroraPostgreSQLInstanceIds(): Promise<string[]> {
    // Set up the RDS client
    const rdsClient = new RDS();
    try {
        // Get the list of RDS clusters
        const clusters = await rdsClient.describeDBClusters({});
        const instanceIds: string[] = [];
        clusters.DBClusters?.forEach(cluster => {
            if (cluster.Engine === 'aurora-postgresql') {
                cluster.DBClusterMembers?.forEach(member => {
                    if (member.IsClusterWriter) {
                        instanceIds.push(member.DBInstanceIdentifier || '');
                    }
                });
            }
        }
        );
        return instanceIds;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}
