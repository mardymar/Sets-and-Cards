/**
 * Created by Marc on 11/14/2015.
 */
myApp.controller('loginController', ['$scope', '$q', function($scope, $q) {

    $scope.username = '';
    $scope.password = '';

    $scope.submit = function(){
        submitToParse($scope.username, $scope.password);
    }
}]);

function submitToParse(username, password) {
    Parse.User.logIn(username.toLowerCase(), password, {
        // If the username and password matches
        success: function (user) {
            Parse.User.logIn();
            location.href='app/welcome/welcome.html';
        },
        // If there is an error
        error: function (user, error) {
            alert(error.message);
        }
    });
}