document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
    } else {
        return;
    }

    window.fetchUserData = async (userId, fieldName) => {
        const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/checkFollowStatus`;
        try {
            const response = await fetch(`${netlifyFunctionUrl}?userId=${userId}&fieldName=${fieldName}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${fieldName}:`, error);
            throw error;
        }
    };

    window.updateButtons = (data, buttonClass, otherButtonClass) => {
        document.querySelectorAll(buttonClass).forEach(button => {
            const itemId = button.getAttribute("data-item-id");
            if (data.includes(itemId)) {
                button.style.display = "none";
                const otherButton = button.parentElement.querySelector(otherButtonClass);
                if (otherButton) {
                    otherButton.style.display = "block";
                }
            }
        });
    };

    window.updateProfileFollowButton = async () => {
        const profileUserId = document.getElementById('profile-follow-button').getAttribute('data-profile-user-id');
        if (!loggedInUserId || !profileUserId) {
            console.error('Missing data for profile follow button update.');
            return;
        }
        // This assumes `window.followingUserIds` is populated elsewhere, such as in the "Followers List" section
        const isFollowing = window.followingUserIds && window.followingUserIds.has(profileUserId);
        if (isFollowing) {
            document.getElementById('profile-follow-button').style.display = 'none';
            document.getElementById('profile-unfollow-button').style.display = 'block';
        } else {
            document.getElementById('profile-follow-button').style.display = 'block';
            document.getElementById('profile-unfollow-button').style.display = 'none';
        }
    };

    window.updateAllButtons = async () => {
        try {
            const likesData = await fetchUserData(loggedInUserId, "User Likes");
            const followersData = await fetchUserData(loggedInUserId, "Followers");
            updateButtons(likesData, ".like-button", ".unlike-button");
            updateButtons(followersData, ".follow-button", ".unfollow-button");
            await updateProfileFollowButton(); // Now correctly updates profile follow/unfollow buttons
        } catch (error) {
            console.error('Error in updateAllButtons:', error);
        }
    };

    updateAllButtons();
});