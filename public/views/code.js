'use strict';

angular.module('myApp.code', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/code', {
    templateUrl: 'views/code.html',
    controller: 'codeCtrl'
  });
}])

.controller('codeCtrl', [function() {

    }]);