viewSetsModule.controller('viewSetsController', ['$scope', '$q', function ($scope, $q) {

    $scope.sets = [];
    $scope.cards = [];
    $scope.selectedCards = [];
    $scope.quantity = 0;

    getSets($q).then(function (results) {
        $scope.sets = results;
        getCards($q, $scope.sets).then(function (results2) {
            $scope.cards = results2;
        });
    });

    $scope.selectedSets = {
        sets: []
    };

    $scope.change = function () {
        $scope.selectedCards = filterCards($scope.cards, $scope.selectedSets.sets);
    };

    $scope.deleteAll = function () {
        deleteAllFromParse($scope.selectedSets.sets, $scope.sets, $q).then(function (newSets) {
            $scope.selectedCards = [];
            $scope.sets = newSets;
            $scope.selectedSets = {
                sets: []
            };

    })};

    $scope.removeLine = function (index) {
        $scope.cards = deleteCardFromArray($scope.selectedCards[index], $scope.cards);
        $scope.selectedCards = filterCards($scope.cards, $scope.selectedSets.sets);
    };

    $scope.editSet = function (index) {
        sessionStorage.setItem('editSet', $scope.selectedCards[index].setId);
        location.href = "../editSet/editSet.html";
    };

    $scope.studySets = function () {
        deleteGroups($q).then(function () {
            createGroups($scope.selectedCards, $q).then(function () {
                location.href = "../groups/groups.html";
            });
        });
    };
}]);

var Set = function (title, objectId) {
    this.title = title;
    this.objectId = objectId;
};

var Card = function (term, definition, setId, objectId) {

    this.term = term;
    this.definition = definition;
    this.setTitle = setId.get('title');
    this.setId = setId.id;
    this.objectId = objectId;
};

function deleteGroups($q) {
    var deleteDFD = $q.defer();

    var Groups = Parse.Object.extend("Groups");
    var groupsQuery = new Parse.Query(Groups);

    groupsQuery.equalTo("userId", Parse.User.current());


    groupsQuery.find({
        success: function (results1) {
            Parse.Object.destroyAll(results1, {
                success: function (success) {
                    var GroupDetail = Parse.Object.extend("Group_Detail");
                    var groupDetailQuery = new Parse.Query(GroupDetail);
                    groupDetailQuery.equalTo("userId", Parse.User.current());
                    groupDetailQuery.find({
                        success: function (results2) {
                            Parse.Object.destroyAll(results2, {
                                success: function (success) {
                                    deleteDFD.resolve();
                                }, error: function (error) {
                                    alert(error.message);
                                    deleteDFD.reject(data);
                                }
                            });
                        },
                        error: function (error) {
                            alert('Failed to remove old groups, with error code: ' + error.message);
                            deleteDFD.reject(data);
                        }
                    });
                }, error: function (error) {
                    alert(error.message);
                }
            });
        },
        error: function (error) {
            alert('Failed to remove old groups, with error code: ' + error.message);
            deleteDFD.reject(data);
        }
    });

    return deleteDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function createGroups(cardsArray, $q) {
    var groupsDFD = $q.defer();
    var shuffledCards = shuffle(cardsArray);
    var groupDetailArr = [];
    var groupsOf = 5;
    var groupsQuant = Math.floor((shuffledCards.length - 1) / groupsOf + 1);
    var groupsArr = [];

    var GroupDetail = Parse.Object.extend("Group_Detail");
    var Groups = Parse.Object.extend("Groups");

    for (var i = 0; i < groupsQuant; i++) {
        var gs = new Groups();
        gs.set("userId", Parse.User.current());
        groupsArr.push(gs);
    }

    Parse.Object.saveAll(groupsArr, {
        success: function (gA) {
            for (var g in gA) {
                var end = groupsOf * g + groupsOf;
                while (end > shuffledCards.length) {
                    end--;
                }
                for (var i = groupsOf * g; i < end; i++) {
                    var gd = new GroupDetail();
                    gd.set("groupId", gA[g]);
                    gd.set("userId", Parse.User.current());
                    gd.set("term", cardsArray[i].term);
                    gd.set("definition", cardsArray[i].definition);
                    groupDetailArr.push(gd);
                }
            }
            Parse.Object.saveAll(groupDetailArr, {
                success: function (gda) {
                    groupsDFD.resolve();
                },
                error: function (gda, error) {
                    alert('Failed to create new group detail, with error code: ' + error.message);
                }
            });
        },
        error: function (cs, error) {
            alert('2-Failed to create new card, with error code: ' + error.message);
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

function getSets($q) {
    var setsDFD = $q.defer();
    var setsArr = [];
    var SetsObject = Parse.Object.extend("Sets");
    var query = new Parse.Query(SetsObject);
    query.equalTo("userID", Parse.User.current());

    query.find({
        success: function (results) {
            for (var i in results) {
                var aSet = new Set(results[i].get("title"), results[i].id);
                setsArr.push(aSet);
            }
            setsArr.sort(compare);
            setsDFD.resolve(setsArr);
        },
        error: function (error) {
            setsDFD.reject(data);
        }
    });

    return setsDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function compare(a, b) {
    return a.title.replace(/ /g, '').localeCompare(b.title.replace(/ /g, ''));
}

function getCards($q, sets) {
    var cardsDFD = $q.defer();
    var cardsArr = [];
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    query.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sets[0].objectId
    });

    for (ss = 1; ss < sets.length; ss++) {
        var tempQuery = new Parse.Query(CardsObject);
        tempQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: sets[ss].objectId
        });
        query = Parse.Query.or(query, tempQuery);
    }

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

var filterCards = function (cardArr, setArr) {
    var filtered = [];
    for (var c in cardArr) {
        for (var s in setArr) {
            if (cardArr[c].setId === setArr[s].objectId) {
                filtered.push(cardArr[c]);
            }
        }
    }
    return filtered;
};

function deleteAllFromParse(sets, modedSets, $q) {
    var setsDFD = $q.defer();

    var SetsObject = Parse.Object.extend('Sets');
    var CardsObject = Parse.Object.extend("Cards");

    var setsQuery = new Parse.Query(SetsObject);
    var cardsQuery = new Parse.Query(CardsObject);

    cardsQuery.equalTo("setsID", {
        __type: "Pointer",
        className: "Sets",
        objectId: sets[0].objectId
    });
    setsQuery.equalTo("objectId", sets[0].objectId);

    for (var ss = 1; ss < sets.length; ss++) {
        var tempSetsQuery = new Parse.Query(SetsObject);
        var tempCardsQuery = new Parse.Query(CardsObject);
        tempCardsQuery.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: sets[ss].objectId
        });
        cardsQuery = Parse.Query.or(cardsQuery, tempCardsQuery);

        tempSetsQuery.equalTo("objectId", sets[ss].objectId);
        setsQuery = Parse.Query.or(setsQuery, tempSetsQuery);
    }

    cardsQuery.find({
            success: function (results) {
                Parse.Object.destroyAll(results);
                setsQuery.find({
                        success: function (results2) {
                            for(r in results2){
                                for(m in modedSets){
                                    if(results2[r].id === modedSets[m].objectId){
                                        modedSets.splice(m,1);
                                    }
                                }
                            }
                            Parse.Object.destroyAll(results2);
                            setsDFD.resolve(modedSets);
                        },
                        error: function (error) {
                            alert('2' + error.message);
                            setsDFD.reject(data);
                        }
                    }
                );
            },
            error: function (error) {
                alert('1' + error.message);
                setsDFD.reject(data);
            }
        }
    );

    return setsDFD.promise
        .then(function (results) {
            return results;
        })
        .catch(function (error) {
            alert(error.message);
        });
}

function deleteRowFromParse(aCard, $q) {
    var cardsDFD = $q.defer();

    var CardsObject = Parse.Object.extend("Cards");
    var cardsQuery = new Parse.Query(CardsObject);

    cardsQuery.equalTo("objectId", aCard.objectId);
    cardsQuery.find({
        success: function (results) {
            Parse.Object.destroyAll(results);
            cardsDFD.resolve();
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

function deleteCardFromArray(aCard, cardArr) {
    newArr = [];
    for (c in cardArr) {
        if (cardArr[c].objectId != aCard.objectId) {
            newArr.push(cardArr[c]);
        }
    }
    return newArr;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}