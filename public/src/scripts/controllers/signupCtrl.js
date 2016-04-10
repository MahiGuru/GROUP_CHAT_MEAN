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