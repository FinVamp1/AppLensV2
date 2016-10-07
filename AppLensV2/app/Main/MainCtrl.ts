﻿///<reference path="../references.ts" />

module SupportCenter {
    "use strict";

    export class MainCtrl {

        public static $inject: string[] = ["$http", "$q", "DetectorsService", "$mdSidenav", "SiteService", "$stateParams", "$state", "$window"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService, private DetectorsService: IDetectorsService, private $mdSidenav: angular.material.ISidenavService, private SiteService: ISiteService, private $stateParams: IStateParams, private $state: angular.ui.IStateService, private $window: angular.IWindowService) {

            this.avaiabilityChartData = [];
            this.requestsChartData = [];
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);
            this.availabilityChartOptions = helper.GetChartOptions('runtimeavailability');
            this.requestsChartOptions = helper.GetChartOptions('runtimeavailability');
            this.containerHeight = this.$window.innerHeight * 0.25 + 'px';

            if (!angular.isDefined(this.$stateParams.siteName) || this.$stateParams.siteName === '') {
                // TODO: show error or redirect to home page.
            }

            if (!angular.isDefined(this.$stateParams.startTime)) {
                this.$stateParams.startTime = '';
            }

            if (!angular.isDefined(this.$stateParams.endTime)) {
                this.$stateParams.endTime = '';
            }

            var self = this;
            this.detectorList = this.DetectorsService.detectorList;
            this.SiteService.promise.then(function (data: any) {
                self.site = self.SiteService.site;
                self.getRuntimeAvailability();
            });

            // if no child route is defined, then set default child route to sia
            if (this.$state.current.name === 'home') {
                this.setSelectedItem('servicehealth');
            }

            if (this.$state.current.name === 'home.sia') {
                this.selectedItem = "sia";
            } else if (this.$state.current.name === 'home.detector') {
                this.selectedItem = this.$state.params['detectorName'];
            }
        }

        detectorList: Detector[];
        selectedItem: string;
        site: Site;
        availabilityChartOptions: any;
        avaiabilityChartData: any;
        requestsChartOptions: any;
        requestsChartData: any;
        dataLoading: Boolean = true;
        containerHeight: string;

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        setSelectedItem(name: string): void {
            if (name === 'sia') {
                this.selectedItem = "sia";
                this.$state.go('home.sia');
            }
            else {
                this.selectedItem = name;
                this.$state.go('home.detector', { detectorName: name });
            }

            var sidenav = this.$mdSidenav('left');
            if (sidenav.isOpen()) {
                sidenav.close();
            }
        }

        private getRuntimeAvailability(): void {

            var self = this;
            let helper: DetectorViewHelper = new DetectorViewHelper(this.$window);

            this.DetectorsService.getDetectorResponse(this.site, 'runtimeavailability', this.$stateParams.startTime, this.$stateParams.endTime).then(function (data: DetectorResponse) {

                let chartDataList: any = helper.GetChartData(data, 'runtimeavailability');
                self.dataLoading = false;
                var iterator = 0;
                var requestsIterator = 0;

                _.each(chartDataList, function (item: any) {
                    var f: string;
                    if (item.key.toLowerCase().indexOf("availability") !== -1) {
                        item.color = DetectorViewHelper.runtimeAvailabilityColors[iterator];
                        iterator++;
                        self.avaiabilityChartData.push(item);
                    }
                    else {
                        item.area = true;
                        item.color = DetectorViewHelper.requestsColors[requestsIterator];
                        requestsIterator++;
                        self.requestsChartData.push(item);
                    }

                });
            });
        }
    }
}