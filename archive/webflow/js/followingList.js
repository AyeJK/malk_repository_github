document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
        console.log("Logged in user ID:", loggedInUserId); // Log user ID
    } else {
        console.log("No user ID found, script stopping.");
        return;
    }

    const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/getFollowing`;
    let followingUserIds = new Set();

    // Fetch the following user IDs initially
    try {
        const response = await fetch(`${netlifyFunctionUrl}?userId=${loggedInUserId}`);
        const data = await response.json();
        followingUserIds = new Set(data);
        window.followingUserIds = followingUserIds; // Ensure this is available globally for button update logic
        console.log("Following user IDs fetched and set:", data); // Log fetched data

        // Hide 'following-link' and 'following-group' if no users are followed
        if (followingUserIds.size === 0) {
            document.getElementById('following-link').style.display = 'none';
            document.getElementById('following-group').style.display = 'none';
            console.log("No users are followed. Hiding 'following-link' and 'following-group'.");
        }

    } catch (error) {
        console.error("Error fetching follow status:", error);
        return;
    }

    // Function to filter posts
    function filterPosts() {
        document.querySelectorAll('.followed-list-item').forEach(item => {
            const userId = item.getAttribute('data-user-id');
            if (!followingUserIds.has(userId)) {
                item.style.display = 'none';
            }
        });
        console.log("Posts filtered based on follow status.");
    }

    // Initial filtering and button updating
    filterPosts();
    await updateAllButtons(); // Assuming this function is defined as it maintains the button states

    // Setup a MutationObserver to monitor changes in the container of the posts
    const container = document.querySelector('#following-feed'); // Adjust selector to your specific setup
    const observer = new MutationObserver(async (mutations) => {
        let addedNodes = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addedNodes = true;
            }
        });
        if (addedNodes) {
            console.log("New nodes added to the DOM.");
            filterPosts(); // Reapply filter when new nodes are added
            await updateAllButtons(); // Update buttons for new elements
            console.log("Updated buttons for new posts.");
        }
    });

    // Configuration of the observer:
    const config = { childList: true, subtree: true };

    // Pass in the target node, as well as the observer options
    observer.observe(container, config);
});
