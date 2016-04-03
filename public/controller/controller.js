
var contactApp = angular.module("contactApp", ['ngRoute', 'ngMessages']);
//socket connection established
var socket = io();


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

contactApp.controller("loginCtrl", ["$scope", "$http", "$location", "$window", function ($scope, $http, $location, $window) {
        console.log("login Ctrl log executed");
        $scope.user = {};
        $scope.isFormSubmit = false

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
            $http.put("/api/userDetailsUpdate/"+ $routeParams.userid, $scope.register).success(function (data) {
                console.log(data); 
                $location.url("chat/"+$scope.register._id);
            }).error(function (err) {
                console.log(err);
            });
        }
        $scope.cancelClick = function () { 
            $location.url("chat/" + $scope.register._id);    
        }

    }]);

contactApp.controller("signupCtrl", ["$scope", "$http", "$location", "$routeParams",  function ($scope, $http, $location, $routeParams) {
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


contactApp.controller("chatCtrl", ["$scope", "$http", "$location", "$routeParams","$window","$document", function ($scope, $http, $location, $routeParams, $window, $document) {
        console.log("Chat Ctrl log executed");
        $scope.userDetails = {};
        var dataLoggedInfo = angular.fromJson($window.sessionStorage.getItem("chatDetails"));
        $scope.messageUsersList = [];
        $scope.visibleChatBtn = true;
        /// receiving the messages
        socket.on("socketInput", function (chatMsg) { 
            if ($scope.userDetails.group  == chatMsg.userGroup) {
                $scope.messageUsersList.push(angular.fromJson(chatMsg));
                $scope.$apply();
            }
        });
        $scope.chatEnterClick = function () { 
                var userMsg = {
                    username : $scope.userDetails.firstname,
                    userInput : $scope.chat.input,
                    userGroup : $scope.userDetails.group
            }
            $scope.chat.input = "";
                //emiting the messages
                socket.emit("socketInput", userMsg);
        }

        ///getUserInformation using routeParam userid..
        if (dataLoggedInfo == null) {
            $http.post("/api/getUserDetail", { userid : $routeParams.userid }).success(function (data) {
                if (data.length > 0) {
                    $window.sessionStorage.setItem("chatDetails", JSON.stringify(data[0]));
                    $scope.userDetails = data[0]; 
                }
            }).error(function (err) {
                console.log(err);
            });
        } else { 
            $scope.userDetails = angular.fromJson(dataLoggedInfo);
        }
        
        $scope.logoutClick = function () {
            $window.sessionStorage.removeItem("chatDetails");
            $location.url('/login');
        }
        $scope.editProfileClick = function () { 
            
        }
        $scope.visibleChatClick = function () { 
            
            $scope.chatContainerVisible = true;
            $scope.visibleChatBtn = false;
        }
        $scope.closeChat = function () {
            $scope.chatContainerVisible = false;
            $scope.visibleChatBtn = true;
        }

    }]);
 