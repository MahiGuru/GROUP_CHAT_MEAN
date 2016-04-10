var contactApp = angular.module("contactApp", ['ngRoute', 'ngMessages']);
//socket connection established
var socket = io();
// ===========================================================================
// ANGULAR DIRECTIVE ===========================================================
// =========================================================================== 

contactApp.directive('pwCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                console.log(firstPassword);
                console.log(elem);
                elem.on('keyup', function () {
                    scope.$apply(function () {
                        var v = (elem.val() === $(firstPassword).val());
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }]);

// ===========================================================================
// $routeProvider ===========================================================
// =========================================================================== 

contactApp.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl : 'views/login.html',
        controller  : 'loginCtrl'
    }).when('/signup', {
        templateUrl : 'views/signup.html',
        controller  : 'signupCtrl'
    }).when('/chat/:userid', {
        templateUrl : 'views/chat.html',
        controller  : 'chatCtrl'
    }).when('/edituser/:userid', {
        templateUrl : 'views/edituser.html',
        controller  : 'edituserCtrl'
    }).otherwise({ redirectTo: '/' });
}); 
// ===========================================================================
// LOGIN CONTROLLER ===========================================================
// =========================================================================== 

contactApp.controller("loginCtrl", ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {
        console.log("login Ctrl log executed");
        $scope.user = {};
        $scope.isFormSubmit = false;
        
        $scope.loggedIn = false;
        var chatDetails = angular.fromJson($window.sessionStorage.getItem("chatDetails"));
        if (chatDetails != null) {
            $location.url('/chat/' + chatDetails._id);
        }
        
        $scope.loginClick = function () {
            if ($scope.userForm.$valid) {
                $scope.isFormSubmit = false
            }
            else {
                $scope.isFormSubmit = true;
            }
            //Form valids only making login request
            if ($scope.userForm.$valid) {
                $http.post("/api/login", $scope.user).success(function (data) {
                    if (data.length >= 1) {
                        $location.url('/chat/' + data[0]._id)
                    } else {
                        $scope.loginErr = "Please check your username or password";
                    }
                }).error(function (err) {
                    console.log(err);
                });
            }
        }

    }]);
// ===========================================================================
// SIGNUP CONTROLLER ===========================================================
// =========================================================================== 

contactApp.controller("signupCtrl", ["$scope", "$http", "$location", "$routeParams", function ($scope, $http, $location, $routeParams) {
        console.log("Signup Ctrl log executed");
        $scope.register = {};
        $scope.isFormSubmit = false;
        
        $scope.loggedIn = false;
        $scope.registerClick = function () {
            if ($scope.registerForm.$valid) {
                $scope.isFormSubmit = false
            }
            else {
                $scope.isFormSubmit = true;
            }
            if ($scope.registerForm.$valid) {
                //Generating TOKEN
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                for (var i = 0; i < 20; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                // add some stuff to the users name
                $scope.register.token = text;
                
                $http.post("/api/createUser", $scope.register).success(function (data) {
                    console.log("Success >>>>");
                    $scope.register = {};
                    $scope.register = data;
                    console.log(data);
                    $location.url('/chat/' + data._id)
                }).error(function (err) {
                    console.log(err);
                });
            }
            
        }

    }]); 
// ===========================================================================
// EDIT CONTROLLER ===========================================================
// =========================================================================== 

contactApp.controller("edituserCtrl", ["$scope", "$http", "$location", "$window", "$routeParams", function ($scope, $http, $location, $window, $routeParams) {
        console.log("edit Ctrl log executed");
        
        $http.post("/api/getUserDetail", { userid : $routeParams.userid }).success(function (data) {
            if (data.length > 0) {
                $scope.register = data[0];
                $scope.register.oldPassword = data[0].password;
                $scope.register.oldConfirmPassword = data[0].confpassword;
                $scope.register.password = $scope.register.confpassword = "";
            }
        }).error(function (err) {
            console.log(err);
        });
        $scope.updateInfo = function () {
            if ($scope.register.password == "" && $scope.register.confpassword == "") {
                $scope.register.password = $scope.register.oldPassword;
                $scope.register.confpassword = $scope.register.oldConfirmPassword;
            }
            $http.put("/api/userDetailsUpdate/" + $routeParams.userid, $scope.register).success(function (data) {
                console.log(data);
                $location.url("chat/" + $scope.register._id);
                $window.sessionStorage.removeItem("chatDetails");
            }).error(function (err) {
                console.log(err);
            });
        }
        $scope.cancelClick = function () {
            $location.url("chat/" + $scope.register._id);
        }

    }]); 
// ===========================================================================
// CHAT CONTROLLER ===========================================================
// ===========================================================================

contactApp.controller("chatCtrl", ["$scope", "$http", "$location", "$routeParams", "$window", "$q", function ($scope, $http, $location, $routeParams, $window, $q) {
        console.log("Chat Ctrl log executed");
        /// store user information
        $scope.userDetails = {};
        var dataLoggedInfo = angular.fromJson($window.sessionStorage.getItem("chatDetails"));

        $scope.groupUsersMsgList = [];

        ///Array for users
        $scope.chatMessageList = [];
        $scope.chatuser = {};

        $scope.visibleChatBtn = true;
        $scope.chatDirectiveVisible = true;
        //Adding Chat tabs using below array[]
        $scope.tabsGroup = [];
        $scope.userClickForChatVisible = true;
        $scope.selectedIndex;
        $scope.usersStatus = [];


        ///getUserInformation using routeParam userid..
        if (dataLoggedInfo == null) {
            $http.post("/api/getUserDetail", { userid : $routeParams.userid }).success(function (data) {
                if (data.length > 0) {
                    $window.sessionStorage.setItem("chatDetails", JSON.stringify(data[0]));
                    $scope.userDetails = data[0];
                }
            }).error(function (err) {
                console.log("user information getting failed "+err);
            });
        } else {
            $scope.userDetails = angular.fromJson(dataLoggedInfo);
        }

        /******************************************************************************
                                    SOCKET FUNCTIONALITY
        ***********************************************************************************/
        /// receiving the messages
        socket.on("userAvailable", function (userStatus) {
            if($scope.usersStatus.indexOf(userStatus.username) == -1){
              $scope.usersStatus.push(userStatus.username);
              $scope.$apply();
            }
        });

        /// receiving the messages from Group users
        socket.on("groupUsersChat", function (chatMsg) {
            if ($scope.userDetails.group == chatMsg.userGroup) {
                $scope.groupUsersMsgList.push(angular.fromJson(chatMsg));
                $scope.$apply();
            }
        });

        ///receiving the usersocket messages
        socket.on("individualUserChat", function(userInfo){
          angular.forEach($scope.groupUsers, function(value, key) {
            if(userInfo.userId == value._id){
                $scope.chatMessageList.push(angular.fromJson(userInfo));
                $scope.$apply();
            }
          });
        });
        /// individual chat user click functionality
        $scope.userChatClick  = function(senderId, senderName, senderFullname){
          var userMsgInfo = {
              userFullname : $scope.userDetails.firstname+" "+$scope.userDetails.lastname,
              userInput : $scope.chatuser.input,
              userGroup : $scope.userDetails.group,
              userId : $scope.userDetails._id,
              toSenderId : senderId,
              toSenderName : senderName,
              toSenderFullname : senderFullname,
              username : $scope.userDetails.username
          }
          ///clear chat input after click send button
          $scope.chatuser.input = "";
          ///emitting the chat information to respective user
          socket.emit("individualUserChat", userMsgInfo);
        }
        /// functionality for group chat users click functionality
        $scope.chatEnterClick = function () {
            var userMsg = {
                username : $scope.userDetails.firstname,
                userInput : $scope.chat.input,
                userGroup : $scope.userDetails.group
            }
            ///clear chat input after sending the information
            $scope.chat.input = "";
            //emiting the messages to the respective group
            socket.emit("groupUsersChat", userMsg);
        }

          /******************************************************************************
                                      SOCKET FUNCTIONALITY END
          ***********************************************************************************/
          $scope.userHasMessage = [];
          /// watch user Status for showing the onlise status
          $scope.$watchCollection("chatMessageList", function(newValue, oldValue){

            /// highlighted color Remove if user has unread messages
            /*
          var messageTo = [];
            if(newValue[0] != undefined && newValue[0] != null){
              var chatCounter = {};
              newValue.forEach(function(obj){
                  chatCounter[obj.toSenderId] = (chatCounter[obj.toSenderId] || 0) +1;
                  if(messageTo.indexOf(obj.toSenderId) == -1){
                      messageTo.push(obj.toSenderId);
                  }
                  obj['sendFromUserId'] = $scope.userDetails._id;
              });

              angular.forEach($scope.groupUsers, function(val){
                  //console.log(val._id +" == "+ newValue[newValue.length -1].toSenderId);
                  if(val._id == newValue[newValue.length -1].userId){
                    val["messageFrom"] = newValue[newValue.length -1].userId;
                    val[newValue[newValue.length -1].userId] = newValue[newValue.length -1].userId;
                    val["messageTo"] = messageTo;
                  }
              })
            }
            */
          });
          /// watch user Status for showing the onlise status
          $scope.$watchCollection("usersStatus", function(newValue, oldValue){
              socket.emit("userAvailable", $scope.userDetails);
          });

        ///watching the group of user and getting the respective users in that group..
        $scope.$watch('userDetails.group', function (newValue, oldValue) {
            if (newValue != "undefined" && newValue != null) {
                ///getting the Same users in group
                $http.get("/api/groupUsers/" + $scope.userDetails.group).success(function (data) {
                    if (data.length > 0) {  $scope.groupUsers = data; }
                }).error(function (err) {
                    console.log(err);
                });
            }
        });
        /// User chat button click for adding the tab.
        $scope.userClickForChat = function($event, uid, username, fullname, index){
             var filteredGroup = $.grep($scope.tabsGroup, function(v) {
                return v.username === username;
            });
            /// highlighted color Remove if user has unread messages
            /*angular.forEach($scope.groupUsers, function(obj) {
                if(obj.messageTo != undefined){
                    obj.messageTo.splice((obj.messageTo.indexOf($scope.userDetails._id)), 1)
                }
            });*/
            if(filteredGroup.length <= 0){
              $scope.tabsGroup.push({_id:uid, username : username, fullname : fullname, showButton : true, status:"active"});
              $scope.selectedIndex = index;
            }
        }
        /// User chat close button click for adding the tab.
        $scope.closeUserChatBox = function(obj){
            if($scope.tabsGroup.indexOf(obj) != -1){
              $scope.tabsGroup.splice($scope.tabsGroup.indexOf(obj), 1)
            }
        }
        /// logout click functionality
        $scope.logoutClick = function () {
            $window.sessionStorage.removeItem("chatDetails");
            $location.url('/login');
        }
        /// Group user window maximize using below click functionality
        $scope.visibleChatClick = function () {
            $scope.chatContainerVisible = true;
            $scope.visibleChatBtn = false;
        }
        /// Group user window mnimize using below click functionality
        $scope.closeChat = function () {
            $scope.chatContainerVisible = false;
            $scope.visibleChatBtn = true;
        }

    }]);


contactApp.directive("chatDirective", function(){
    return {
        restrict : "E",
        scope : false,
        templateUrl : "views/chat-directive.html",
        //controller : 'chatCtrl',
        link : function(scope, element, attrs){ 
        }
    }
});
contactApp.directive('tabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: [ "$scope", function($scope) {
            var panes = $scope.panes = [];

            $scope.select = function(pane) {
                angular.forEach(panes, function(pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }
            this.addPane = function(pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
            $scope.removePane = function(pane) {
                var getIndex = panes.indexOf(pane);
                panes.splice(panes.indexOf(pane), 1);
                $scope.$parent.tabsGroup.splice(getIndex, 1);
                if(panes.length >= 1) $scope.select(panes[panes.length-1]);
            }
        }],
        template:
        '<div class="tabbable">' +
        '<ul class="nav nav-tabs">' +
        '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
        '<a href="" class="userChatBoxPane" ng-click="select(pane)">{{pane.title}}</a> <a ng-click="removePane(pane)" class="closeUserChatBox glyphicon glyphicon-remove pull-right"></a>' +
        '</li>' +
        '</ul>' +
        '<div class="tab-content" ng-transclude></div>' +
        '</div>',
        replace: true
    };
}).directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template:
            '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
            '</div>',
            replace: true
        };
    });
