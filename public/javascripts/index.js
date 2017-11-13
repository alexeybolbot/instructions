var app = angular.module('indexApp', [
    "ngRoute",
    "pascalprecht.translate",
    "instructions",
    "writeInstruction",
    "getInstruction",
    "fullTextSearch",
    "profile",
    "adminPanel",
    "tags",
    "users"
]);

app.config(function($routeProvider,$translateProvider) {
    $routeProvider.when("/", {
        templateUrl : "/html/instructions.html",
        controller : "instructionsCtrl"
    }).when("/write/:action/:idUser",{
        templateUrl : "/html/writeInstruction.html",
        controller : "writeInstructionCtrl"
    }).when("/edit/:action/:idInstr/:idUser", {
        templateUrl : "/html/editInstruction.html",
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
    }).when("/admin",{
        templateUrl : "/html/adminPanel.html",
        controller : "adminCtrl"
    }).when("/tags",{
        templateUrl : "/html/tags.html",
        controller : "tagsCtrl"
    }).when("/users",{
        templateUrl : "/html/users.html",
        controller : "usersCtrl"
    });
    
    $translateProvider.registerAvailableLanguageKeys(['ru_BY', 'en_US'], {
    'en_US': 'en_US',
    'en_UK': 'en_US',
    'ru_BY': 'ru_BY',
    'ru_RU': 'ru_BY',    
    'en': 'en_US',
    'ru': 'ru_BY'
    });

    $translateProvider.useStaticFilesLoader({
      prefix: 'json/lang_',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('ru_BY');
    $translateProvider.fallbackLanguage("en_US");    
    
}).controller('indexCtrl', function($rootScope, $scope, $http, $translate) {
         
    $scope.style = "stylesheets/style.css";
    $scope.styleNavbar = "light";
    $scope.checkAuth = false;
    $rootScope.data = null;
    $rootScope.hub = "all";
    $rootScope.tab = "last";
    $rootScope.name = "";
    $scope.showSearch = false;
    $scope.admin = false;
    
    $scope.socket = io.connect('http://localhost');

    $scope.socket.on('exit', function (data) {
        if(data.idUser == $rootScope.data.idUser && (data.status == 1 || data.status == 0))
            window.location = "http://localhost:3000/session/exit";
        else if(data.idUser == $rootScope.data.idUser && (data.status == 2 && $rootScope.data.status != 2
                || data.status == 3 && $rootScope.data.status != 3)){
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
            $rootScope.data.status = status;
            checkingAccessRightsToTheAdminPanel(status);
            if(status == 2)
                location.reload();            
        });
    }

    function dataSetUp(response){
        $scope.checkAuth = true;
        $rootScope.data = response.data;
        styleSetUp(response);
        $scope.switchLanguage(response.data.language);
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
            $http.post('users/saveStyle', {id:$rootScope.data.idUser, timesOfDay:timesOfDay});
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
    
    $scope.switchLanguage = function(key) {
        $translate.use(key);
        document.getElementById(key).checked = true;
        if($scope.checkAuth)
            $http.post('users/saveLanguage', {id:$rootScope.data.idUser, language:key});
        else
            $http.post('users/saveLanguage', {language:key});      
    };

});