angular.module('authorizationApp', [])
    .controller('authorizationCtrl', function($scope, $http) {
        
        $scope.link = "";
        
        $scope.tuneLink = function(link){
            $scope.link = link;
            $('#modalRememberMe').modal('show');
        };
        
        $scope.auth = function(val){
            $('#modalRememberMe').modal('hide');
            if(val)
                $http.post('session/rememberMe');
            window.location = "http://localhost:3000/"+$scope.link;
        };
        
        $scope.regist = function(){
            var firstName = $('#inputFirstName').val();
            var lastName = $('#inputLastName').val();
            var email = $('#inputEmail').val();
            var password = $('#inputPassword').val();
            var password2 = $('#inputPassword2').val();
            $('#modalRegist').modal('hide');
            $http.post('users/regist',{familyName:firstName + " " + lastName, email:email, password:password});
        };
       
    });