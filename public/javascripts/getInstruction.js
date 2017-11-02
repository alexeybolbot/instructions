'use strict';

angular.module("getInstruction",[])
    .controller('getInstructionCtrl',function($rootScope, $routeParams, $scope, $http, $window, $sce){
        
        $scope.checkComments = false;
        $scope.comments = [];
        var socket = io.connect('http://localhost');
        
        socket.on('comment', function (data) {
            if(data.idInsructionFK == $routeParams.id){
                $scope.$apply(() => pushComment(data));
                setTimeout(function(){console.log($scope.comments)},0);
            }
        });            
        
        var doc = new jsPDF();
        var specialElementHandlers = {
            '#editor': function (element, renderer) {
                return true;
            }
        };
        $http.get('instruction/getById/'+$routeParams.id).then(function mySucces(response) {
            $scope.instruction = response.data[0];
            $scope.instruction.tags = response.data[0].tags.split(',');
            $scope.instruction.date = $scope.getDate(response.data[0].date);   
            var fullPreview = document.getElementById("FullPreview");
            var html  = $window.marked(response.data[0].text);
            $scope.htmlSafe = $sce.trustAsHtml(html);  
            fullPreview.innerHTML = $scope.htmlSafe; 
            getComments()
        });
        
        function getComments(){
            $http.get('instruction/getCommentsById/'+$routeParams.id).then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    pushComment(item);
                });               
                setTimeout(function(){setComments()},0);
            });            
        }
        
        function pushComment(item){
            $scope.checkComments = true;
            $scope.comments.push({
                idComments : item.idComments,
                idUserFK : item.idUserFK,
                familyName : item.familyName,
                photo : item.photo,
                date : $scope.getDate(item.dateComment),
                text : item.textComment
            });            
        }
        
        function setComments(){
            $scope.comments.forEach(function(item, i, arr) {
                var o = document.getElementById('commentsList'+item.idComments);
                o.style.height = "0px";
                o.style.height = (10+o.scrollHeight)+"px";                
            });
        };

        $scope.addComment = function(){
            if($scope.comment.length != 0){
                var obj = {
                    idInsructionFK : $routeParams.id,
                    idUserFK : $scope.data.idUser,
                    textComment : $scope.comment
                };
                $scope.comment = "";
                socket.emit('addComment', obj);
                window.scrollTo(0,scrollHeight());
                
            }
        };
        
        function scrollHeight(){
            return Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
        }
        
        $scope.generatePDF = function(){
            doc.fromHTML($('#content').html(), 15, 15, {
                'width': 170,
                    'elementHandlers': specialElementHandlers
            });
            doc.save('sample-file.pdf');            
        };

});