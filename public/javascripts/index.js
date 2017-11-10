var app = angular.module('indexApp', [
    "ngRoute",
    "instructions",
    "writeInstruction",
    "getInstruction",
    "fullTextSearch",
    "profile",
    "adminPanel"
]);

app.config(function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "/html/instructions.html",
        controller : "instructionsCtrl"
    }).when("/write/:idInstr/:idUser", {
        templateUrl : "/html/writeInstruction.html",
        controller : "writeInstructionCtrl"
    }).when('/instruction/:id',{
        templateUrl:'html/instruction.html',
        controller:'getInstructionCtrl' 
    }).when('/fullTextSearch/:text',{
        templateUrl:'html/fullTextSearch.html',
        controller:'fullTextSearchCtrl' 
    }).when('/profile/:id',{
        templateUrl:'html/profile.html',
        controller:'profileCtrl' 
    }).when("/instructions/:hub/:name", {
        templateUrl : "/html/instructions.html",
        controller : "instructionsCtrl"
    }).when("/admin", {
        templateUrl : "/html/adminPanel.html",
        controller : "adminCtrl"
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
    $scope.admin = false;
    
    $scope.socket = io.connect('http://localhost');

    $scope.socket.on('exit', function (data) {
        if(data.idUser == $scope.data.idUser && (data.status == 1 || data.status == 0))
            window.location = "http://localhost:3000/session/exit";
        else if(data.idUser == $scope.data.idUser && (data.status == 2 && $scope.data.status != 2
                || data.status == 3 && $scope.data.status != 3)){
            changeTheStatusOfTheSession(data.status);
        }
    });
    
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
    
    function changeTheStatusOfTheSession(status){
        $http.post('session/changeStatus', {status : status}).then(function mySucces(response) {
            $scope.data.status = status;
            checkingAccessRightsToTheAdminPanel(status);
            if(status == 2)
                location.reload();            
        });
    }

    function dataSetUp(response){
        $scope.checkAuth = true;
        $scope.data = response.data;
        styleSetUp(response);
        checkingAccessRightsToTheAdminPanel(response.data.status);
    }
    
    function checkingAccessRightsToTheAdminPanel(status){
        if(status == 3)
            $scope.admin = true;
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