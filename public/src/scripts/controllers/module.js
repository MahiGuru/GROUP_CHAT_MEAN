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