
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
