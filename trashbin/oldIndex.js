/**
 * Created by mperry on 11/2/2015.
 */
$(function () {

    //Parse.$ = jQuery;
// Replace this line with the one on your Quickstart Guide Page


    $('.form-signin').on('submit', function (e) {

        e.preventDefault();
        // Get data from the form and put them into variables
        var data = $(this).serializeArray(),
            username = data[0].value.toLowerCase(),
            password = data[1].value;

        // Call Parse Login function with those variables
        Parse.User.logIn(username, password, {
            // If the username and password matches
            success: function (user) {
                Parse.User.logIn();
                location.href='../app/newSet/newSet.html';
            },
            // If there is an error
            error: function (user, error) {
                alert(error.message);
            }
        });

    });

    $('.form-signin').on('button', function (e) {


        alert("Not accepting new accounts at this time.");

    });
});