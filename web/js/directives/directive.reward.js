'use strict';

angular
	.module('directive.reward', [
		'app-templates',
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
			templateUrl: 'directives/reward.html',
			controller: function($scope) {
				$scope.selected = {
					participant: null,
					reward: null
				};
				$scope.participants = ParticipantService.$asArray();
				
				$scope.rewards = RewardService.$asArray();
				
				$scope.selectUser = function(participantId) {
					$scope.selected.participant = $scope.participants.$getRecord(participantId);
				};
				
				$scope.selectReward = function(rewardId) {
					$scope.selected.reward = _.pick($scope.rewards.$getRecord(rewardId), ['name', 'points']);
					$scope.selected.reward.rewardId = rewardId;
				};
				
				$scope.save = function() {
					$scope.selected.participant.points.current = $scope.selected.participant.points.current + $scope.selected.reward.points;
					$scope.selected.participant.points.allTime = $scope.selected.participant.points.allTime + $scope.selected.reward.points;
					ParticipantService.$ref().child($scope.selected.participant.$id).child('rewards').push($scope.selected.reward);
					$scope.selected.participant.$priority = -Math.abs($scope.selected.participant.points.current);
					$scope.participants.$save($scope.selected.participant).then(function() {
						ActivityService.$asArray().$add({
							participant: $scope.selected.participant,
							reward: $scope.selected.reward,
							created: Firebase.ServerValue.TIMESTAMP,
							$priority: -Math.abs(new Date().getTime())
						})
						.then(function(ref) {
							// reset
							$scope.selected.participant = null;
							$scope.selected.reward = null;
							
							$scope.enabled = false;
						});
					});
				};
				
			}
		};
	})
;
