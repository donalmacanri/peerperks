'use strict';

var app = angular.module('ngPeerPerks', [
		'firebase',
		'config.app',
		'ngRoute',
		'service.participant',
		'service.activity',
		'directive.reward',
		'directive.perk'
	])
	
	.config(function ($routeProvider, $locationProvider) {
		$locationProvider
			.html5Mode(true)
		;
		
		$routeProvider
			.when('/', {controller: 'AppCtrl', templateUrl: '/app.html'})
			.otherwise({templateUrl: '/404.html'})
		;
	})
	
	.controller('AppCtrl', function ($scope, $firebase, ParticipantService, ActivityService, API_URL) {
		var loginRef = new Firebase(API_URL);
		var auth;
		
		$scope.error = null;
		
		$scope.presence = function() {
			if ($scope.user.username) {
				var amOnline = new Firebase(API_URL + '/.info/connected');
				var presenceRef = new Firebase(API_URL + '/participants/' + $scope.user.username + '/status');

				amOnline.on('value', function(snapshot) {
					if (snapshot.val()) {
						presenceRef.onDisconnect().set('offline');
						presenceRef.set('online');
					}
				});
			}
		};
		
		$scope.participants = ParticipantService.$asArray();
		
		if (loginRef.getAuth()) {
			$scope.user = loginRef.getAuth().github;
		}
		
		$scope.activities = ActivityService.$asArray();
		$scope.login = function() {
			loginRef.authWithOAuthPopup('github', function(err, authData) {
				if (err) {
					$scope.error = err.message;
					return;
				}

				$scope.$apply(function() {
					$scope.user = authData.github;
				});
				// successful login
				$scope.error = null;
				
				var participant = _.find($scope.participants, function(participant) {
					return (participant.username === $scope.user.username);
				});
				
				// if not participating yet, then add the user
				if (!participant) {
					ParticipantService.$set($scope.user.username, {
						email: ($scope.user.email) ? $scope.user.email : $scope.user.email,
						name: ($scope.user.displayName) ? $scope.user.displayName : $scope.user.username,
						username: $scope.user.username,
						points: {
							current: 0,
							allTime: 0,
							redeemed: 0,
							perks: 0
						}
					}).then(function() {
						$scope.presence();
						
						var participantRef = new Firebase(API_URL + '/participants/' + $scope.user.username);
						var participant = $firebase(participantRef);
						participant.$priority = 0;
						participant.$save();
					});
				} else {
					$scope.presence();
				}
				
			}, {
				scope: 'user:email'
			});
		};
		
		$scope.logout = function() {
			var presenceRef = new Firebase(API_URL + '/participants/' + $scope.user.username + '/status');
			presenceRef.set('offline');
			loginRef.unauth();
			$scope.user = null;
		};
		
		$scope.cancel = function() {
			$scope.selectReward = false;
			$scope.selectPerk = false;
		};
	})
	
;
