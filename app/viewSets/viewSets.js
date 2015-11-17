/**
 * Created by Marc on 11/14/2015.
 */
viewSetsModule.controller('viewSetsController', ['$scope', '$routeParams', '$q', function($scope, $routeParams, $q) {

    $scope.sets = [];
    $scope.cards =[];

    getSets($q).then(function(results) {
        $scope.sets = results;
        getCards($q, $scope.sets).then(function(results2){
            $scope.cards = results2;
        });
    });

    $scope.selectedSets = {
    };

    $scope.selectedCards = [];

    $scope.change = function(){

    }

}]);

function getSets($q){

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
};

var Set = function(title, objectId){
    this.title = title;
    this.objectId = objectId;
};

var Card = function(term, definition){
    this.term = term;
    this.definition = definition;
}

function compare(a,b) {
    return a.title.replace(/ /g, '').localeCompare(b.title.replace(/ /g, ''));
}

function getCards($q, sets){

    var cardsDFD = $q.defer();
    var cardsArr = [];
    var CardsObject = Parse.Object.extend("Cards");
    var query = new Parse.Query(CardsObject);

    for(ss in sets){
        query.equalTo("setsID", {
            __type: "Pointer",
            className: "Sets",
            objectId: sets[ss].objectId});
    }

    query.find({
        success: function (results) {

            for (var i in results) {
                var aCard = new Card(results[i].get("term"), results[i].get("definition"));
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