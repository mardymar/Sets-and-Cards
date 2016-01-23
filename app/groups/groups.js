groupsModule.controller('groupsController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

    var wrongTimes = 0;
    $scope.groups = [];
    $scope.currCard = new Group_Detail();
    $scope.groupDetail = [];
    $scope.shadow = 'speller-blue';
    $scope.flashCard = 'Have Fun ... ';
    $scope.answer = "";

    $scope.selectedGroups = {
        group: []
    };

    getGroups($q).then(function (results) {
        $scope.groups = results;
        getGroupDetail($scope.groups, $q).then(function (results2) {
            $scope.groupDetail = results2;
        });
    });

    $scope.change = function () {
        $scope.selectedGroupDetail = filterGroupDetail($scope.groupDetail, $scope.selectedGroups.group);
        if ($scope.selectedGroupDetail.length > 0) {
            $scope.currCard = $scope.selectedGroupDetail[0];
        } else {
            $scope.flashCard = 'Choose a group';
        }
    };

    $scope.submit = function () {
        if ($scope.answer == $scope.currCard.term) {
            $scope.shadow = 'speller-green';
            $scope.flashCard = $scope.currCard.term + ' = ' + $scope.currCard.definition;
            $timeout(function () {
                $scope.shadow = 'speller-blue';
                currIndex = Math.floor(Math.random() * $scope.selectedGroupDetail.length);
                $scope.currCard = $scope.selectedGroupDetail[currIndex];
                wrongTimes = 0;
            }, 1000);
        }
        else {
            wrongTimes++;
            $scope.shadow = 'speller-red';
            if (wrongTimes > 1) {
                $scope.flashCard = "The answer is: " + $scope.currCard.term;
            }
        }
        $scope.answer = "";
    }
}]);

var Group = function (length, objectId) {
    this.length = length;
    this.objectId = objectId;
};

var Group_Detail = function (groupId, term, definition, objectId) {
    this.groupId = groupId;
    this.term = term;
    this.definition = definition;
    this.objectId = objectId;
};

function getGroups($q) {
    var groupsDFD = $q.defer();
    var groupsArr = [];
    var GroupsObject = Parse.Object.extend("Groups");
    var query = new Parse.Query(GroupsObject);

    query.equalTo("userId", Parse.User.current());
    query.find({
        success: function (results) {
            if(results.length <= 0){
                location.href="../newSet/newSet.html";
            }
            for (var i in results) {
                var aGroup = new Group(results.length, results[i].id);
                groupsArr.push(aGroup);
            }
            groupsDFD.resolve(groupsArr);
        },
        error: function (error) {
            groupsDFD.reject(data);
        }
    });

    return groupsDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function getGroupDetail(groups, $q) {
    var groupDetailDFD = $q.defer();
    var groupDetailArr = [];
    var GroupDetailObject = Parse.Object.extend("Group_Detail");
    var query = new Parse.Query(GroupDetailObject);


    query.equalTo("groupId", {
        __type: "Pointer",
        className: "Groups",
        objectId: groups[0].objectId
    });

    for (ss = 1; ss < groups.length; ss++) {
        var tempQuery = new Parse.Query(GroupDetailObject);
        tempQuery.equalTo("groupId", {
            __type: "Pointer",
            className: "Groups",
            objectId: groups[ss].objectId
        });
        query = Parse.Query.or(query, tempQuery);
    }

    query.find({
        success: function (results) {
            for (var i in results) {
                var aGroupDetail = new Group_Detail(results[i].get("groupId").id, results[i].get("term"), results[i].get("definition"), results.id);
                groupDetailArr.push(aGroupDetail);
            }
            groupDetailDFD.resolve(groupDetailArr);
        },
        error: function (error) {
            alert(error.message);
            groupDetailDFD.reject(data);
        }
    });

    return groupDetailDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}


var filterGroupDetail = function (groupDetailArr, selectedGroupsArr) {
    var filtered = [];
    for (var g in groupDetailArr) {
        for (var s in selectedGroupsArr) {
            if (groupDetailArr[g].groupId === selectedGroupsArr[s].objectId) {
                filtered.push(groupDetailArr[g]);
            }
        }
    }
    return filtered;
};
