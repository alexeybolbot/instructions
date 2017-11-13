angular.module('authorizationApp', [])
    .controller('authorizationCtrl', function($scope, $http) {
        
        $scope.alertRegist = "CONFIRM_REGISTRATION";
        
        
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
        
        $scope.showRegist = function(){
            $('#modalRegist').modal('show');
        };
        
        $scope.regist = function(){
            var firstName = $('#inputFirstName').val();
            var lastName = $('#inputLastName').val();
            var email = $('#inputEmail').val();
            var encrypted = CryptoJS.AES.encrypt($('#inputPassword').val(), "DFGf*/85fg_)fgfd");
            var password = $('#inputPassword').val();
            var password2 = $('#inputPassword2').val();
            var resultDataCheckingRegist = dataCheckingRegist(firstName, lastName, email, password, password2);
            if(resultDataCheckingRegist)
                sendingOfDataForRegistration(firstName, lastName, email, encrypted.toString());
        };
        
        function dataCheckingRegist(firstName, lastName, email, password, password2){
            if(firstName == "" || lastName == "" || email == "" || password == "" || password2 == ""){
                alert("Iput data / Введите данные");
                return false;
            }
            else if(password != password2){
                alert("Password does not match / Пароль не совпадает");
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
                setUpAndShowAlertRegist("WRONG_EMAIL");
            });            
        };
        
        function tuningTextAlertRegist(response){
            $scope.alertRegist = (response.data != "OK") ? "WRONG_EMAIL" : "CONFIRM_REGISTRATION";         
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
                alert("Iput data / Введите данные");
                return false;
            }
            return true;
        };
        
        function sendingOfDataForSignIn(email, password){
            $http.post('users/signIn',{email:email, password:password}).then(function mySucces(response) {
                if(response.data == 0) 
                    setUpAndShowAlertRegist("CONFIRM_REGISTRATION");
                else if(response.data == 2){
                    if($scope.rememberMe)
                        $http.post('session/rememberMe');
                }
                window.location = "http://localhost:3000/";
            }, function myError(response) {
                setUpAndShowAlertRegist("INVALID_INPUT_DATA");
            });            
        };
        
        function setUpAndShowAlertRegist(text){
            $scope.alertRegist = text;
            showAlertRegist();        
        };
       
    });