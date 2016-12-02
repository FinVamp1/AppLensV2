///<reference path="references.ts" />

module SupportCenter {
    "use strict";

    var app = angular.module("supportCenterApp", ["ngMaterial", "ngMdIcons", "ngLetterAvatar", "ui.router", "nvd3", "ngSanitize", "btford.markdown"])
        .service("DetectorsService", DetectorsService)
        .service("SiteService", SiteService)
        .controller("MainCtrl", MainCtrl)
        .controller("DetectorCtrl", DetectorCtrl)
        .controller("SiaCtrl", SiaCtrl)
        .directive("detectorView", [() => new DetectorViewDir()])
        .config(($mdThemingProvider: angular.material.IThemingProvider,
            $mdIconProvider: angular.material.IIconProvider,
            $locationProvider: angular.ILocationProvider,
            $stateProvider: angular.ui.IStateProvider) => {

            $mdThemingProvider.theme('default')
                .primaryPalette('teal')
                .accentPalette('red');

            $mdIconProvider
                .icon('menu', './app/assets/svg/menu.svg', 24);

            $mdIconProvider
                .icon('evidence', './app/assets/svg/search.svg', 30);

            $mdIconProvider
                .icon('success', './app/assets/svg/success.svg', 30);

            $mdIconProvider
                .icon('warning', './app/assets/svg/warning.svg', 30);

            $stateProvider
                .state('home', {
                    url: '/sites/{siteName}?{startTime}&{endTime}&{timeGrain}',
                    templateUrl: 'app/Main/main.html',
                    controller: 'MainCtrl',
                    controllerAs: 'main'
                })
                .state('home.sia', {
                    url: '/appanalysis',
                    views: {
                        'childContent': {
                            templateUrl: 'app/Sia/sia.html',
                            controller: 'SiaCtrl',
                            controllerAs: 'sia'
                        }
                    }
                })
                .state('home.detector', {
                    url: '/detectors/{detectorName}',
                    views: {
                        'childContent': {
                            templateUrl: 'app/Detector/detector.html',
                            controller: 'DetectorCtrl',
                            controllerAs: 'detector'
                        }
                    }
                });

            $locationProvider.html5Mode(true);
        });

    app.filter('worker', function () {
        return function (input) {
            return input.replace("SmallDedicatedWebWorkerRole_IN", "SDW")
                .replace("MediumDedicatedWebWorkerRole_IN", "MDW")
                .replace("LargeDedicatedWebWorkerRole_IN", "LDW")
                .replace("WebWorkerRole_IN_", "W").replace(" - aggregated", "");
        };
    });

    app.filter('corelatedcolor', function () {
        return function (input) {

            if (input == 1)
                return "#ff7043";
            if (input == 0)
                return "#ffc400";

                return "#ffffff";
        };
    });
}