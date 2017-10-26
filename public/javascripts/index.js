var app = angular.module('indexApp', [
    "ngRoute",
    "instructions",
    "writeInstruction"
]);

app.config(function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "/html/instructions.html",
        controller : "instructionsCtrl"
    }).when("/write", {
        templateUrl : "/html/writeInstruction.html",
        controller : "writeInstructionCtrl"
    });
    
}).controller('indexCtrl', function($scope, $http) {
        
    $scope.style = "stylesheets/style.css";
    $scope.styleNavbar = "light";
    $scope.checkAuth = false;
    $scope.data = null;

    $http.get('session/getSession').then(function mySucces(response) {
        if(response.data.idUser)
            dataSetUp(response);
        else if(response.data.style)
            styleSetUp(response);
    }, function myError(response) {
        console.log(response.statusText);
    });        

    function dataSetUp(response){
        $scope.checkAuth = true;
        $scope.data = response.data;
        styleSetUp(response);    
    }

    function styleSetUp(response){
        $scope.changeOfStyle(response.data.style);
        document.getElementById(response.data.style).checked = true;        
    }

    $scope.changeOfStyle = function(timesOfDay){
        if(timesOfDay == "sun"){
            $scope.style = "stylesheets/style.css";
            $scope.styleNavbar = "light";
        }
        else if(timesOfDay == "moon"){
            $scope.style = "stylesheets/styleNight.css";
            $scope.styleNavbar = "dark";
        }
        saveStyle(timesOfDay);
    };

    function saveStyle(timesOfDay){
        if($scope.checkAuth)
            $http.post('users/saveStyle', {id:$scope.data.idUser, timesOfDay:timesOfDay});
        else
            $http.post('users/saveStyle', {timesOfDay:timesOfDay});
    }

});