'use strict';

angular.module("instructions",[])
    .controller('instructionsCtrl',function($rootScope, $routeParams, $scope, $http){
        
        $scope.searchPanel = false;
        $scope.searchPanelTags = false;
        $scope.searchPanelSubject = false;
        
        function getInstructions(){
            $http.post('instruction/',{hub:$scope.hub, tab:$scope.tab, name:$scope.name}).then(function mySucces(response) {
                $scope.instructions = response.data.map(function(instruction) {
                    instruction.tags = instruction.tags.split(',');
                    instruction.date = $scope.getDate(instruction.date);                
                    return instruction;
                });
            });               
        }
        
        function checkingUrl(){
            if($routeParams.hub == "tag")
                $scope.showPublicationsByTag($routeParams.name);
            else{
                tuningStyleTabs($rootScope.tab);
                getInstructions();                
            }
        }
                
        $(document).ready(function() {         
            checkingUrl();
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
            $scope.searchPanel = true;
            $scope.searchPanelTags = true;
            $scope.searchPanelSubject = false;            
            $rootScope.hub = "tag";
            $rootScope.tab = "last";
            $rootScope.name = tag;
            tuningStyleTabs("last");
            getInstructions();
            window.scrollTo(0,0);
        };
        
        $scope.showPublicationsBySubject = function(subject){
            $scope.searchPanel = true;
            $scope.searchPanelTags = false;
            $scope.searchPanelSubject = true; 
            $rootScope.hub = "subject";
            $rootScope.tab = "last";
            $rootScope.name = subject;
            tuningStyleTabs("last");
            getInstructions();
            window.scrollTo(0,0);
        };   
        
        $scope.closeSearch = function(){
            $scope.searchPanel = false;
            $scope.searchPanelTags = false;
            $scope.searchPanelSubject = false;            
            $rootScope.hub = "all";
            $rootScope.tab = "last";
            $rootScope.name = ""; 
            getInstructions();
            window.scrollTo(0,0);            
        };
        
});