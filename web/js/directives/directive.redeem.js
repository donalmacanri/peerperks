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
				$scope.perks = PerkService.$asArray();
				$scope.participants = ParticipantService.$asArray();
				
				$scope.selectUser = function(participantId) {
					$scope.selected.participant = $scope.participants.$getRecord(participantId);
					$scope.verify();
				};
				
				$scope.selectPerk = function(perkId) {
					$scope.selected.perk = _.pick($scope.perks.$getRecord(perkId), ['name', 'points']);
					$scope.selected.perk.perkId = perkId;
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
						ParticipantService.$ref().child($scope.selected.participant.$id).child('perks').push($scope.selected.perk);
						$scope.selected.participant.$priority = -Math.abs($scope.selected.participant.points.current);
						$scope.participants.$save($scope.selected.participant).then(function() {
							ActivityService.$asArray().$add({
								participant: $scope.selected.participant,
								perk: $scope.selected.perk,
								created: Firebase.ServerValue.TIMESTAMP,
								$priority: -Math.abs(new Date().getTime())
							})
							.then(function(ref) {
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
