'use strict';

angular.module('myApp.test', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/test/:filename', {
    templateUrl: 'views/test.html',
    controller: 'testCtrl'
  });
}])

.controller('testCtrl', function($scope, $http, $routeParams){
        $scope.filename =$routeParams.filename;
        $scope.cFile = "Loading..";
        $scope.petiteOut = "Loading..";
        $scope.codegenOutput = "Loading..";
        $scope.testFile = "Loading..";

        $http.get('/api/test/'+$scope.filename).success(function(res){
            console.log("res:" + res.filename);

            $scope.testFile = res.testFile;
            $scope.cFile = res.cFile;
            $scope.petiteOut = res.petiteOut;
            $scope.codegenOutput = res.codegenOutput;

        });
});