myApp.controller('editSetController', ['$scope', '$q', function ($scope, $q) {
    $scope.title = "Edit Set";
    $scope.arr = [];
    $scope.theSet = new Set();
    sessionSetId = sessionStorage.getItem('editSet');

    getCards(sessionSetId, $q).then(function (results) {
        $scope.arr = results;
    });

    getSet(sessionSetId, $q).then(function (results) {
        $scope.theSet = results;
        $scope.title = $scope.theSet.title;
    });

    $scope.addLine = function () {
        $scope.arr.push(new Card());
    };
    $scope.removeLine = function (index) {
        $scope.arr.splice(index, 1);
    };
    $scope.submit = function () {
        submitToParse($scope.theSet, $scope.arr, $scope.title, $q).then(function () {
            location.href = "../viewSets/viewSets.html";
        });
    };
}]);

function Card(term, definition, setId, objectId) {
    this.term = term;
    this.definition = definition;
    this.setId = setId;
    this.objectId = objectId;
}

function Set(setId, title) {
    this.setId = setId;
    this.title = title;
}

function getCards(sessionSetId, $q) {
    var cardsDFD = $q.defer();
    var cardsArr = [];
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sessionSetId
    });


    query.find({
        success: function (results) {
            for (var i in results) {
                var aCard = new Card(results[i].get("term"), results[i].get("definition"), results[i].get("setsID"), results[i].id);
                cardsArr.push(aCard);
            }
            cardsDFD.resolve(cardsArr);
        },
        error: function (error) {
            alert(error.message);
            cardsDFD.reject(data);
        }
    });

    return cardsDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function getSet(sessionSetId, $q) {
    var setDFD = $q.defer();
    var endSet;
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);

    query.equalTo("objectId", sessionSetId);

    query.find({
        success: function (results) {
            for (var i in results) {
                endSet = new Set(results[i].id, results[i].get("title"));
            }
            setDFD.resolve(endSet);
        },
        error: function (error) {
            alert(error.message);
            cardsDFD.reject(data);
        }
    });

    return setDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function submitToParse(theSet, arr, title, $q) {
    var cardsDFD = $q.defer();
    var SetObject = Parse.Object.extend('Sets');
    var CardsObject = Parse.Object.extend("Cards");
    var cardsQuery = new Parse.Query(CardsObject);

    var point = new SetObject();
    point.id = theSet.setId;

    point.set("title", title);
    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: theSet.setId
    });

    point.save(null, {
        success: function (point) {
            cardsQuery.find({
                    success: function (results) {
                        Parse.Object.destroyAll(results);
                        var cardArr = [];
                        for (a in arr) {
                            var cs = new CardsObject();
                            cs.set("term", arr[a].term);
                            cs.set("definition", arr[a].definition);
                            cs.set('setsID', {
                                __type: "Pointer",
                                className: "Sets",
                                objectId: theSet.setId
                            });
                            cardArr.push(cs);
                        }

                        Parse.Object.saveAll(cardArr, {
                            success: function (cs) {
                                // Execute any logic that should take place after the object is saved.
                                cardsDFD.resolve();
                            },
                            error: function (cs, error) {
                                // Execute any logic that should take place if the save fails.
                                // error is a Parse.Error with an error code and message.
                                alert('3-Failed to create new card, with error code: ' + error.message);
                            }
                        });
                    },
                    error: function (error) {
                        alert('2-Failed to find cards, with error code: ' + error.message);
                        cardsDFD.reject(data);
                    }
                }
            );
        },
        error: function (cs, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('1-Failed to update title, with error code: ' + error.message);
        }
    });


    return cardsDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}