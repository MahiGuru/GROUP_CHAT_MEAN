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