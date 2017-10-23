angular.module('instructionsApp', [])
    .controller('instructionsCtrl', function($scope, $http) {
        
        $scope.style = "stylesheets/style.css";
        $scope.styleNavbar = "light";
        $scope.checkAuth = false;
        $scope.data = null;

        $http.get('getSession').then(function mySucces(response) {
            if(response.data.idUser)
                dataSetUp(response);
        }, function myError(response) {
            console.log(response.statusText);
        });        
        
        function dataSetUp(response){
            $scope.checkAuth = true;
            $scope.data = response.data;
            $scope.changeOfStyle(response.data.style);
            document.getElementById(response.data.style).checked = true;        
        }
        
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