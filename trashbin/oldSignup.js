$(function () {

    $('.form-signup').on('submit', function (e) {

        e.preventDefault();

        if ( Parse.User.current() ) {
            Parse.User.logOut();
            // check if really logged out
            if (Parse.User.current())
                alert("Failed to log out!");
        }
        // Get data from the form and put them into variables
        var data = $(this).serializeArray(),
            username = data[0].value.toLowerCase(),
            password = data[1].value;
            email = data[2].value;

        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function (user) {
                // Hooray! Let them use the app now.
                location.href='oldWelcome.html';
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        });

    });
});