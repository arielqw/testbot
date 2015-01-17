'use strict';

angular.module('myApp.configuration', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/configuration', {
    templateUrl: 'views/configuration.html',
    controller: 'configurationCtrl'
  });
}])

.controller('configurationCtrl', function($scope, $http){
        $http.get('/api/getParams/')
            .success(function(res){
                $scope.params = res;

            });
        $scope.save = function(){
            $http.post('/api/setParams/',JSON.stringify($scope.params)).success(function(res){
                alert('Configuration saved!');
            });
        }
    });