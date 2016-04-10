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
