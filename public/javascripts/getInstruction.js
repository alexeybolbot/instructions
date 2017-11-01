'use strict';

angular.module("getInstruction",[])
    .controller('getInstructionCtrl',function($rootScope, $routeParams, $scope, $http){
        
        $scope.test = $routeParams.id;

});