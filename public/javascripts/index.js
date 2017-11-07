var app = angular.module('indexApp', [
    "ngRoute",
    "instructions",
    "writeInstruction",
    "getInstruction",
    "fullTextSearch"
]);

app.config(function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "/html/instructions.html",
        controller : "instructionsCtrl"
    }).when("/write", {
        templateUrl : "/html/writeInstruction.html",
        controller : "writeInstructionCtrl"
    }).when('/instruction/:id',{
        templateUrl:'html/instruction.html',
        controller:'getInstructionCtrl' 
    }).when('/fullTextSearch/:text',{
        templateUrl:'html/fullTextSearch.html',
        controller:'fullTextSearchCtrl' 
    });
    
}).controller('indexCtrl', function($rootScope, $scope, $http) {
         
    $scope.style = "stylesheets/style.css";
    $scope.styleNavbar = "light";
    $scope.checkAuth = false;
    $scope.data = null;
    $rootScope.hub = "all";
    $rootScope.tab = "last";
    $rootScope.name = "";
    $scope.showSearch = false;
    
    var config = {
        apiKey: "AIzaSyBjdb8e9r1BjW1w_oD4E1fiJpYPcn4yVsM",
        authDomain: "instructions-44e7c.firebaseapp.com",
        databaseURL: "https://instructions-44e7c.firebaseio.com",
        projectId: "instructions-44e7c",
        storageBucket: "instructions-44e7c.appspot.com",
        messagingSenderId: "737777061823"
    };
    firebase.initializeApp(config); 

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
    
    $scope.getDate = function(date){
        var now = new Date(date);
        var hours = (now.getHours() < 10) ? '0' + now.getHours() : now.getHours();
        var minutes = (now.getMinutes() < 10) ? '0' + now.getMinutes() : now.getMinutes();
        return now.getDate()+"-"+(now.getMonth()+1)+"-"+now.getFullYear()+" "+hours+":"+minutes;
    };
    
    $scope.openInputSearch = function(){
        $scope.showSearch = true;
    };
    
    $scope.closeInputSearch = function(){
        $scope.showSearch = false;
    };    

});