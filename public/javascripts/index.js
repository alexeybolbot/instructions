angular.module('instructionsApp', [])
    .controller('instructionsCtrl', function($scope, $http) {
        
        $scope.style = "stylesheets/style.css";
        $scope.styleNavbar = "light";
        
        $http.get('getSession').then(function mySucces(response) {
            $scope.changeOfStyle(response.data.style);
            document.getElementById(response.data.style).checked = true;
            console.log(response.data);
        }, function myError(response) {
            console.log(response.statusText);
        });        
        
        
        
        $scope.changeOfStyle = function(timesOfDay){
            if(timesOfDay == "sun"){
                $scope.style = "stylesheets/style.css";
                $scope.styleNavbar = "light";
            }
            if(timesOfDay == "moon"){
                $scope.style = "stylesheets/styleNight.css";
                $scope.styleNavbar = "dark";
            }      
        };
    });