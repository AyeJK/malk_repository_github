<script>
document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
        console.log("Logged-in user ID:", loggedInUserId); // Log the logged-in user ID
    } else {
        console.log("No logged-in user detected.");
        return;
    }

    try {
        const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/getFollowing`;
        console.log("Fetching data from:", netlifyFunctionUrl); // Log the URL being called
        const response = await fetch(`${netlifyFunctionUrl}?userId=${loggedInUserId}`);
        const data = await response.json();
        console.log("Data received from function:", data); // Log the data received from the Netlify function

        // Assuming the function returns a list of 'MS User IDs' the logged-in user is following
        const followingUserIds = new Set(data); // Convert this list to a Set for efficient lookup
        console.log("Following User IDs:", Array.from(followingUserIds)); // Log the IDs being followed

        // Filter the collection items on the page based on the fetched following list
        const collectionItems = document.querySelectorAll('.Followed-Users-List');
        console.log(`Found ${collectionItems.length} collection items.`); // Log the number of items found

        collectionItems.forEach(item => {
            const userId = item.getAttribute('data-user-id');
            if (!followingUserIds.has(userId)) {
                console.log(`Hiding item for user ID: ${userId}`); // Log each item being hidden
                item.style.display = 'none'; // Hide items not being followed by the logged-in user
            } else {
                console.log(`Displaying item for user ID: ${userId}`); // Log each item being displayed
            }
        });
    } catch (error) {
        console.error("Error filtering collection items based on follow status:", error);
    }
});
</script>
