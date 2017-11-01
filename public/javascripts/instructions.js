'use strict';

angular.module("instructions",[])
    .controller('instructionsCtrl',function($rootScope, $scope, $http){
        
        function getInstructions(){
            $http.post('instruction/',{hub:$scope.hub, tab:$scope.tab, name:$scope.name}).then(function mySucces(response) {
                $scope.instructions = response.data.map(function(instruction) {
                    instruction.tags = instruction.tags.split(',');
                    instruction.date = getDate(instruction.date);                
                    return instruction;
                });
            });               
        }
        
        function getDate(date){
            var now = new Date(date);
            var hours = (now.getHours() < 10) ? '0' + now.getHours() : now.getHours();
            var minutes = (now.getMinutes() < 10) ? '0' + now.getMinutes() : now.getMinutes();
            return now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear()+" "+hours+":"+minutes;
        }    
        
        $(document).ready(function() {;
            tuningStyleTabs($rootScope.tab);
            getInstructions();
        });
        
        $scope.showPublications = function(data){
            $rootScope.tab = data;
            tuningStyleTabs(data);
            getInstructions();
            
        };
        
        function tuningStyleTabs(data){
            $('.tm').removeClass('tabs-menu-active');
            $('.tm').addClass('tabs-menu-not-active');
            $('#tabs-'+data).removeClass('tabs-menu-not-active');
            $('#tabs-'+data).addClass('tabs-menu-active');            
        }
        
        $scope.showPublicationsByTag = function(tag){
            $rootScope.hub = "tag";
            $rootScope.tab = "last";
            $rootScope.name = tag;
            tuningStyleTabs("last");
            getInstructions();
            window.scrollTo(0,0);
        };

});