'use strict';

angular.module("tags",[])
    .controller('tagsCtrl',function($scope, $http){
        
        $(document).ready(function() {
            getTags();
        });
        
        function getTags(){
            $http.get('instruction/tags').then(function mySucces(response) {
                setTags(response.data);
                if(response.data.length != 0)
                    $scope.countTags = true;
            }, function myError(response){
                console.log(response);
            });                
        } 
        
        function setTags(data){
            var tags = new Set();
            $scope.tags = [];
            data.forEach(function(item, i, data) {
                tags.add(item.tag);
            });
            tags.forEach(function(item, i, tags) {
                $scope.tags.push(item);
            });    
        }
});