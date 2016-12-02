///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export interface IDetectorsService {
        getDetectors(site: Site): ng.IPromise<DetectorDefinition[]>;
        getDetectorResponse(site: Site, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse>;
        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<SiaResponse>;
        getDetectorWiki(detectorName: string): ng.IPromise<string>;
        getDetectorSolution(detectorName: string): ng.IPromise<string>;
    }

    export interface ICache<T> {
        [K: string]: T;
    }

    export class DetectorsService implements IDetectorsService {

        private detectorsResponseCache: ICache<DetectorResponse>;
        private siaResponseCache: ICache<SiaResponse>;
        private detectorsWikiCache: ICache<string>;
        private detectorsSolutionCache: ICache<string>;
        private detectorsListCache: ICache<DetectorDefinition[]>;

        static $inject = ['$q', '$http'];

        constructor(private $q: ng.IQService, private $http: ng.IHttpService) {
            this.detectorsResponseCache = {};
            this.siaResponseCache = {};
            this.detectorsWikiCache = {};
            this.detectorsSolutionCache = {};
            this.detectorsListCache = {};
        }

        getDetectors(site: Site): ng.IPromise<DetectorDefinition[]> {

            var detectors: DetectorDefinition[] = [];
            var deferred = this.$q.defer<DetectorDefinition[]>();

            if (angular.isDefined(this.detectorsListCache["detectorList"])) {
                deferred.resolve(this.detectorsListCache["detectorList"]);
                return deferred.promise;
            }

            var self = this;

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.ListDetectorsPath(site)
                }
            })
                .success((data: any) => {

                    if (angular.isDefined(data.Value)) {

                        _.each(data.Value, function (item: any) {

                            if (angular.isDefined(item.Properties)) {

                                var detector = new DetectorDefinition(
                                    item.Properties.Name,
                                    item.Properties.DisplayName,
                                    item.Properties.Description,
                                    item.Properties.Rank,
                                    item.Properties.IsEnabled,
                                -1);

                                detectors.push(detector);
                            }
                        });

                        self.detectorsListCache["detectorList"] = detectors;
                        deferred.resolve(detectors);
                    }
                    else {
                        deferred.reject("Value not present in detectors api response");
                    }

                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        getDetectorResponse(site: Site, detectorName: string, startTime: string, endTime: string, timeGrain: string): ng.IPromise<DetectorResponse> {

            var deferred = this.$q.defer<DetectorResponse>();

            if (angular.isDefined(this.detectorsResponseCache[detectorName])) {
                deferred.resolve(this.detectorsResponseCache[detectorName]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.DetectorResourcePath(site, detectorName, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    var response = new DetectorResponse(startTime, endTime, [], [], null);

                    if (angular.isDefined(data.Properties)) {
                        response = data.Properties;
                        deferred.resolve(response);
                        this.detectorsResponseCache[detectorName] = response;
                    }
                    else {
                        deferred.reject("Properties not present in api response");
                    }

                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        getAppAnalysisResponse(site: Site, startTime: string, endTime: string, timeGrain: string): ng.IPromise<SiaResponse> {

            var deferred = this.$q.defer<SiaResponse>();

            if (angular.isDefined(this.siaResponseCache["sia"])) {
                deferred.resolve(this.siaResponseCache["sia"]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DiagnosticsPassThroughAPIPath(),
                headers: {
                    'GeoRegionApiRoute': UriPaths.AppAnalysisPath(site, startTime, endTime, timeGrain)
                }
            })
                .success((data: any) => {

                    var response = new SiaResponse('', '', [], [], []);
                    if (angular.isDefined(data.Properties)) {
                        response = data.Properties;
                        this.siaResponseCache["sia"] = response;
                        deferred.resolve(response);
                    }
                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }

        getDetectorWiki(detectorName: string): ng.IPromise<string> {
            return this.getDetectorDocument(detectorName, "wiki.md");
        }

        getDetectorSolution(detectorName: string): ng.IPromise<string> {
            return this.getDetectorDocument(detectorName, "solution.md");
        }

        private getDetectorDocument(detectorName: string, documentName: string): ng.IPromise<string> {

            var cacheObject = undefined;
            var deferred = this.$q.defer<string>();

            switch (documentName.toLocaleLowerCase()) {
                case "solution.md":
                    cacheObject = this.detectorsSolutionCache;
                    break;
                case "wiki.md":
                    cacheObject = this.detectorsWikiCache;
                    break;
            }

            if (angular.isDefined(cacheObject) && angular.isDefined(cacheObject[detectorName])) {
                deferred.resolve(cacheObject[detectorName]);
                return deferred.promise;
            }

            this.$http({
                method: "GET",
                url: UriPaths.DetectorsDocumentApiPath(detectorName, documentName)
            })
                .success((data: string) => {
                    if (angular.isDefined(data) && data !== '') {

                        if (angular.isDefined(cacheObject)) {
                            cacheObject[detectorName] = data;
                        }

                        deferred.resolve(data);
                    }
                    else {
                        deferred.reject(data);
                    }
                })
                .error((data: any) => {
                    deferred.reject(data);
                });

            return deferred.promise;
        }
    }
}