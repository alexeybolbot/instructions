'use strict';

angular.module("adminPanel",[])
    .controller('adminCtrl',function($rootScope, $scope, $http){
        
        $scope.users = [];
        $scope.filteredItems = [];
              
        function verificationOfAccessRights(){
            if($scope.data.status != 3)
                window.location = "http://localhost:3000/";
        }
        
        $.fn.editable.defaults.mode = 'inline';
                
        $(document).ready(function() {
            verificationOfAccessRights();
            getUsers();
        });
        
        function getUsers(){
            $http.get('users/').then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    $scope.users.push(item);
                    if(item.status == 1)
                        $scope.users.statusText = "Bloced";
                    else if(item.status == 2)
                        $scope.users.statusText = "User";
                    else
                        $scope.users.statusText = "Admin";
                });
                setTimeout(function(){instalinPlaceEditing(response.data);},0);
            });            
        }
        
        function instalinPlaceEditing(users){
            users.forEach(function(item, i, arr) {
                $('#userStatus'+item.idUser).editable({
                    type: 'select',
                    value: item.status, 
                    source: [
                          {value: 1, text: 'Blocked'},
                          {value: 2, text: 'User'},
                          {value: 3, text: 'Admin'}
                       ],
                    success: function(response, newValue) {
                        $scope.users[i].status = newValue;
                        var user = {idUser : item.idUser, status : newValue};
                        changeSession(user);
                        changeOfStatus(user);                      
                    }
                });
            });
        }
        
        function changeSession(user){
            if($scope.data.idUser == user.idUser)
                $http.post('session/changeStatus', {status : user.status}).then(function mySucces(response) {});
        }
        
        function changeOfStatus(obj){
            $http.post('users/updateStatus', obj).then(function mySucces(response) {});
            $scope.socket.emit('deleteOrBanUser', obj);
        }
        
        $scope.deleteUser = function(id){
            $scope.users = $scope.users.filter(u=>u.idUser!=id);
            var obj = {status : 0, idUser : id};
            $http.post('users/delete', obj).then(function mySucces(response) {});
            $scope.socket.emit('deleteOrBanUser', obj);
        };
        
        $scope.$watch('filteredItems', function(newValue) {
            instalinPlaceEditing(newValue);
        });
        
});