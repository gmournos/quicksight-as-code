import { Construct } from 'constructs';
import { CfnDataSet, CfnDataSource } from 'aws-cdk-lib/aws-quicksight';
import { QuickSightSingleSourceConstructProps, QuickSightSingleSourceDatasetConstruct } from './qs-single-source-dataset-construct';

export interface QuickSightAthenaTableDatasetConstructProps extends QuickSightSingleSourceConstructProps {
    athenaDbName: string;
    athenaTableName: string;
    dataSource: CfnDataSource;
    dataSetId?: string;
}

export class QuickSightAthenaTableDataset extends QuickSightSingleSourceDatasetConstruct {
    getDataSetId(): string {
        return this.props.dataSetId ?? this.props.athenaTableName;
    }
    getPhysicalTableDef(): CfnDataSet.PhysicalTableProperty {
        const props = this.props;
        return {
            relationalTable: {
                dataSourceArn: props.dataSource.attrArn,
                inputColumns: props.columns,
                name: props.athenaTableName,
                schema: props.athenaDbName,
            }
        };
    }

    constructor(scope: Construct, id: string, protected props: QuickSightAthenaTableDatasetConstructProps) {
        super(scope, id);
        super.buildDataset(id, props);
    }
}
