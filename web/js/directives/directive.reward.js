'use strict';

angular
	.module('directive.reward', [
		'angularjs-gravatardirective',
		'service.participant',
		'service.reward',
		'service.activity',
		'firebase'
	])
	.directive('ppReward', function($firebase, ParticipantService, RewardService, ActivityService) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				enabled: '='
			},
			template: 'directives/reward.html',
			controller: function($scope) {
				$scope.selected = {
					participant: null,
					reward: null
				};
				$scope.participants = ParticipantService;
				
				$scope.rewards = RewardService;
				
				$scope.selectUser = function(participantId) {
					$scope.selected.participant = $scope.participants.$child(participantId);
				};
				
				$scope.selectReward = function(rewardId) {
					$scope.selected.reward = $scope.rewards.$child(rewardId);
				};
				
				$scope.save = function() {
					$scope.selected.participant.points.current = $scope.selected.participant.points.current + $scope.selected.reward.points;
					$scope.selected.participant.points.allTime = $scope.selected.participant.points.allTime + $scope.selected.reward.points;
					$scope.selected.participant.$child('rewards').$add($scope.selected.reward);
					$scope.selected.participant.$priority = -Math.abs($scope.selected.participant.points.current);
					$scope.selected.participant.$save().then(function() {
						ActivityService.$add({
							participant: $scope.selected.participant,
							reward: $scope.selected.reward,
							created: Firebase.ServerValue.TIMESTAMP
						})
						.then(function(ref) {
							var activity = $firebase(ref);
							activity.$priority = -Math.abs(new Date().getTime());
							activity.$save();
							
							// reset
							$scope.selected.participant = null;
							$scope.selected.reward = null;
							
							$scope.enabled = false;
						});
					});
				};
				
				// $scope.rewards.$add({
				// 	name: 'Open a pull request',
				// 	points: 1
				// });
				// $scope.rewards.$add({
				// 	name: 'Have your pull request merged',
				// 	points: 2
				// });
				// $scope.rewards.$add({
				// 	name: 'Pull request merged without any reported issues',
				// 	points: 3
				// });
				// $scope.rewards.$add({
				// 	name: 'Approved someone else\'s pull request',
				// 	points: 1
				// });
				// $scope.rewards.$add({
				// 	name: 'Found issue in someone else\’s pull request',
				// 	points: 2
				// });
				// $scope.rewards.$add({
				// 	name: 'Finished on top this week',
				// 	points: 3
				// });
				// $scope.rewards.$add({
				// 	name: 'Kudos from fellow coder',
				// 	points: 1
				// });
				// $scope.rewards.$add({
				// 	name: 'Helpful commit on someone else\'s pull request',
				// 	points: 1
				// });
				// $scope.rewards.$add({
				// 	name: 'Found jshint errors in pull request',
				// 	points: 1
				// });
				// $scope.rewards.$add({
				// 	name: 'Found broken tests in pull request',
				// 	points: 1
				// });
			}
		};
	})
;
