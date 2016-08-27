
var app = angular.module('DashServerApp', ['ngMaterial', 'ngRoute', 'ConfigCtrl', 'angular-loading-bar']);
app.config(function ($routeProvider, $locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
	
	$routeProvider
	.when('/', {
		templateUrl:'./output/views/index-server.html',
		controller: 'ConfigCtrl',
		controllerAs: 'vm'
	})
	.otherwise({
		templateUrl:'./output/views/notfound.html'
	});
});
