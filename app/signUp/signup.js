
myApp.controller('signupController', ['$scope', '$q', function($scope, $q) {

    if ( Parse.User.current() ) {
        Parse.User.logOut();
        // check if really logged out
        if (Parse.User.current())
            alert("Failed to log out!");
    }
    $scope.username = '';
    $scope.password = '';
    $scope.email = '';

    $scope.submit = function(){
        createUserToParse($scope.username.toLowerCase(), $scope.password, $scope.email.toLowerCase());
    }
}]);

function createUserToParse(username, password, email){
    var user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    user.set("email", email);

    user.signUp(null, {
        success: function (user) {
            // Hooray! Let them use the app now.
            location.href='../newSet/newSet.html';
        },
        error: function (user, error) {
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
        }
    });


}