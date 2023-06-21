import { CfnTable } from "aws-cdk-lib/aws-glue";
import { CfnDataSet } from "aws-cdk-lib/aws-quicksight";

const QS_GROUP_NAME = `QS-Developers`;

export const getQuicksightGroupArn = (region: string, account: string) => {
    return `arn:aws:quicksight:${region}:${account}:group/default/${QS_GROUP_NAME}`;
}

export const QS_RW_DATASET_ACCESS = [
    "quicksight:DescribeDataSet","quicksight:DescribeDataSetPermissions","quicksight:PassDataSet",
    "quicksight:DescribeIngestion","quicksight:ListIngestions","quicksight:UpdateDataSet",
    "quicksight:DeleteDataSet","quicksight:CreateIngestion","quicksight:CancelIngestion",
    "quicksight:UpdateDataSetPermissions"
];

export const QS_RW_ANALYSIS_ACCESS = [
    "quicksight:RestoreAnalysis", "quicksight:UpdateAnalysisPermissions", "quicksight:DeleteAnalysis",
    "quicksight:DescribeAnalysisPermissions", "quicksight:QueryAnalysis", "quicksight:DescribeAnalysis",
    "quicksight:UpdateAnalysis"
];

export const QS_RW_DASHBOARD_ACCESS = [
    "quicksight:DescribeDashboard", "quicksight:ListDashboardVersions", "quicksight:UpdateDashboardPermissions",
    "quicksight:QueryDashboard", "quicksight:UpdateDashboard", "quicksight:DeleteDashboard",
    "quicksight:DescribeDashboardPermissions", "quicksight:UpdateDashboardPublishedVersion"
];

export const QS_RO_DATASOURCE_ACCESS = [
    "quicksight:DescribeDataSource", "quicksight:DescribeDataSourcePermissions",
    "quicksight:PassDataSource"
];


export class Transformations {
    static dateCastOnColumn(columnName: string, format: string) : CfnDataSet.TransformOperationProperty {
        return this.castOnColumn(columnName, 'DATETIME', format);
    }

    static castOnColumn(columnName: string, newColumnType: string, format?: string) : CfnDataSet.TransformOperationProperty {
        return { 
            castColumnTypeOperation: {
                columnName,
                newColumnType,
                format,
            }
        };
    }

    static decimalCastOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.castOnColumn(columnName, 'DECIMAL');
    }

    static intCastOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.castOnColumn(columnName, 'INTEGER');
    }

    static tagOnColumn(columnName: string, tag: string) : CfnDataSet.TransformOperationProperty {
        return { 
            tagColumnOperation: {
                columnName,
                tags: [
                    {
                        columnGeographicRole: tag
                    }
                ]
            }
        };
    }

    static countryTagOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.tagOnColumn(columnName, "COUNTRY");
    }

    static latitudeTagOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.tagOnColumn(columnName, "LATITUDE");
    }

    static longitudeTagOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.tagOnColumn(columnName, "LONGITUDE");
    }

    static stateTagOnColumn(columnName: string) : CfnDataSet.TransformOperationProperty {
        return this.tagOnColumn(columnName, "STATE");
    }

    static renameColumn(columnName: string, newColumnName: string) : CfnDataSet.TransformOperationProperty {
        return {
            renameColumnOperation: {
                columnName,
                newColumnName
            }
        };
    }

    static projectionTransformation(columnNames: string[], exludeColumnNames: string[] = []) : CfnDataSet.TransformOperationProperty {
        const finalColumnNames = columnNames.filter( n => !exludeColumnNames.includes(n));
        return { 
            projectOperation: {
                projectedColumns: finalColumnNames,
            }
        };
    }
}

export const glueToQuicksightColumns = (glueColumns: CfnTable.ColumnProperty[]) : CfnDataSet.InputColumnProperty[] => {
    return glueColumns.map(
        c => { 
            let resultType;
            if (c.type === 'int') {
                resultType = 'INTEGER';
            } else if (c.type === 'double') {
                resultType = 'DECIMAL';
            } else {
                resultType = c.type ? c.type.toUpperCase() : 'STRING'
            }
            return { 
                name: c.name, 
                type: resultType,
            };
        }
    );
}

export const makeNameFromId = (tableId: string) => { // capitalize first letter and replace underscore with space
    const words = tableId.split("_");
    return words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export const makeCsvColumns = (width: number)  => {
    return [ ...Array(width).keys() ].map( i => { return { name: `ColumnId-${i+1}`, type: "STRING" }; });
}
