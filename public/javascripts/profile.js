'use strict';

angular.module("profile",[])
    .controller('profileCtrl',function($rootScope, $routeParams, $scope, $http){
        
        $scope.user = {};
        $scope.tabs = "prof";
        $scope.instructions = [];
        $scope.tags = [];
        $scope.accessStatus = false;
        $scope.countInstructions = false;
        $scope.countBadges = false;
        $scope.countTags = false;
                        
        $(document).ready(function() {;
            statusCheck();
            getInfoUser($routeParams.id);
            getTags();
        });
        
        function statusCheck(){
            if($scope.data.status == 3 || $scope.data.idUser == $routeParams.id)
               $scope.accessStatus = true; 
        }
        
        function getTags(){
            $http.get('instruction/getTagsByIdUser/'+$routeParams.id).then(function mySucces(response) {
                if(response.data.length != 0)
                    $scope.countTags = true;
                response.data.forEach(function(item, i, arr) {
                    $scope.tags = $scope.tags.filter(s=>s!=item.tag);
                    $scope.tags.push(item.tag);
                });
            });            
        }
        
        function getInfoUser(idUser){
            $http.get('users/getInfoUserById/'+idUser).then(function mySucces(response) {
                $scope.user = response.data[0];
                $scope.user.familyName = $scope.user.familyName.split(' ');
                getInstructionsUser(response);
            });            
        }
        
        function getInstructionsUser(response){
            $scope.instructions = response.data.map(function(instruction) {
                instruction.tags = instruction.tags.split(',');
                instruction.date = $scope.getDate(instruction.date);                
                return instruction;
            });
            checkCountInstructions();
        }
        
        function checkCountInstructions(){
            if($scope.instructions == 0)
                $scope.countInstructions = false;
            else
                $scope.countInstructions = true;
        }
        
        $scope.showProfile = function(data){
            tuningStyleTabs(data);
        };
        
        $scope.showInstructions = function(data){
            tuningStyleTabs(data);
        };        
        
        function tuningStyleTabs(data){
            $scope.tabs = data;
            $('.tm').removeClass('tabs-menu-active');
            $('.tm').addClass('tabs-menu-not-active');
            $('#tabs-'+data).removeClass('tabs-menu-not-active');
            $('#tabs-'+data).addClass('tabs-menu-active');            
        }
        
        $scope.deleteInstruction = function(idInstr){
            $scope.instructions = $scope.instructions.filter(i=>i.idInstruction!=idInstr);
            checkCountInstructions();
            $http.post('instruction/delete',{idInstruction: idInstr, idUser: $routeParams.id}).then(function mySucces(response) {
                console.log(response);
            }, function myError(response){
                console.log(response);
            });
        };
        
        $scope.updateInstruction = function(idInstr){
            window.location = "http://localhost:3000/#!write/"+idInstr+"/"+$routeParams.id;
        };        
        
});