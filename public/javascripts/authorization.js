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
       
    });