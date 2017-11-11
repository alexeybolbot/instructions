'use strict';

angular.module("profile",[])
    .controller('profileCtrl',function($rootScope, $routeParams, $scope, $http){
        
        $scope.user = {};
        $scope.tabs = "prof";
        $scope.originalListInstructions = [];
        $scope.instructions = [];
        $scope.tags = [];
        $scope.subjects = [];
        $scope.accessStatus = false;
        $scope.countInstructions = false;
        $scope.countBadges = false;
        $scope.countTags = false;
        $scope.accessSettings = false;
        
        $.fn.editable.defaults.mode = 'inline';
                        
        $(document).ready(function() {;
            statusCheck();
            getInfoUser($routeParams.id);
            getTags();
        });
        
        function statusCheck(){
            if($scope.data){
                if($scope.data.status == 3 || $scope.data.idUser == $routeParams.id)
                   $scope.accessStatus = true; 
                if($scope.data.idUser == $routeParams.id)
                    $scope.accessSettings = true;
            }
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
        
        function getSubject(){
            $scope.originalListInstructions.forEach(function(item, i, arr) {
                $scope.subjects = $scope.subjects.filter(s=>s!=item.subject);
                $scope.subjects.push(item.subject);
            });
        }
        
        function getInfoUser(idUser){
            $http.get('users/getInfoUserById/'+idUser).then(function mySucces(response) {
                $scope.user = response.data[0];
                $scope.user.familyName = $scope.user.familyName.split(' ');
                $scope.user.chosenImg = $scope.user.photo;
                getInstructionsUser(response);
                instalinPlaceEditing($scope.user, 'userFirstName', 0);
                instalinPlaceEditing($scope.user, 'userLastName', 1);
            });            
        }
        
        function instalinPlaceEditing(user, id, name){
            $('#'+id).editable({
                type: 'text',
                value: user.familyName[name], 
                success: function(response, newValue) {
                    $scope.user.familyName[name] = newValue;
                    $rootScope.data.familyName = $scope.user.familyName[0] + " " + $scope.user.familyName[1];
                    var obj = {
                        idUser : $scope.user.idUser,
                        familyName :$scope.user.familyName[0] + " " + $scope.user.familyName[1]
                    };
                    updateFullName(obj);
                    $scope.$apply();
                }
            });
        }
        
        function updateFullName(user){
            $http.post('users/updateFullName', user).then(function mySucces(response) {});
        }
        
        function copyList(){
            $scope.originalListInstructions.forEach(function(item, i, arr){
                $scope.instructions.push(item);
            });
        }
        
        function getInstructionsUser(response){
            $scope.originalListInstructions = response.data.map(function(instruction) {
                instruction.tags = instruction.tags.split(',');
                instruction.date = $scope.getDate(instruction.date);                
                return instruction;
            });
            setTimeout(copyList,0);
            setTimeout(getSubject,0);
            checkCountInstructions();
        }
        
        function checkCountInstructions(){
            if($scope.originalListInstructions == 0)
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
            $scope.originalListInstructions = $scope.originalListInstructions.filter(i=>i.idInstruction!=idInstr);
            $scope.instructions = $scope.instructions.filter(i=>i.idInstruction!=idInstr);
            checkCountInstructions();
            $http.post('instruction/delete',{idInstruction: idInstr, idUser: $routeParams.id}).then(function mySucces(response) {
                console.log(response);
            }, function myError(response){
                console.log(response);
            });
        };
        
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        
        $scope.$watch('file', function () {
            if ($scope.file != null){
                $scope.files = [$scope.file]; 
            }
        });
        
        $scope.showDragAndDropImage = function(){
            $('#DragAndDropImage').modal('show');
        };        
        
        var rand = function() {
            return Math.random().toString(36).substr(2);
        };

        var token = function() {
            return rand() + rand();
        };        
        
        $scope.upload = function(files){
            var file = files[0];
            var storageRef = firebase.storage().ref('/images/' + token() + file.name);
            var uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', function(snapshot){
                var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                move(percent); 
            }, 
            function(error) {
                console.log(error);
            },
            function() {
                move(0);
                var downloadURL = uploadTask.snapshot.downloadURL;
                $scope.user.chosenImg = downloadURL;
                $scope.$apply();
                $('#DragAndDropImage').modal('hide');
            })            
        };
        
        function move(width){
            var elem = document.getElementById("barUploadImage");   
            elem.style.width = width + '%'; 
        };        
        
        $scope.saveChosenImg = function(){
            if($rootScope.data.photo != $scope.user.chosenImg){
                $rootScope.data.photo = $scope.user.chosenImg;
                $scope.user.photo = $scope.user.chosenImg;
                var obj = {
                    idUser : $scope.user.idUser,
                    photo :$scope.user.photo
                };
                $http.post('users/updatePhoto', obj).then(function mySucces(response) {});
                $scope.$apply(); 
            }
        };
        
        $scope.propertyName = '';
        $scope.reverse = false;
        
        function compareRating(instrA, instrB) {
            return instrA.avRating - instrB.avRating;
        }
        
        function compareComments(instrA, instrB) {
            return instrA.countComments - instrB.countComments;
        }        
        
        $scope.sortInstr = function(sortBy){
            $scope.reverse = ($scope.propertyName === sortBy) ? !$scope.reverse : false;
            $scope.propertyName = sortBy;            
            if(sortBy == 'Rating')
                $scope.instructions.sort(compareRating);
            if(sortBy == 'Comments'){
                $scope.instructions.sort(compareComments);
            }
            if($scope.reverse)
                $scope.instructions.reverse();
        };
        
        function filterSubject(value) {
            return value.subject == $scope.selectedSubject;
        }
        
        function filterTag(value){
            return -1 < value.tags.indexOf($scope.selectedTag);
        }
        
        $scope.filterInstr = function(type, select){
            if(select == '')
                $scope.reset();
            else if(type == 'Subject'){
                $scope.selectedSubject = select;
                $scope.instructions = $scope.instructions.filter(filterSubject);
            }
            else{
                $scope.selectedTag = select;
                $scope.instructions = $scope.instructions.filter(filterTag);
            }
        };
        
        $scope.reset = function(){
            $scope.propertyName = '';
            $scope.reverse = false;            
            $scope.instructions = [];
            $('.selectFilter').val('').change();
            copyList();
        };
        
        $scope.updateInstruction = function(idInstr){
            window.location = "http://localhost:3000/#!write/"+idInstr+"/"+$routeParams.id;
        };        
        
});