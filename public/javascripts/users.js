'use strict';

angular.module("users",[])
    .controller('usersCtrl',function($scope, $http){
        
        $scope.users = [];
        
        $(document).ready(function() {
            getUsers();
        });
        
        function getUsers(){
            $http.get('users/').then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    $scope.users.push(item);
                });
            });            
        }
        
        $scope.propertyName = '';
        $scope.reverse = false;        
        
        function compareCountInstructions(instrA, instrB) {
            return instrA.countInstructions - instrB.countInstructions;
        }        
        
        $scope.sort = function(sortBy){
            $scope.reverse = ($scope.propertyName === sortBy) ? !$scope.reverse : false;
            $scope.propertyName = sortBy;            
            $scope.users.sort(compareCountInstructions);
            if($scope.reverse)
                $scope.users.reverse();
        };        
        

});