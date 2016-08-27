//js/controllers/ConfigCtrl.js
angular.module('ConfigCtrl', []).controller('ConfigCtrl', ['$window', '$http', '$mdToast', '$sce', '$scope',
	function ($window, $http, $mdToast, $sce, $scope) {
	//var port = ':8888';
	var vm = this;
	vm.ipAddress = '';
	vm.username = '';
	vm.password = '';
	
	vm.refresh = function () {
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	};

	vm.showErrorToast = function (err) {
		vm.showSimpleToast(err);
	};

	vm.showSuccessToast = function (msg) {
		vm.showSimpleToast(msg);
	};

	vm.saveSettings = function (){
		vm.inProgress = true;
		var credentials = btoa(vm.username + ':' + vm.password);
		var localStorage = window.localStorage;
		localStorage.setItem('ipAddress', vm.ipAddress);
		localStorage.setItem('credentials', credentials);
		alert('settings saved!');
	};
	
	vm.showSimpleToast = function (msg){
		$mdToast.showSimple(msg);
	};

	//vm.getSettings();

}]);