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
            
            var resultDataChecking = dataChecking(firstName, lastName, email, password, password2);
            if(resultDataChecking)
                sendingOfDataForRegistration(firstName, lastName, email, password, password2);
        };
        
        function dataChecking(firstName, lastName, email, password, password2){
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
        
        function sendingOfDataForRegistration(firstName, lastName, email, password, password2){
            $('#modalRegist').modal('hide');
            $http.post('users/regist',{familyName:firstName + " " + lastName, email:email, password:password}).then(function mySucces(response) {
                console.log(response.data);
                tuningTextAlertRegist(response);
                showAlertRegist();
            }, function myError(response) {
                $scope.alertRegist = "Неверный Email";
                showAlertRegist();
            });            
        };
        
        function tuningTextAlertRegist(response){
            $scope.alertRegist = (response.data != "OK") ? "Пароль занят" : "Письмо отправлено на Вашу почту. Подтвердите регистрацию";         
        };
       
    });