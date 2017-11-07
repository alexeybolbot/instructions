'use strict';

angular.module("fullTextSearch",[])
    .controller('fullTextSearchCtrl',function($routeParams, $scope, $http){
        
        $scope.text = $routeParams.text;
        $scope.countResultSearch = 0;
        $scope.instructions = [];

        $(document).ready(function() {;
            getResultFullTextSearch($routeParams.text);
        });

        function getResultFullTextSearch(text){
            $http.post('fullTextSearch/', {text:text}).then(function mySucces(response) {
                var resultSearch = new Map();
                var instructionsMap = [];
                response.data.forEach(function(item, i, arr) {
                    resultSearch.set(item._source.idinstruction, item._source);
                });
                $scope.countResultSearch = resultSearch.size;
                resultSearch.forEach( (value, key, map) => {
                    instructionsMap.push(value);
                });
                $scope.instructions = instructionsMap.map(function(instruction) {
                    instruction.date = $scope.getDate(instruction.date);                
                    return instruction;
                });
            }); 
        };

});