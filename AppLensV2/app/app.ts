﻿///<reference path="references.ts" />

module SupportCenter {
    "use strict";

    var app = angular.module("supportCenterApp", ["ngMaterial", "ngMdIcons", "ngLetterAvatar", "ui.router", "nvd3"])
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

            $stateProvider
                .state('home', {
                    url: '/sites/{siteName}?{startTime}&{endTime}',
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
}