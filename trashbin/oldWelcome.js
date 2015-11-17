/**
 * Created by mperry on 11/3/2015.
 */
//var currentUser = Parse.User.current();
//alert(currentUser.get("username"));

$(function () {

    $('.form-signin').on('submit', function (e) {

        e.preventDefault();

        var data = $(this).serializeArray(),
            pname = data[0].value,
            score = data[1].value;

        var GameScore = Parse.Object.extend("GameScore");
        var gs = new GameScore();

        gs.set("score", parseInt(score));
        gs.set("playerName", pname);
        gs.set("cheatMode", $("#myCheckbox").is(":checked"));
        gs.set("user", Parse.User.current());

        gs.save(null, {
            success: function (gs) {
                // Execute any logic that should take place after the object is saved.
                alert('New object created with objectId: ' + gs.id);
            },
            error: function (gs, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('Failed to create new object, with error code: ' + error.message);
            }
        });
    });
});
