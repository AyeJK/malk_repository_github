document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    // Check if memberElement exists, indicating a logged-in user
    if (memberElement && memberElement.textContent) {
        loggedInUserId = memberElement.textContent.trim();  // Get the user ID, confirming it's not just an empty string

        // Define all your functions here
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
            const profileFollowButton = document.getElementById('profile-follow-button');
            const profileUnfollowButton = document.getElementById('profile-unfollow-button');
            const profileFollowButtonMobile = document.getElementById('profile-follow-button-mobile');
            const profileUnfollowButtonMobile = document.getElementById('profile-unfollow-button-mobile');

            const profileUserId = profileFollowButton.getAttribute('data-profile-user-id');
            if (!loggedInUserId || !profileUserId) {
                console.error('Missing data for profile follow button update.');
                return;
            }
            // This assumes `window.followingUserIds` is populated elsewhere, such as in the "Followers List" section
            const isFollowing = window.followingUserIds && window.followingUserIds.has(profileUserId);
            if (isFollowing) {
                profileFollowButton.style.display = 'none';
                profileUnfollowButton.style.display = 'block';
                if (profileFollowButtonMobile) profileFollowButtonMobile.style.display = 'none';
                if (profileUnfollowButtonMobile) profileUnfollowButtonMobile.style.display = 'block';
            } else {
                profileFollowButton.style.display = 'block';
                profileUnfollowButton.style.display = 'none';
                if (profileFollowButtonMobile) profileFollowButtonMobile.style.display = 'block';
                if (profileUnfollowButtonMobile) profileUnfollowButtonMobile.style.display = 'none';
            }
        };

        window.hideElementsForLoggedInUser = () => {
            const elementsToHide = [
                document.getElementById('profile-follow'),
                document.getElementById('profile-follow-mobile'),
                document.getElementById('feed-follow')
            ];

            elementsToHide.forEach(element => {
                if (element && element.getAttribute('data-user-id') === loggedInUserId) {
                    element.style.display = 'none';
                }
            });
        };

        window.updateAllButtons = async () => {
            try {
                const likesData = await fetchUserData(loggedInUserId, "User Likes");
                const followersData = await fetchUserData(loggedInUserId, "Followers");
                updateButtons(likesData, ".like-button", ".unlike-button");
                updateButtons(followersData, ".follow-button", ".unfollow-button");
                await updateProfileFollowButton(); // Now correctly updates profile follow/unfollow buttons
                hideElementsForLoggedInUser(); // Hide elements if they belong to the logged-in user
            } catch (error) {
                console.error('Error in updateAllButtons:', error);
            }
        };

        // Call updateAllButtons to run the updates
        updateAllButtons();
    } else {
        // Optionally handle what happens when no user is logged in
        console.log('No logged in user ID found. Certain features are disabled.');
    }
});