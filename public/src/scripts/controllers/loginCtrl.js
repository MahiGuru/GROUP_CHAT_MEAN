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