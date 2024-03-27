document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
    } else {
        return;
    }

    try {
        const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/getFollowing`;
        const response = await fetch(`${netlifyFunctionUrl}?userId=${loggedInUserId}`);
        const data = await response.json();

        // Check if the logged-in user is not following anyone
        if (data.length === 0) {
            // Correctly target elements with both classes applied
            document.querySelectorAll('.nav-menu-group.following').forEach(el => {
                el.style.display = 'none';
            });
            return; // Return early as no further processing is needed
        }

        window.followingUserIds = new Set(data); // Convert this list to a Set for efficient lookup

        const collectionItems = document.querySelectorAll('.followed-list-item');

        collectionItems.forEach(item => {
            const userId = item.getAttribute('data-user-id');

            if (!window.followingUserIds.has(userId)) {
                item.style.display = 'none'; // Hide items not being followed by the logged-in user
            }
        });
    } catch (error) {
        console.error("Error filtering collection items based on follow status:", error);
    }
});