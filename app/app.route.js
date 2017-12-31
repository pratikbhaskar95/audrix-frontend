
var app = angular.module('Audrix',['ngRoute', 'ngMaterial','ngAnimate','ngMessages',
	'LocalStorageModule', 'satellizer', 'ngFileUpload']);

app.run(function ($window, $rootScope, $auth, $timeout) {
	$rootScope.online = navigator.onLine;
	$window.addEventListener('offline', function () {
			$rootScope.$apply(function() {
				$rootScope.online = false;
				document.body.style.overflowX = "hidden";
				document.body.style.overflowY = "hidden";
    	});
	}, false);
	$window.addEventListener('online', function () {
		$rootScope.$apply(function() {
          $rootScope.online = true;
					$rootScope.bootstrapFlag = true;
					document.body.style.overflowY = 'hidden';

					$timeout(function () {
						$rootScope.bootstrapFlag = false;
					}, 5000);
    });
	}, false);


	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		$rootScope.title = current.$$route.title;
	});

	// if ($auth.isAuthenticated()) {
 //      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
 //    }
});

app.config(function ($routeProvider, $locationProvider, $mdThemingProvider,
	localStorageServiceProvider, $authProvider)
{
	localStorageServiceProvider.setPrefix('aud');
	$mdThemingProvider.theme('audBasic')
	.primaryPalette('grey', {
		'default': '500',
		'hue-1': '400',
		'hue-2': '300',
		'hue-3': '200'
	})
	.accentPalette('pink', {
		'default': 'A400',
		'hue-1': 'A200',
		'hue-2': 'A100',
		'hue-3': 'A100'
	})
	.warnPalette('red', {
		'default': '800',
		'hue-1': '400',
		'hue-2': '500',
		'hue-3': 'A100'
	});
	$mdThemingProvider.setDefaultTheme('audBasic');

	// $authProvider.oauth2({
	// 	name: 'facebook',
	// 	url: 'http://localhost:1337/v1/auth/facebook',
	// 	redirectUri: 'http://fluxshare.com/auth/login',
	// 	clientId: '878487939005131',
	// 	requiredUrlParams: ['scope'],
	// 	scope: ['email'],
	// 	scopeDelimiter: ',',
	// 	authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth'
	// });

	$authProvider.facebook({
		clientId: '1919373968379030',
		url: 'http://localhost:1337/v1/auth/facebook'
	});

	$routeProvider
	.when('/', {
		controller: 'AudrixAppController',
		templateUrl: 'app/components/homepage.html',
		title: 'Home Page'
	})
	.when('/auth/signup', {
		controller: 'LoginController',
		templateUrl: 'app/components/auth/signup.html',
		title: 'Secure Signup Page'
	})
	.when('/auth/login', {
		controller: 'LoginController',
		templateUrl: 'app/components/auth/login.html',
		title: 'Secure Login Page'
	})
	.when('/user/dashboard/:id', {
		controller: 'UserController',
		templateUrl: 'app/components/user/dashboard.html',
		title: 'User Dashboard'
	})
	.when('/user/dashboard/:id/upload', {
		controller: 'fileUploadController',
		templateUrl: 'app/components/user/fileUpload.html',
		title: 'Secure File Upload'
	})

	.otherwise({redirectTo: '/'});
	$locationProvider.html5Mode(true);
});
