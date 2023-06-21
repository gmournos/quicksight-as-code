import { Construct } from 'constructs';
import {CfnDataSource } from 'aws-cdk-lib/aws-quicksight';
import { Stack } from 'aws-cdk-lib';

import { QuickSightS3CSVDataset } from './constructs/qs-s3-csv-dataset-construct';
import * as util from './constructs/qs-util';
    
export class QuickSightSamplesDatasetConstruct extends Construct {

    private makeDataSource(id: string) {
        return new CfnDataSource(this, `${id}-qs-data-source`, {
            name: `${id}-qs-data-source`,
            awsAccountId: Stack.of(this).account,
            type: "S3",
            dataSourceId: `${id}-qs-data-source`,
            dataSourceParameters: {
                s3Parameters: {
                    manifestFileLocation: {
                        bucket: `spaceneedle-samplefiles.prod.${Stack.of(this).region}`,
                        key: `${id}/manifest.json`,
                    }
                },
            },
            permissions : [
                {
                    principal : util.getQuicksightGroupArn(Stack.of(this).region, Stack.of(this).account),
                    actions: util.QS_RO_DATASOURCE_ACCESS
                }
            ]
        });
    }

    constructor(scope: Construct, id: string) {
        super(scope, id);
        
        const salesDataSource = this.makeDataSource('sales');
        const webDataSource = this.makeDataSource('marketing');
        const peopleDataSource = this.makeDataSource('hr');
        const businessDataSource = this.makeDataSource('revenue');
        
        new QuickSightS3CSVDataset(this, 'sales-ds', {
            dataSetId: 'sales-ds',
            dataSource: salesDataSource,
            columns: util.makeCsvColumns(12),
            transformations: [
                util.Transformations.renameColumn('ColumnId-1', 'Date'),
                util.Transformations.renameColumn('ColumnId-2', 'Salesperson'),
                util.Transformations.renameColumn('ColumnId-3', 'Lead Name'),
                util.Transformations.renameColumn('ColumnId-4', 'Segment'),
                util.Transformations.renameColumn('ColumnId-5', 'Region'),
                util.Transformations.renameColumn('ColumnId-6', 'Target Close'),
                util.Transformations.renameColumn('ColumnId-7', 'Forecasted Monthly Revenue'),
                util.Transformations.renameColumn('ColumnId-8', 'Opportunity Stage'),
                util.Transformations.renameColumn('ColumnId-9', 'Weighted Revenue'),
                util.Transformations.renameColumn('ColumnId-10', 'Is Closed'),
                util.Transformations.renameColumn('ColumnId-11', 'ActiveItem'),
                util.Transformations.renameColumn('ColumnId-12', 'IsLatest'),

                util.Transformations.intCastOnColumn('Forecasted Monthly Revenue'),
                util.Transformations.intCastOnColumn('Weighted Revenue'),
                util.Transformations.dateCastOnColumn('Target Close', 'M/d/yyyy'),
                util.Transformations.dateCastOnColumn('Date', 'M/d/yyyy'),
                util.Transformations.stateTagOnColumn('Region'),
            ],
        });

        new QuickSightS3CSVDataset(this, 'people-ds', {
            dataSetId: 'people-ds',
            dataSource: peopleDataSource,
            columns: util.makeCsvColumns(15),
            transformations: [
                util.Transformations.renameColumn('ColumnId-1', 'Date'),
                util.Transformations.renameColumn('ColumnId-2', 'Employee Name'),
                util.Transformations.renameColumn('ColumnId-3', 'Employee ID'),
                util.Transformations.renameColumn('ColumnId-4', 'Tenure'),
                util.Transformations.renameColumn('ColumnId-5', 'Monthly Compensation'),
                util.Transformations.renameColumn('ColumnId-6', 'Date of Birth'),
                util.Transformations.renameColumn('ColumnId-7', 'Gender'),
                util.Transformations.renameColumn('ColumnId-8', 'Education'),
                util.Transformations.renameColumn('ColumnId-9', 'Event Type'),
                util.Transformations.renameColumn('ColumnId-10', 'Region'),
                util.Transformations.renameColumn('ColumnId-11', 'Business Function'),
                util.Transformations.renameColumn('ColumnId-12', 'Job Family'),
                util.Transformations.renameColumn('ColumnId-13', 'Job Level'),
                util.Transformations.renameColumn('ColumnId-14', 'Notes'),
                util.Transformations.renameColumn('ColumnId-15', 'isUnique'),
                
                util.Transformations.decimalCastOnColumn('Monthly Compensation'),
                util.Transformations.intCastOnColumn('Tenure'),
                util.Transformations.dateCastOnColumn('Date of Birth', 'yyyy-MM-dd'),
                util.Transformations.dateCastOnColumn('Date', 'yyyy-MM-dd'),
                util.Transformations.stateTagOnColumn('Region'),
            ],
        });

        new QuickSightS3CSVDataset(this, 'web-ds', {
            dataSetId: 'web-ds',
            dataSource: webDataSource,
            columns: util.makeCsvColumns(19),
            transformations: [
                util.Transformations.renameColumn('ColumnId-1', 'Date'),
                util.Transformations.renameColumn('ColumnId-2', 'New visitors SEO'),
                util.Transformations.renameColumn('ColumnId-3', 'New visitors CPC'),
                util.Transformations.renameColumn('ColumnId-4', 'New visitors Social Media'),
                util.Transformations.renameColumn('ColumnId-5', 'Return visitors'),
                util.Transformations.renameColumn('ColumnId-6', 'Twitter mentions'),
                util.Transformations.renameColumn('ColumnId-7', 'Twitter followers adds'),
                util.Transformations.renameColumn('ColumnId-8', 'Twitter followers cumulative'),
                util.Transformations.renameColumn('ColumnId-9', 'Mailing list adds'),
                util.Transformations.renameColumn('ColumnId-10', 'Mailing list cumulative'),
                util.Transformations.renameColumn('ColumnId-11', 'Website Pageviews'),
                util.Transformations.renameColumn('ColumnId-12', 'Website Visits'),
                util.Transformations.renameColumn('ColumnId-13', 'Website Unique Visits'),
                util.Transformations.renameColumn('ColumnId-14', 'Mobile uniques'),
                util.Transformations.renameColumn('ColumnId-15', 'Tablet uniques'),
                util.Transformations.renameColumn('ColumnId-16', 'Desktop uniques'),
                util.Transformations.renameColumn('ColumnId-17', 'Free sign up'),
                util.Transformations.renameColumn('ColumnId-18', 'Paid conversion'),
                util.Transformations.renameColumn('ColumnId-19', 'Events'),
                
                util.Transformations.intCastOnColumn('Free sign up'),
                util.Transformations.intCastOnColumn('Paid conversion'),
                util.Transformations.intCastOnColumn('Tablet uniques'),
                util.Transformations.intCastOnColumn('Desktop uniques'),
                util.Transformations.intCastOnColumn('Mailing list adds'),
                util.Transformations.intCastOnColumn('Twitter followers cumulative'),
                util.Transformations.intCastOnColumn('Mailing list cumulative'),
                util.Transformations.intCastOnColumn('Return visitors'),
                util.Transformations.intCastOnColumn('Website Unique Visits'),
                util.Transformations.intCastOnColumn('New visitors Social Media'),
                util.Transformations.intCastOnColumn('Mobile uniques'),
                util.Transformations.intCastOnColumn('Twitter followers adds'),
                util.Transformations.intCastOnColumn('Website Pageviews'),
                util.Transformations.intCastOnColumn('Twitter mentions'),
                util.Transformations.intCastOnColumn('Website Visits'),
                util.Transformations.intCastOnColumn('New visitors CPC'),
                util.Transformations.intCastOnColumn('New visitors SEO'),

                util.Transformations.dateCastOnColumn('Date', 'M/d/yyyy'),
            ],
        });

        new QuickSightS3CSVDataset(this, 'business-ds', {
            dataSetId: 'business-ds',
            dataSource: businessDataSource,
            columns: util.makeCsvColumns(11),
            transformations: [
                util.Transformations.renameColumn('ColumnId-1', 'Date'),
                util.Transformations.renameColumn('ColumnId-2', 'Customer ID'),
                util.Transformations.renameColumn('ColumnId-3', 'Customer Name'),
                util.Transformations.renameColumn('ColumnId-4', 'Customer Region'),
                util.Transformations.renameColumn('ColumnId-5', 'Segment'),
                util.Transformations.renameColumn('ColumnId-6', 'Service Line'),
                util.Transformations.renameColumn('ColumnId-7', 'Revenue Goal'),
                util.Transformations.renameColumn('ColumnId-8', 'Billed Amount'),
                util.Transformations.renameColumn('ColumnId-9', 'Cost'),
                util.Transformations.renameColumn('ColumnId-10', 'Channel'),
                util.Transformations.renameColumn('ColumnId-11', 'Distinct ID'),
                
                util.Transformations.decimalCastOnColumn('Cost'),
                util.Transformations.decimalCastOnColumn('Billed Amount'),
                util.Transformations.decimalCastOnColumn('Revenue Goal'),

                util.Transformations.intCastOnColumn('Distinct ID'),
                util.Transformations.dateCastOnColumn('Date', 'M/d/yyyy'),
                util.Transformations.stateTagOnColumn('Customer Region'),
            ],
        });
    }
}