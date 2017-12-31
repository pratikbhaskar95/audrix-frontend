
var app = angular.module('Audrix')
.controller('AudrixAppController', ['$scope', '$http',
	'$mdSidenav', '$rootScope', '$timeout', 'ConfigService', 'localStorageService',	'$location', '$window',
	function ($scope, $http, $mdSidenav, $rootScope, $timeout, ConfigService, localStorageService,	$location, $window)
	{
		$scope.uri = ConfigService.getOrigApiUrl();
		$rootScope.token = localStorageService.get('token');

	}])
.controller('LoginController', ['$scope', '$http','ConfigService', 'localStorageService', '$location','$rootScope', 'UserLoginService', '$auth',
	function ($scope, $http, ConfigService, localStorageService, $location, $rootScope, UserLoginService, $auth) {

		$scope.message = '';
		$scope.error = '';
		$scope.uri = ConfigService.getOrigApiUrl();
		$scope.token = localStorageService.get('token');
		$scope.user = localStorageService.get('user');

		$scope.userSignup = function () {
			var params = {
				username: $scope.username,
				email: $scope.email,
				password: $scope.password,
				firstname: $scope.firstname,
				lastname: $scope.lastname,
			};

			$http.post($scope.uri + 'auth.signup', params )
			.success(function (response) {
				if (response.status) {
					if(typeof $scope.message !== undefined) {
						$scope.message = response.message;
						$location.path('/auth/login');
					}
				}
				else {
					if(typeof $scope.error !== undefined) {
						$scope.error = response.message;
					}
				}
			})
			.error(function (data) {
				if(typeof $scope.error !== undefined) {
					$scope.error = data.message;
				}
			});
		};

		$scope.loginSuccess = function (data) {
			localStorageService.set('token', data.token);
			localStorageService.set('user', {
				username:data.username,
				email:data.email,
			});
		};

		$scope.userLogin = function () {
			$http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username + ':' + $scope.password;
			$http.get($scope.uri + 'auth.login')
			.success(function (response) {
				if (response.status) {
					$scope.loginSuccess(response.data);
					$location.path('/user/dashboard/' + response.data.username);
				}
				else {
					$scope.error = response.message;

				}
			})
			.error(function (data) {
			});
		};

		$scope.authenticate = function(provider) {
			$auth.authenticate(provider).then(function (response) {
				$auth.removeToken();
				localStorageService.set('token', response.data.token);
				localStorageService.set('user', {
					username:response.data.username,
					email:response.data.email,
					fbId: response.data.fbId
				});
				var username =  response.data.username;
				$scope.goToDashboard(username);
			});
		};

		$scope.goToDashboard = function (username) {
			$location.path('/user/dashboard/' + username);
		};

		$scope.userLogout = function () {
			localStorageService.clearAll();
			$http.post($scope.uri + 'auth.logout')
			.success(function (response) {
				if (response.status) {
					if(typeof $scope.message !== undefined) {
						$location.path('/');
					}
				}
				else {
					if(typeof $scope.error !== undefined) {
						$scope.error = response.message;
					}
				}
			})
			.error(function (data) {
				if(typeof $scope.error !== undefined) {
					$scope.error = data.message;
				}
			});
		};

		$scope.logout = function () {
			localStorageService.remove('token', 'user');
			$location.path('/auth/login');
		};

	}])
.controller('UserController', ['$scope', '$http','ConfigService', 'localStorageService', '$location', '$rootScope', '$timeout', '$routeParams',
	function ($scope, $http, ConfigService, localStorageService, $location, $rootScope, $timeout, $routeParams) {

		$scope.token = localStorageService.get('token');
		$scope.user = localStorageService.get('user');
		$scope.username = $scope.user.username;
		$scope.fbProfile = false;

		if($scope.user){
			$scope.fbId = $scope.user.fbId;
			if($scope.fbId) {
				$scope.fbProfile = true
			} else {
				$scope.fbProfile = false
			}
		}

		$scope.userLogout = function () {
			localStorageService.remove('token', 'user');
			$location.path('/auth/login');
		};

	}])
.controller('fileUploadController', ['$scope', '$http','ConfigService', 'localStorageService', '$location', 'Upload', '$rootScope', '$timeout',
	function ($scope, $http, ConfigService, localStorageService, $location, Upload, $rootScope, $timeout) {

	}])

.controller('Controller', ['$scope', '$http','ConfigService', 'localStorageService', '$location',
	function ($scope, $http, ConfigService, localStorageService, $location) {

	}]);
