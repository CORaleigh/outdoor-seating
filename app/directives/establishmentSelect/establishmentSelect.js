angular.module('outdoorSeatingApp')
.directive('establishmentSelect', function () {
	return {
		templateUrl: 'directives/establishmentSelect/establishmentSelect.html',
		restrict: 'E',
		scope: {
			array: '=',
			headers: '=',
			filename: '@',
			type: '@'
		},
		controller: function ($scope, $rootScope, violations) {
 			var map = L.map('map').setView([35.785, -78.65], 13);
  			L.esri.basemapLayer('Streets').addTo(map);
			$scope.features = [];
			var query = L.esri.Tasks.query({url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/OutdoorSeating/FeatureServer/0'}).where('1=1');
			query.run(function (error, featureCollection, response) {
				$scope.features = featureCollection.features;
				$scope.$apply();
				var gj = L.geoJson(featureCollection, {
					onEachFeature: function (feature, layer) {
						layer.bindLabel(feature.properties.ESTABLISHMENT);
					}
				}).addTo(map).on('click', function (e) {
					getViolations(e.layer.feature);
					$scope.feature = e.layer.feature;
				});
			});

			var getViolations = function (establishment) {
				map.setView([establishment.geometry.coordinates[1], establishment.geometry.coordinates[0]], 18);
				violations.getViolations(establishment.properties.OBJECTID).then(function (data) {
					if (data.relatedRecordGroups.length > 0) {
						$rootScope.$broadcast('violationFound', data.relatedRecordGroups[0].relatedRecords);
					} else {
						$rootScope.$broadcast('violationFound', []);
					}
				});
				$rootScope.$broadcast('establishmentSelected', establishment);				
			}

			$scope.establishmentSelected  = function (establishment) {
				getViolations(establishment);
			};

  			
		},
		link: function (scope, element, attrs) {

		}
	}
});