'use strict';

angular
	.module('directive.perk', [
		'app-templates',
		'angularjs-gravatardirective',
		'service.participant',
		'service.perk',
		'service.activity',
		'firebase'
	])
	.directive('ppPerk', function($firebase, ParticipantService, PerkService, ActivityService) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				enabled: '='
			},
			templateUrl: 'directives/redeem.html',
			controller: function($scope) {
				$scope.selected = {
					participant: null,
					perk: null
				};
				$scope.sufficient = true;
				$scope.perks = PerkService;
				$scope.participants = ParticipantService;
				
				$scope.selectUser = function(participantId) {
					$scope.selected.participant = $scope.participants.$child(participantId);
					$scope.verify();
				};
				
				$scope.selectPerk = function(perkId) {
					$scope.selected.perk = $scope.perks.$child(perkId);
					$scope.verify();
				};
				
				$scope.verify = function() {
					if ($scope.selected.participant && $scope.selected.perk) {
						if ($scope.selected.participant.points.current - $scope.selected.perk.points >= 0) {
							$scope.sufficient = true;
						}
						else {
							$scope.sufficient = false;
						}
					}
				};
				
				$scope.save = function() {
					$scope.verify();
					
					if ($scope.sufficient) {
						$scope.selected.participant.points.current = $scope.selected.participant.points.current - $scope.selected.perk.points;
						$scope.selected.participant.points.redeemed = $scope.selected.participant.points.redeemed + $scope.selected.perk.points;
						$scope.selected.participant.points.perks = $scope.selected.participant.points.perks + 1;
						$scope.selected.participant.$child('perks').$add($scope.selected.perk);
						$scope.selected.participant.$priority = -Math.abs($scope.selected.participant.points.current);
						$scope.selected.participant.$save().then(function() {
							ActivityService.$add({
								participant: $scope.selected.participant,
								perk: $scope.selected.perk,
								created: Firebase.ServerValue.TIMESTAMP
							})
							.then(function(ref) {
								var activity = $firebase(ref);
								activity.$priority = -Math.abs(new Date().getTime());
								activity.$save();
								
								// reset
								$scope.selected.participant = null;
								$scope.selected.perk = null;
								
								$scope.enabled = false;
							});
						});
					}
				};
				
			}
		};
	})
;
