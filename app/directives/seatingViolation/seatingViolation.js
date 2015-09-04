angular.module('outdoorSeatingApp')
.directive('seatingViolation', function () {
	return {
		templateUrl: 'directives/seatingViolation/seatingViolation.html',
		restrict: 'E',
		scope: {
			array: '=',
			headers: '=',
			filename: '@',
			type: '@'
		},
		controller: function ($scope, $rootScope, $filter, $timeout, violations) {
			$scope.violations = [];
			var hiddenFields = ['OBJECTID', 'ESTABLISHMENT_OID', 'ESTABLISHMENT', 'CREATED_USER', 'CREATED_DATE', 'LAST_EDITED_USER', 'LAST_EDITED_DATE']
			$rootScope.$on('violationFound', function (e, v, oid) {
				$scope.violations = v;
				angular.forEach($scope.violations, function (violation) {
					violation.properties = [];
					if (violation.attributes.OBJECTID === oid) {
						violation.editing = true;
					}
					angular.forEach(violation.attributes, function (a, key) {
						if (hiddenFields.indexOf(key) === -1) {
							var field = $filter('filter')($scope.fields, function (f) {
								return f.name === key;
							});
							if (field.length > 0) {
								field = field[0];
							}
							if (field.type != 'esriFieldTypeDate') {
								var obj = {alias: field.alias, name: field.name, value: violation.attributes[key]};
								if (field.domain) {
									obj.codedValues = field.domain.codedValues;
									var val = $filter('filter')(obj.codedValues, function (cv) {
										return cv.code === obj.value;
									});
									if (val.length > 0) {
										val = val[0];
										obj.value = val;
									}
								}
								violation.properties.push(obj);
							} else {
								var format = (field.name === 'DOB') ? 'MM/dd/yyyy' : 'MM/dd/yyyy hh:mm a';
								var minView = (field.name === 'DOB') ? 'day' : 'minute';
								violation.properties.push({alias: field.alias, name: field.name, value: $filter('date')(violation.attributes[key], format), isDate: true, minView: minView, format: format});

							}
						}
					});
					console.log(violation);
				});
			});

			$scope.valueChanged = function (violation, property) {
				console.log(violation);
				console.log(property);
				if (property.isDate) {
					property.value = $filter('date')(new Date(property.value), property.format);
				}
				var id = violation.attributes.OBJECTID;
				var feature = {"attributes": {"OBJECTID": id}}
				if (property.codedValues) {
					feature.attributes[property.name] = property.value.code;
				} else {
					feature.attributes[property.name] = property.value;
				}
				violations.updateViolation([feature]).then(function (data) {
					console.log(data);
				});


			};

			$scope.addViolation = function () {
				violations.addViolation([{attributes: {'ESTABLISHMENT_OID': $scope.establishment.properties.OBJECTID}}]).then(function (data) {
					var oid = data.addResults[0].objectId;
					violations.getViolations($scope.establishment.properties.OBJECTID).then(function (data) {
						
						if (data.relatedRecordGroups.length > 0) {
							$rootScope.$broadcast('violationFound', data.relatedRecordGroups[0].relatedRecords, oid);
						} else {
							$rootScope.$broadcast('violationFound', [], oid);
						}
					});					
				});
			}

			$scope.deleteViolation = function (oid) {
				violations.deleteViolation(oid).then(function (data) {
					var oid = data.deleteResults[0].objectId;
					angular.forEach($scope.violations, function (v) {
						if (v.attributes.OBJECTID === oid) {
							delete v;
						}
					});
					for (var i = 0; i < $scope.violations.length;i++) {
						if ($scope.violations[i].attributes.OBJECTID === oid) {
							$scope.violations.splice(i, 1);
							break;
						}
					}
				});
			}

			$rootScope.$on('establishmentSelected', function (e, establishment) {
				$scope.establishment = establishment;
				switch(establishment.properties.STATUS) {
					case 0:
						$scope.permitStatus = {style: 'label-success' , label: 'Active'};
					break;
					case 1:
						$scope.permitStatus = {style: 'label-warning' , label: 'Pending'};
					break;
					case 2:
						$scope.permitStatus = {style: 'label-danger' , label: 'Expired'};
					break;
					case 3:
						$scope.permitStatus = {style: 'label-danger' , label: 'Revoked'};
					break;
				}
			});

			violations.getFields().then(function (data) {
				$scope.fields = data.fields;
				console.log(data);
			});
		},
		link: function (scope, element, attrs) {

		}
	}
});