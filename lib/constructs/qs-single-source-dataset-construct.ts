import { Construct } from 'constructs';
import { CfnDataSet, CfnRefreshSchedule } from 'aws-cdk-lib/aws-quicksight';
import { IResolvable, Stack } from 'aws-cdk-lib';
import * as util from './qs-util';

export interface QuickSightSingleSourceConstructProps {
    datasetName?: string;
    columns: CfnDataSet.InputColumnProperty[];
    transformations: CfnDataSet.TransformOperationProperty[];
    permissions?: CfnDataSet.ResourcePermissionProperty[];
    refreshTime?: string;
    excludeColumnNames?: string[]; 
}

const QS_INTERVAL = 'DAILY';
const QS_TIMEZONE = 'Europe/Brussels';
const QS_REFRESH_TYPE = 'FULL_REFRESH';
const QS_IMPORT_MODE = 'SPICE';

export abstract class QuickSightSingleSourceDatasetConstruct extends Construct {

    abstract getDataSetId() : string;
    abstract getPhysicalTableDef() : CfnDataSet.PhysicalTableProperty;
    
    constructor(scope: Construct, id: string) {
        super(scope, id);
    }

    failIfResolvable(v: object) {
        if (v.hasOwnProperty('resolve')) {
            throw new Error('No support for Resolvables');
        }
    }

    protected buildDataset(id: string, props: QuickSightSingleSourceConstructProps) {
        const dataSetId = this.getDataSetId();
        const datasetName = props.datasetName ?? util.makeNameFromId(dataSetId);
        const permissions = props.permissions ?? [
            {
                principal : util.getQuicksightGroupArn(Stack.of(this).region, Stack.of(this).account),
                actions: util.QS_RW_DATASET_ACCESS
            }
        ];
        const targetColumnNames = new Set(props.columns.map(c => c.name));

        const checkColumnNameExists = (operation: CfnDataSet.CastColumnTypeOperationProperty | CfnDataSet.RenameColumnOperationProperty | CfnDataSet.TagColumnOperationProperty) => {
            const columnName = operation.columnName;
            if (!targetColumnNames.has(columnName)) {
                throw new Error(`Invalid transformation on non-existent column ${columnName}`);
            }
        };

        const treatRenameOperation = (renameOperation: CfnDataSet.RenameColumnOperationProperty) => {
            const newColumnName = renameOperation.newColumnName;
            if (targetColumnNames.has(newColumnName)) {
                throw new Error(`Invalid rename transformation. Column ${newColumnName} already exists`);
            }
            targetColumnNames.add(newColumnName);
            targetColumnNames.delete(renameOperation.columnName);
        };

        const treatCreateOperation = (createOperation: any) => {
            const columns = createOperation.columns;
            this.failIfResolvable(columns);
            columns.forEach( (column: any) => {
                this.failIfResolvable(column);
                const newColumnName = column.columnName;
                if (targetColumnNames.has(newColumnName)) {
                    throw new Error(`Invalid create Column transformation. Column ${newColumnName} already exists`);
                }
                targetColumnNames.add(newColumnName);
            });
        };
        
        props.transformations.forEach( (transformation: CfnDataSet.TransformOperationProperty) => {
            const operations = [transformation?.castColumnTypeOperation, transformation?.renameColumnOperation, transformation?.tagColumnOperation ];
            for (const anyOperation of operations) {
                if (anyOperation === undefined) {
                    continue;
                }
                    
                this.failIfResolvable(anyOperation);
                const operation = anyOperation as CfnDataSet.CastColumnTypeOperationProperty | CfnDataSet.RenameColumnOperationProperty 
                    | CfnDataSet.TagColumnOperationProperty;
                checkColumnNameExists(operation);
            }
        
            if (transformation?.renameColumnOperation) {
                const renameOperation = transformation?.renameColumnOperation as CfnDataSet.RenameColumnOperationProperty;
                treatRenameOperation(renameOperation);

            } else if (transformation?.createColumnsOperation) {
                this.failIfResolvable(transformation?.createColumnsOperation);
                const createOperation = transformation?.createColumnsOperation as any;
                treatCreateOperation(createOperation);
            }
        });
        
        const dataTransforms = props.excludeColumnNames ? [...props.transformations, util.Transformations.projectionTransformation([...targetColumnNames], props.excludeColumnNames)] :
            props.transformations;

        const ds = new CfnDataSet(this, `${id}-data-set`, {
            name: datasetName,
            awsAccountId: Stack.of(this).account,
            dataSetId: dataSetId,
            importMode: QS_IMPORT_MODE,
            physicalTableMap: {
                anyKey: this.getPhysicalTableDef(),
            },
            logicalTableMap: {
                anything : {
                    alias: dataSetId,
                    source: {
                        physicalTableId: "anyKey",
                    },
                    dataTransforms,
                },
            },
            permissions,
        });

        if (props.refreshTime) {
            const schedule = new CfnRefreshSchedule(this, `${id}-data-set-refresh-schedule`, {
                awsAccountId: Stack.of(this).account,
                dataSetId,
                schedule: {
                    refreshType: QS_REFRESH_TYPE,
                    scheduleFrequency: {
                        interval: QS_INTERVAL,
                        timeOfTheDay: props.refreshTime,
                        timeZone: QS_TIMEZONE,
                },
                scheduleId: `${id}-qs-schedule`,
                },
            });
            schedule.addDependency(ds);
        }
    }
}

