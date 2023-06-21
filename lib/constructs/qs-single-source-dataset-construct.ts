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
        let targetColumnNames = props.columns.map(c => c.name);
        
        props.transformations.forEach( (t: CfnDataSet.TransformOperationProperty) => {
            const operations = [t?.castColumnTypeOperation, t?.renameColumnOperation, t?.tagColumnOperation, t?.tagColumnOperation];
            operations.forEach(o => {
                if (o !== undefined) {
                    this.failIfResolvable(o);
                    const operation = o as CfnDataSet.CastColumnTypeOperationProperty | CfnDataSet.RenameColumnOperationProperty 
                        | CfnDataSet.TagColumnOperationProperty;
                    const columnName = operation.columnName;
                    if (!targetColumnNames.includes(columnName)) {
                        throw new Error(`Invalid transformation on non-existent column ${columnName}`);
                    }
                }
            });
        
            if (t?.renameColumnOperation) {
                const renameOperation = t?.renameColumnOperation as CfnDataSet.RenameColumnOperationProperty;
                const newColumnName = renameOperation.newColumnName;
                if (targetColumnNames.includes(newColumnName)) {
                    throw new Error(`Invalid rename transformation. Column ${newColumnName} already exists`);
                }
                targetColumnNames.push(newColumnName);
                targetColumnNames = targetColumnNames.filter(name => name != renameOperation.columnName);
            } else if (t?.createColumnsOperation) {
                this.failIfResolvable(t?.createColumnsOperation);
                const createOperation = t?.createColumnsOperation as any;
                const columns = createOperation.columns;
                this.failIfResolvable(columns);
                columns.forEach( (c: any) => {
                    this.failIfResolvable(c);
                    const newColumnName = c.columnName;
                    if (targetColumnNames.includes(newColumnName)) {
                        throw new Error(`Invalid create Column transformation. Column ${newColumnName} already exists`);
                    }
                    targetColumnNames.push(newColumnName);
                });
            }
        });
        
        const dataTransforms = props.excludeColumnNames ? [...props.transformations, util.Transformations.projectionTransformation(targetColumnNames, props.excludeColumnNames)] :
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

        const nextMidnight = new Date().setUTCHours(24,0,0,0); // next midnight
        const formatedNoMilliseconds = `${new Date(nextMidnight).toISOString().slice(0,19)}Z`;

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
                startAfterDateTime: formatedNoMilliseconds,
                },
            });
            schedule.addDependency(ds);
        }
    }
}

