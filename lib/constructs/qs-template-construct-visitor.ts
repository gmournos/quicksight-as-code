import { Construct } from 'constructs';
export interface QuickSightTemplateConstructProps {
    templateDefinitionSource: string;
    stackVersion: string;
    dataSets: {
        [placeholder: string]: string;
    };
}
export declare class QuickSightTemplateConstruct extends Construct {
    private id;
    constructor(scope: Construct, id: string, props: QuickSightTemplateConstructProps);
    traverseTree(o: any, history: string, visitor: (o: object, key: string, history: string) => void): any;
    visitor(o: any, key: string, history: string): void;
}
