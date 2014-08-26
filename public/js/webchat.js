/**
 * Global VARS
 * @type {*}
 */

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

var username = 'Anonymous';

var sockRageWebchat = new SockRage("http://localhost:3000", "webchatmessages");

/**
 * Display a message on the WebChat
 * @param username
 * @param datetime
 * @param message
 */
function displayMessage(username, datetime, message) {

    $("#webchat-messages").append('<li class="default alert"><strong>' + username + "</strong> (" + getRelativeFromNow(datetime) + ")<br>" + message + '</li>');
}

/**
 * Scroll down the webchat window
 */
function scrollDown() {

    var objDiv = document.getElementById("webchat-messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}

/**
 * Get relative date from message date using moment.js
 * @param date
 * @returns {*}
 */
function getRelativeFromNow(date) {

    return moment.utc(date).fromNow();
}

/**
 * Listening on messages
 */
sockRageWebchat.on("getAll", function(data) {

    for (var i = data.length - 1; i >= 0; i--) {

        var message = data[i];

        displayMessage(message.username, message.datetime, message.message);
        scrollDown();
    }

});

/**
 * Listening on new message
 */
sockRageWebchat.on("create", function(data) {

    displayMessage(data.username, data.datetime, data.message);
    scrollDown();

});


$(document).ready(function() {

    /**
     * Choose username prompt
     */
    smoke.prompt('what\'s my name?',function(e){
        if (e){
            username = e;
            toastr.success("You're logged in as " + username);
        }
        else {
            toastr.info("You're logged in as " + username);
        }

        /**
         * Signal the system that someone logged in
         */
        sockRageWebchat.set({
            datetime : new Date(Date.now()),
            username : "SYSTEM",
            message : "<span style='color:orangered'>" + username + " Just joined the game...</span>"
        });

        $("#username-place").html('Connected as <strong>' + username + '</strong>');

    });

    /**
     * List every messages
     */
    sockRageWebchat.list();

    /**
     * Send message on push enter
     */
    $(document).keypress(function(e) {
        if(e.which == 13) {
            $("#message-input-confirm").click();
        }
    });

    /**
     * Send message event
     */
    $("#message-input-confirm").click(function() {

        if ($("#message-input-msg").val().length > 0) {

            sockRageWebchat.set({
                datetime : new Date(Date.now()),
                username : htmlentities(username),
                message : htmlentities($("#message-input-msg").val())
            });

        }

        $("#message-input-msg").val("");

        return false;

    });

});

function htmlentities(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}