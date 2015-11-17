/**
 * Created by Marc on 11/14/2015.
 */

myApp.controller('newSetController', ['$scope', '$q', function($scope, $q) {

    $scope.title = "";
    $scope.arr = [new Card('',''),new Card('','')];
    $scope.addLine = function(index){
        $scope.arr.push(new Card('',''));
    }
    $scope.removeLine = function(index){
        $scope.arr.splice(index, 1);
    }
    $scope.submit = function(){
        event.preventDefault();
        submitToParse($scope.arr, $scope.title, $q).then(function() {
            location.href="../viewSets/viewSets.html";

        });
    }
}]);

function Card(term, definition){
    this.term = term;
    this.definition = definition;
}

function submitToParse(arr, title, $q){

    var setsDFD = $q.defer();
    var Titles = Parse.Object.extend("Sets");
    var ts = new Titles();
    ts.set("title", title);
    ts.set("userID", Parse.User.current());
    ts.save(null, {
        success: function (ts) {
            // Execute any logic that should take place after the object is saved.
            var Cards = Parse.Object.extend("Cards");
            for(a in arr){
                var cs = new Cards();
                cs.set("term", arr[a].term);
                cs.set("definition", arr[a].definition);
                cs.set('setsID', ts);
                cs.save(null, {
                    success: function (cs) {
                        // Execute any logic that should take place after the object is saved.
                    },
                    error: function (cs, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        alert('2-Failed to create new card, with error code: ' + error.message);
                    }
                });
            }
            setsDFD.resolve();
        },
        error: function (ts, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('1-Failed to create new set, with error code: ' + error.message);
        }
    });

    return setsDFD.promise
        .then(function () {
        })
        .catch(function (error) {
            alert(error.message);
        });
}