'use strict';

angular.module("getInstruction",[])
    .controller('getInstructionCtrl',function($rootScope, $routeParams, $scope, $http, $window, $sce){
        
        $scope.checkComments = false;
        $scope.comments = [];
        $scope.checkLike = new Map();
        $scope.rating = 0;
        $scope.avRating = 0;
        $scope.isReadonly = false;
        
        $scope.socket.on('comment', function (data) {
            if(data.idInsructionFK == $routeParams.id){
                $scope.$apply(() => pushComment(data));
                setTimeout(function(){setComments()},0);
            }
        });            
        
        $http.get('instruction/getById/'+$routeParams.id).then(function mySucces(response) {
            $scope.instruction = response.data[0];
            $scope.instruction.tags = response.data[0].tags.split(',');
            $scope.instruction.date = $scope.getDate(response.data[0].date);   
            var fullPreview = document.getElementById("FullPreview");
            var html  = $window.marked(response.data[0].text);
            $scope.htmlSafe = $sce.trustAsHtml(html);  
            fullPreview.innerHTML = $scope.htmlSafe;
            $scope.avRating = response.data[0].avRating;
            getComments();
            getIkonLike();
            getRating();
        });
        
        function getComments(){
            $http.get('instruction/getCommentsById/'+$routeParams.id).then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    pushComment(item);
                });               
                setTimeout(function(){setComments()},0);
            });            
        }
        
        function getIkonLike(){
            $http.get('instruction/getIkonLike/'+$routeParams.id).then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    if($scope.data.idUser == item.idUserLikeFK)
                        $scope.checkLike.set(item.idComments, true);
                });
            });
        }
        
        function getRating(){
            $http.get('instruction/getRating/'+$routeParams.id).then(function mySucces(response) {
                response.data.forEach(function(item, i, arr) {
                    if($scope.data.idUser == item.idUserRatingFK){
                        $scope.rating = item.rating;
                        $scope.isReadonly = true;
                    }
                });
            });
        }        
        
        function pushComment(item){
            $scope.checkComments = true;
            $scope.comments.push({
                idComments : item.idComments,
                idUserCommentsFK : item.idUserCommentsFK,
                familyName : item.familyName,
                photo : item.photo,
                date : $scope.getDate(item.dateComment),
                text : item.textComment,
                countLike : item.countLike
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
                    idUserCommentsFK : $scope.data.idUser,
                    textComment : $scope.comment
                };
                $scope.comment = "";
                $scope.socket.emit('addComment', obj);
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
        
        $scope.like = function(idComment){
            var obj = {
                idCommentFK : idComment,
                idUserLikeFK : $scope.data.idUser
            };
            $http.post('instruction/like', obj).then(function mySucces(response) {
                $scope.comments.forEach(function(item, i, arr) {
                    if(item.idComments == response.data.idComments){
                        $scope.comments[i].countLike = response.data.countLike;
                        tuningIkonLike(idComment);
                    }
                });
            });
        };
        
        function tuningIkonLike(idComment){
            $scope.checkLike.set(idComment, !$scope.checkLike.get(idComment));
        }
        
        $scope.generatePDF = function(){
            DocRaptor.createAndDownloadDoc("YOUR_API_KEY_HERE", {
                test: true,
                type: "pdf",
                document_content: document.getElementById('content').innerHTML
            });   
        };
         
        $scope.rateFunction = function(rating) {
            var obj = {
                idInstructionRatingFK : $routeParams.id,
                idUserRatingFK : $scope.data.idUser,
                rating : rating
            };
            $http.post('instruction/rating', obj).then(function mySucces(response) {
                $scope.avRating = response.data.avRating;
            });           
        };
        
}).directive('starRating', starRating);

function starRating() {
    return {
        restrict: 'EA',
        template:
            '<ul class="star-rating" ng-class="{readonly: readonly}">' +
            '    <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
            '      <i class="fa fa-star"></i>' + 
            '    </li>' +
            '</ul>',
        scope: {
            ratingValue: '=ngModel',
            max: '=?',
            onRatingSelect: '&?',
            readonly: '=?'
        },
        link: function(scope, element, attributes) {
            if (scope.max == undefined) {
                scope.max = 5;
            }
            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function(index) {
                if (scope.readonly == undefined || scope.readonly === false){
                    scope.ratingValue = index + 1;
                    scope.onRatingSelect({
                        rating: index + 1
                    });
                    scope.readonly = true;
                }
            };
            scope.$watch('ratingValue', function(oldValue, newValue) {
                if (newValue || newValue === 0) {
                    updateStars();
                }
            });
        }
    };
}