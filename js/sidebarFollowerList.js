<script>
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

        window.followingUserIds = new Set(data); // Store the followed user IDs globally

        // Hide items not being followed by the logged-in user
        document.querySelectorAll('.followed-list-item').forEach(item => {
            const userId = item.getAttribute('data-user-id');
            if (!window.followingUserIds.has(userId)) {
                item.style.display = 'none';
            }
        });
    } catch (error) {
        console.error("Error filtering collection items based on follow status:", error);
    }
});