import { Construct } from 'constructs';
import { CfnDataSet, CfnDataSource } from 'aws-cdk-lib/aws-quicksight';
import { QuickSightSingleSourceConstructProps, QuickSightSingleSourceDatasetConstruct } from './qs-single-source-dataset-construct';

export interface QuickSightS3CSVDatasetConstructProps extends QuickSightSingleSourceConstructProps {
    dataSource: CfnDataSource;
    dataSetId: string;
}

export class QuickSightS3CSVDataset extends QuickSightSingleSourceDatasetConstruct {
    getDataSetId(): string {
        return this.props.dataSetId;
    }
    getPhysicalTableDef(): CfnDataSet.PhysicalTableProperty {
        const props = this.props;
        return { 
            s3Source: {
                dataSourceArn: props.dataSource.attrArn,
                inputColumns: props.columns,
                uploadSettings: {
                    format: 'CSV',
                    startFromRow: 1,
                    containsHeader: true,
                    textQualifier: 'DOUBLE_QUOTE',
                    delimiter: ',',
                }
            }
        };
    }


    constructor(scope: Construct, id: string, protected props: QuickSightS3CSVDatasetConstructProps) {
        super(scope, id);
        super.buildDataset(id, props);
    }
}
