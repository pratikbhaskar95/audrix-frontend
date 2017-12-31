var app = angular.module('Audrix');

app.directive('audrixHeader', function () {
	return{
		restrict: 'E',
		templateUrl: 'app/components/header.html',
		controller: ['$rootScope','$scope','$mdSidenav',
		function ($rootScope, $scope, $mdSidenav) {

			$scope.showMobileMainHeader = true;
			$scope.openSideNavPanel = function() {
				$mdSidenav('left').open();
			};
			$scope.closeSideNavPanel = function() {
				$mdSidenav('left').close();
			};
		}
		]
	};
});

app.directive('audrixFooter', function () {
	return {
		restrict: 'E',
		templateUrl: 'app/components/footer.html',
		controller: ['$rootScope','$scope',
		function ($rootScope, $scope) {
			// body...
		}
		]
	}
});

app.directive('audrixDashboardHeader', function () {
	return{
		restrict: 'E',
		templateUrl: 'app/components/dashboardHeader.html',
		controller: ['$rootScope','$scope','$mdSidenav',
		function ($rootScope, $scope, $mdSidenav) {

			$scope.showMobileMainHeader = true;
			$scope.openSideNavPanel = function() {
				$mdSidenav('left').open();
			};
			$scope.closeSideNavPanel = function() {
				$mdSidenav('left').close();
			};
		}
		]
	};
});

app.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 100) {
							 // $('#toolbar').removeClass('.toolbar_not_scroll');
							 $scope.boolChangeClass = true;
             } else {
						 		 // $('#toolbar').addClass('.toolbar_not_scroll');
                 scope.boolChangeClass = false;
             }
            scope.$apply();
        });
    };
});
