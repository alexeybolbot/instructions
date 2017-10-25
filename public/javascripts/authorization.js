angular.module('authorizationApp', [])
    .controller('authorizationCtrl', function($scope, $http) {
        
        $scope.alertRegist = "Письмо отправлено на Вашу почту. Подтвердите регистрацию";
        
        
        $(document).ready(function() {
            $scope.hideAlertRegist(); 
        });

        $scope.hideAlertRegist = function(){
            var alertRegist = document.getElementById('alertRegist').style;
            alertRegist.display = 'none';    
        };
        
        function showAlertRegist(){
            var alertRegist = document.getElementById('alertRegist').style;
            alertRegist.display = '';    
        };       

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
                       
            var resultDataCheckingRegist = dataCheckingRegist(firstName, lastName, email, password, password2);
            if(resultDataCheckingRegist)
                sendingOfDataForRegistration(firstName, lastName, email, password);
        };
        
        function dataCheckingRegist(firstName, lastName, email, password, password2){
            if(firstName == "" || lastName == "" || email == "" || password == "" || password2 == ""){
                alert("Введите данные");
                return false;
            }
            else if(password != password2){
                alert("Пароль не совпадает");
                return false;
            }
            return true;
        };
        
        function sendingOfDataForRegistration(firstName, lastName, email, password){
            $('#modalRegist').modal('hide');
            $http.post('users/regist',{familyName:firstName + " " + lastName, email:email, password:password}).then(function mySucces(response) {
                tuningTextAlertRegist(response);
                showAlertRegist();
            }, function myError(response){
                setUpAndShowAlertRegist("Неверный Email");
            });            
        };
        
        function tuningTextAlertRegist(response){
            $scope.alertRegist = (response.data != "OK") ? "Пароль занят" : "Письмо отправлено на Вашу почту. Подтвердите регистрацию";         
        };
       
        $scope.signIn = function(){
            var email = $('#signInEmail').val();
            var password = $('#signInPassword').val();     
            var resultDataCheckingSignIn = dataCheckingSignIn(email, password);
            if(resultDataCheckingSignIn)
                sendingOfDataForSignIn(email, password);
        };  
        
        function dataCheckingSignIn(email, password){
            if(email == "" || password == ""){
                alert("Введите данные");
                return false;
            }
            return true;
        };
        
        function sendingOfDataForSignIn(email, password){
            $http.post('users/signIn',{email:email, password:password}).then(function mySucces(response) {
                if(response.data == 0) 
                    setUpAndShowAlertRegist("Потдвердите регистрацию на вашей почте");
                else if(response.data == 2){
                    if($scope.rememberMe)
                        $http.post('session/rememberMe');
                }
                window.location = "http://localhost:3000/";
            }, function myError(response) {
                setUpAndShowAlertRegist("Неверно введены данные");
            });            
        };
        
        function setUpAndShowAlertRegist(text){
            $scope.alertRegist = text;
            showAlertRegist();        
        };
       
    });