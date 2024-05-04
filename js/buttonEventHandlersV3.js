document.addEventListener('DOMContentLoaded', function() {
    var userIDElement = document.querySelector('[data-ms-member="id"]');
    var userID = userIDElement ? userIDElement.textContent.trim() : null;

    if (!userID) {
        console.log("No logged in user detected, script stopping.");
        return;
    }

    function sendToWebhook(url, data) {
        $.post(url, data, function(response) {
            console.log(response);
        });
    }

    function handleButtonClick(buttonClass, webhookURL) {
        $('body').on('click', buttonClass, function() {
            var postID = $(this).data('post-id');
            if (userID && postID) {
                sendToWebhook(webhookURL, { postID: postID, userID: userID });
            }
        });
    }

    function handleFollowButtonClick(buttonClass, webhookURL) {
        $('body').on('click', buttonClass, function() {
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
        handleButtonClick('.like-button', 'https://hook.us1.make.com/2bsw5yrq27ue9ow6g7j7xur90hp3tinr');
        handleButtonClick('.unlike-button', 'https://hook.us1.make.com/5dhbs2kuwgbemal6o8ikicbhf35qs07b');
        handleFollowButtonClick('.follow-button', 'https://hook.us1.make.com/fpoa24jektjxa83h7koxtbyai4l2cxbc');
        handleFollowButtonClick('.unfollow-button', 'https://hook.us1.make.com/6x8fruii1upfp1fwjpp29482e63vmnju');
    }

    initializeEventHandlers();

    // MutationObserver to monitor dynamic content changes
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                console.log("New content detected.");
                updateAllButtons?.();
            }
        });
    });

    var config = { childList: true, subtree: true };
    var targetNode = document.getElementById('post-list');
    if (targetNode) {
        observer.observe(targetNode, config);
    } else {
        console.error("Error: Target node for MutationObserver not found.");
    }
});