'use strict';

angular.module("writeInstruction",['ngFileUpload'])
    .controller('writeInstructionCtrl',function($routeParams, $scope, $http, $window, $sce){
                
        function accessCheck(){
            if(!$scope.data)
                window.location = "http://localhost:3000/";
            else if($routeParams.action == 'edit' && $scope.data.status != 3){
                if($routeParams.idUser != $scope.data.idUser)
                    window.location = "http://localhost:3000/";
                else{
                    getUserAndInstruction();
                }
            }
            else if($routeParams.action == 'edit' && $scope.data.status == 3){
                getUserAndInstruction();
            }
            else if($routeParams.action == 'write' && $routeParams.idUser != $scope.data.idUser && $scope.data.status != 3)
                window.location = "http://localhost:3000/";
            else if($routeParams.action == 'write'){
                getUser($routeParams.idUser);
                installMarkdown();
                getTags();
            }
        }
        
        function getUserAndInstruction(){
            getUser($routeParams.idUser);
            getInstruction($routeParams.idInstr);            
        }
        
        function urlCheck(response){
            if(response.data.length == 0)
                window.location = "http://localhost:3000/";
            else{
                $scope.user.idUser = response.data[0].idUser;
                $scope.user.photo = response.data[0].photo;
                $scope.user.familyName = response.data[0].familyName;
            }
        }
        
        function getUser(id){
            $http.get('users/getInfoUserById/'+id).then(function mySucces(response) {
                urlCheck(response);
            }, function myError(response){
                console.log(response);
            });            
        }
        
        function getInstruction(id){
            $http.get('instruction/getById/'+id).then(function mySucces(response) {
                urlCheck(response);
                if(response.data[0].idUserFK != $routeParams.idUser && $scope.data.status != 3)
                    window.location = "http://localhost:3000/";
                insertingDataForEditing(response.data[0]);
            }, function myError(response){
                console.log(response);
            });            
        }

        function insertingDataForEditing(data){
            $scope.user.idUser = data.idUserFK;
            $scope.user.photo = data.photo;
            $scope.user.familyName = data.familyName;
            $scope.headingInput1 = data.heading;
            $scope.shortDescriptionInput1 = data.shortDescription;
            $scope.previewInput1 = data.preview;
            $scope.subjectSelect1 = data.subject;
            $('#selectSubject').val(data.subject);
            var tags = data.tags.split(',');
            tags.forEach(function(item, i, arr) {
                $scope.selectedTags.push(item);
            });
            $('#text').val(data.text);
            installMarkdown();
        }
        
        function choiceOfAction(){
            if($routeParams.idInstr != 0){
                $scope.action = "update";
                $scope.btnAction = "Редактировать";
            }
            else{
                $scope.action = "create";
                $scope.btnAction = "Опубликовать";
            }
        }
        
        var simplemde = null;
        var article = document.querySelector('article');
        $scope.previewOrImage = "";
        $scope.selectedTags = [];
        $scope.user = {};
        $scope.showCreateInstructionOrPreview = true;
        $scope.datePublished = $scope.getDate(new Date());
        $scope.move = 'one';
        
        $(document).ready(function() {
            accessCheck();
            $scope.hideAlertPublishInstruction();
            getTags();
            choiceOfAction();
        });
        
        function getTags(){
            $http.get('instruction/tags').then(function mySucces(response) {
                setTags(response.data);
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
        
        function installMarkdown(){
            simplemde = new SimpleMDE({
                toolbar: [{
                        name: "heading",
                        action: SimpleMDE.toggleHeadingSmaller,                        
                        className: "fa fa-header",
                        title: "Heading",
                    },
                    {
                        name: "bold",
                        action: SimpleMDE.toggleBold,
                        className: "fa fa-bold",
                        title: "Bold",
                    },
                    {
                        name: "italic",
                        action: SimpleMDE.toggleItalic,                        
                        className: "fa fa-italic",
                        title: "Italic",
                    }, 
                    {
                        name: "strikethrough",
                        action: SimpleMDE.toggleStrikethrough,                        
                        className: "fa fa-strikethrough",
                        title: "IStrikethrough",
                    },
                    "|",
                    {
                        name: "code",
                        action: SimpleMDE.toggleCodeBlock,                        
                        className: "fa fa-code",
                        title: "Code",
                    },
                    {
                        name: "quote",
                        action: SimpleMDE.toggleBlockquote,                        
                        className: "fa fa-quote-left",
                        title: "Quote",
                    },  
                    {
                        name: "unordered-list",
                        action: SimpleMDE.toggleUnorderedList,                        
                        className: "fa fa-list-ul",
                        title: "Generic List",
                    },
                    {
                        name: "ordered-list",
                        action: SimpleMDE.toggleOrderedList,                        
                        className: "fa fa-list-ol",
                        title: "Numbered List",
                    },
                    "|",
                    {
                        name: "link",
                        action: SimpleMDE.drawLink,                        
                        className: "fa fa-link",
                        title: "Create Link",
                    },
                    {
                        name: "table",
                        action: SimpleMDE.drawTable,                        
                        className: "fa fa-table",
                        title: "Insert Table",
                    },                    
                    {
                        name: "image",
                        action: function customFunction(editor){
                            $scope.editor = editor;
                            $scope.previewOrImage = true;
                            $('#DragAndDropImage').modal('show');
                        },                        
                        className: "fa fa-picture-o",
                        title: "Insert Image",
                    },                    
                    "|",
                    {
                        name: "preview",
                        action: SimpleMDE.togglePreview, 
                        className: "fa fa-eye no-disable",
                        title: "Toggle Preview",
                    }                  
                ],
            });            
        }               
      
        function drawImage(editor){
            var cm = editor.codemirror;
            var stat = getState(cm);
            var options = editor.options;
            var url = "http://";
            if(options.promptURLs) {
                url = prompt(options.promptTexts.image);
                if(!url) {
                    return false;
                }
            }
            _replaceSelection(cm, stat.image, ["![]("+$scope.urlImage, ")"], url);            
        }

        function getState(cm, pos) {
            pos = pos || cm.getCursor("start");
            var stat = cm.getTokenAt(pos);
            if(!stat.type) return {};

            var types = stat.type.split(" ");

            var ret = {},
                data, text;
            for(var i = 0; i < types.length; i++) {
                data = types[i];
                if(data === "strong") {
                    ret.bold = true;
                } else if(data === "variable-2") {
                    text = cm.getLine(pos.line);
                    if(/^\s*\d+\.\s/.test(text)) {
                        ret["ordered-list"] = true;
                    } else {
                        ret["unordered-list"] = true;
                    }
                } else if(data === "atom") {
                    ret.quote = true;
                } else if(data === "em") {
                    ret.italic = true;
                } else if(data === "quote") {
                    ret.quote = true;
                } else if(data === "strikethrough") {
                    ret.strikethrough = true;
                } else if(data === "comment") {
                    ret.code = true;
                } else if(data === "link") {
                    ret.link = true;
                } else if(data === "tag") {
                    ret.image = true;
                } else if(data.match(/^header(\-[1-6])?$/)) {
                    ret[data.replace("header", "heading")] = true;
                }
            }
            return ret;
        }

        function _replaceSelection(cm, active, startEnd, url) {
            if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
                return;

            var text;
            var start = startEnd[0];
            var end = startEnd[1];
            var startPoint = cm.getCursor("start");
            var endPoint = cm.getCursor("end");
            if(url) {
                end = end.replace("#url#", url);
            }
            if(active) {
                text = cm.getLine(startPoint.line);
                start = text.slice(0, startPoint.ch);
                end = text.slice(startPoint.ch);
                cm.replaceRange(start + end, {
                    line: startPoint.line,
                    ch: 0
                });
            } else {
                text = cm.getSelection();
                cm.replaceSelection(start + text + end);

                startPoint.ch += start.length;
                if(startPoint !== endPoint) {
                    endPoint.ch += start.length;
                }
            }
            cm.setSelection(startPoint, endPoint);
            cm.focus();
        }

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        
        $scope.$watch('file', function () {
            if ($scope.file != null){
                $scope.files = [$scope.file]; 
            }
        });
        
        $scope.preview = function(){
            $scope.previewOrImage = false;
            $('#DragAndDropImage').modal('show');
        };
        
        var rand = function() {
            return Math.random().toString(36).substr(2);
        };

        var token = function() {
            return rand() + rand();
        };        
        
        $scope.upload = function(files){
            var file = files[0];
            var storageRef = firebase.storage().ref('/images/' + token() + file.name);
            var uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', function(snapshot){
                var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                move(percent); 
            }, 
            function(error) {
                console.log(error);
            },
            function() {
                move(0);
                var downloadURL = uploadTask.snapshot.downloadURL;
                $scope.urlImage = downloadURL;
                $('#DragAndDropImage').modal('hide');
                if($scope.previewOrImage){
                    drawImage($scope.editor);
                    $scope.previewOrImage = false;
                }
                else{
                    $("#previewInput1").val($scope.urlImage);
                    $scope.previewInput1 = $scope.urlImage;
                }
                $scope.$apply();
            })            
        };
        
        function move(width){
            var elem = document.getElementById("barUploadImage");  
            var elem2 = document.getElementById("barUploadImage2");
            elem.style.width = width + '%'; 
            elem2.style.width = width + '%'; 
        };  
        
        $scope.addTag = function(){
            if($scope.selectionTag.length != 0 && $scope.selectedTags.length < 5){
                $scope.selectedTags = $scope.selectedTags.filter(s=>s!=$scope.selectionTag);
                $scope.selectedTags.push($scope.selectionTag);
                $scope.selectionTag = "";
            } 
        };
        
        $scope.deleteTag = function(tag){
            $scope.selectedTags = $scope.selectedTags.filter(s=>s!=tag);
        };         

        $scope.getFullPostPreview = function(){
            $scope.prevMove = $scope.move;
            $scope.move = 'five';
            var fullPreview = document.getElementById("FullPreview");
            var html  = $window.marked(simplemde.value());
            $scope.htmlSafe = $sce.trustAsHtml(html);  
            fullPreview.innerHTML = $scope.htmlSafe;            
            $scope.showCreateInstructionOrPreview = false;
        };
        
        $scope.backward = function(){
            $scope.showCreateInstructionOrPreview = true;
        };
        
        $scope.editInstruction = function(){
            $scope.hideAlertPublishInstruction();
            if(checkData()){
                var obj = setData();
                obj.idInstruction = $routeParams.idInstr;
                $http.post('instruction/update',obj).then(function mySucces(response) {
                    showAlertPublishInstruction();
                    getTags();
                    window.scrollTo(0,0);
                }, function myError(response){
                    console.log(response);
                });     
            }
            else
                alert("Введите данные");
        };

        $scope.publishInstruction = function(){
            if(checkData()){
                $http.post('instruction/add',setData()).then(function mySucces(response) {
                    $scope.move = 'six';
                    cleanData();
                    getTags();
                }, function myError(response){
                    console.log(response);
                });
            }
        };
        
        function setData(){
            var obj = {
                heading : $scope.headingInput1,
                shortDescription : $scope.shortDescriptionInput1,
                preview : $scope.previewInput1,
                subject : $scope.selectSubject,
                tags : $scope.selectedTags.join(),
                text : simplemde.value(),
                idUserFK : $scope.user.idUser
            };  
            return obj;
        }
        
        $scope.addNewInstruction = function(){
            $scope.move = 'one';
        };
        
        function checkData(){
            if( $scope.headingInput1.length == 0 ||
                $scope.shortDescriptionInput1.length == 0 || 
                $scope.previewInput1.length == 0 ||
                $scope.subjectSelect1.length == 0 ||
                $scope.selectedTags.length == 0 ||
                simplemde.value().length == 0)
                return false;
            $scope.selectSubject = $('#selectSubject').val();
            return true;
        }
        
        function cleanData(){
            $scope.headingInput1 = "";
            $scope.shortDescriptionInput1 = "";
            $scope.previewInput1 = "";
            $scope.subjectSelect1 = "";
            $scope.selectedTags = [];
            simplemde.toTextArea();
            simplemde = null;
            $('textarea').val("");
            installMarkdown();            
        }
        
        $scope.nextMove = function(move){
            if(move == 'two'){
                if($scope.headingInput1.length != 0 && $scope.shortDescriptionInput1.length != 0)
                    $scope.move = move;
            }
            else if(move == 'three'){
                if($scope.previewInput1.length != 0)
                    $scope.move = move;
            }
            else if(move == 'four'){
                if($scope.subjectSelect1.length != 0 || $scope.selectedTags.length == 0)
                    $scope.move = move;
            }
        };
        
        $scope.previousMove = function(move){
            $scope.move = move;
        };
        
        $scope.backToMove = function(){
            $scope.move = $scope.prevMove;
        };
        
        $scope.hideAlertPublishInstruction = function(){
            var alertPublishInstruction = document.getElementById('alertPublishInstruction').style;
            alertPublishInstruction.display = 'none';    
        };
        
        function showAlertPublishInstruction(){
            var alertPublishInstruction = document.getElementById('alertPublishInstruction').style;
            alertPublishInstruction.display = '';    
        };
});