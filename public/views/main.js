'use strict';

angular.module('myApp.main', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'views/main.html',
            controller: 'mainCtrl'
        });
    }])
    .service('ws',function(){
        var scope;
        this.registerScope = function(s){
            scope = s;
        }

        this.initWs = function(){
            var ws = new WebSocket("ws://localhost:8080/",'log-protocol');
            ws.onopen = function(){
                console.log("Socket has been opened!");
            };

            ws.onmessage = function(message) {
//        console.log(JSON.parse(message.data));
                scope.$apply(function(){ scope.output += message.data + '\n' });
                //$scope.$apply($scope.output = message.data);
            };
        }

    })
    .controller('mainCtrl', function ($scope,$http,ws,$sce) {
        $scope.output = '';

        ws.registerScope($scope);
        ws.initWs();

        $scope.format = function(data){
            var from = data.indexOf("---");
            var to = data.lastIndexOf("---");
            if(from!=-1 && from != to ){
                var lines = data.substr(from+4,to-3).split('\n')+"";
                var resultsArr = lines.split(',');
                var resultsFormatted = "";
                for(var i=1; i< resultsArr.length-1; i++){
                    var preName = resultsArr[i].indexOf("(\"");
                    var postName = resultsArr[i].indexOf("\")");
                    if(preName!= -1){
                        var filename = resultsArr[i].substr(preName+2,postName-2);
                        resultsArr[i] = "("+"<a href='/#/test/"+filename+"' alt='click to view details' target='_blank'>"+filename+"</a>"+")" + resultsArr[i].substr(postName+2,resultsArr[i].length);
                        resultsFormatted+=resultsArr[i];
                        resultsFormatted+="\n";

                    }
                    else{
                        resultsFormatted+="\n";
                        resultsFormatted+="<span class='results'>";
                        resultsFormatted+=resultsArr[i];
                        resultsFormatted+="\n";
                        resultsFormatted+=resultsArr[i+1];
                        resultsFormatted+="</span>";
                        resultsFormatted+="\n";
                        break;
                    }
                }
                data = data.substr(0,from) + resultsFormatted;
            }

            return $sce.trustAsHtml(data);
        }

        function download(filename, text) {
            var pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', filename);
            pom.click();
        }

        var fileDownload = function () {
            download("log_" + Math.round(Math.random() * 10000) + ".txt", $scope.output);
        };

        $scope.generate = function () {
            $scope.output = new Date() + ' May the odds be ever in your favor.\n';
            $http.get('/api/runTests/');
        };

        //$scope.download = fileDownload($scope.output);
        $scope.download = fileDownload;

        // for 1 click selecting
    }).directive('selectOnClick', function () {
        function selectElementContents(el) {
            if (window.getSelection && document.createRange) {
                // IE 9 and non-IE
                var range = document.createRange();
                range.selectNodeContents(el);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.body.createTextRange) {
                // IE < 9
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.select();
            }
        }
        // Linker function
        return function (scope, element, attrs) {
            element.bind('click', function () {
                selectElementContents(this);
            });
        };
    });