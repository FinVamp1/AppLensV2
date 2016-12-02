///<reference path="../references.ts" />

module SupportCenter {
    "use strict";
    
    export class DetectorDefinition {
        constructor(
            public Name: string,
            public DisplayName: string,
            public Description: string,
            public Rank: number,
            public IsEnabled: boolean,
            public Correlated: number
        ) {
        }
    }
    
    export class DetectorViewParams {
        loading: boolean;
        chartoptions: any;
        chartdata: any;
        info: DetectorDefinition;
        responsemetadata: ResponseMetaData;
        wiki: string;
        solution: string;
    }
}