angular.module('outdoorSeatingApp').factory('violations', ['$http', '$q', function($http, $q){

	var service = {getViolations:getViolations, getFields:getFields, updateViolation:updateViolation, addViolation:addViolation, deleteViolation:deleteViolation},
		url = "http://mapstest.raleighnc.gov/arcgis/rest/services/OutdoorSeating/FeatureServer";
	return service;
	function getViolations (oid) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: url + '/0/queryRelatedRecords',
			data: $.param({
				relationshipId: "0",
				objectIds: oid,
				outFields: "*",
				f: "json"
			}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(deferred.resolve);
		return deferred.promise;
	}
	function getFields () {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: url + '/1',
			data: $.param({
				f: "json"
			}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(deferred.resolve);
		return deferred.promise;		
	}
	function updateViolation (features) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: url + '/1/updateFeatures',
			data: $.param({
				features: JSON.stringify(features),
				f: "json"
			}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(deferred.resolve);
		return deferred.promise;		
	}
	function addViolation (features) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: url + '/1/addFeatures',
			data: $.param({
				features: JSON.stringify(features),
				f: "json"
			}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(deferred.resolve);
		return deferred.promise;		
	}
	function deleteViolation (oid) {
		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: url + '/1/deleteFeatures',
			data: $.param({
				objectIds: oid,
				f: "json"
			}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(deferred.resolve);
		return deferred.promise;		
	}			
}]);