document.addEventListener('DOMContentLoaded', function() {
    function sendToWebhook(url, data) {
        $.post(url, data, function(response) {
            console.log(response);
        });
    }

    function handleButtonClick(buttonClass, webhookURL) {
        $('body').on('click', buttonClass, function() {
            var postID = $(this).data('post-id');
            var userIDElement = document.querySelector('[data-ms-member="id"]');
            var userID = userIDElement ? userIDElement.textContent.trim() : null;

            if (userID && postID) {
                sendToWebhook(webhookURL, { postID: postID, userID: userID });
            }
        });
    }

    function handleFollowButtonClick(buttonClass, webhookURL) {
        $('body').on('click', buttonClass, function() {
            var userIDElement = document.querySelector('[data-ms-member="id"]');
            var userID = userIDElement ? userIDElement.textContent.trim() : null;
            var followUserID = $(this).data('follow-id');

            if (userID && followUserID) {
                sendToWebhook(webhookURL, {
                    userdoingthefollowing: userID,
                    userbeingfollowed: followUserID
                });
            }
        });
    }

    function initializeEventHandlers() {
        handleButtonClick('.like-button', 'https://hooks.airtable.com/workflows/v1/genericWebhook/appaFBiB1nQcgm9Oz/wfluNUaUnSvFg5sFW/wtrNL8qJEnIRI95qJ');
        handleButtonClick('.unlike-button', 'https://hooks.airtable.com/workflows/v1/genericWebhook/appaFBiB1nQcgm9Oz/wflCnkWP8PuX8iBBI/wtrsG9gAxZNIoj97Z');
        handleFollowButtonClick('.follow-button', 'https://hook.us1.make.com/fpoa24jektjxa83h7koxtbyai4l2cxbc');
        handleFollowButtonClick('.unfollow-button', 'https://hook.us1.make.com/6x8fruii1upfp1fwjpp29482e63vmnju');
    }

    initializeEventHandlers();
});

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            console.log("New content detected.");
            updateAllButtons?.();
        }
    });
});

var config = { childList: true, subtree: true };
document.addEventListener("DOMContentLoaded", function() {
    var targetNode = document.getElementById('post-list');
    if (targetNode) {
        observer.observe(targetNode, config);
    } else {
        console.error("Error: Target node for MutationObserver not found.");
    }
});