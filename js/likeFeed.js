document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
        if (!loggedInUserId) {
            console.log("No logged in user ID found, script stopping.");
            return;
        }
        console.log("Logged in user ID:", loggedInUserId); // Log user ID
    } else {
        console.log("No member element found, script stopping.");
        return;
    }

    const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/getLikes`;
    let likedPostIds = new Set();

    // Fetch the liked post IDs initially
    try {
        const response = await fetch(`${netlifyFunctionUrl}?userId=${loggedInUserId}`);
        const data = await response.json();
        likedPostIds = new Set(data);
        window.likedPostIds = likedPostIds; // Ensure this is available globally for button update logic
        console.log("Liked post IDs fetched and set:", data); // Log fetched data

        // Hide 'liked-link' and 'liked-group' if no posts are liked
        if (likedPostIds.size === 0) {
            console.log("No posts are liked.");
        }

    } catch (error) {
        console.error("Error fetching liked posts:", error);
        return;
    }

    // Function to filter posts
    function filterPosts() {
        document.querySelectorAll('.liked-list-item').forEach(item => {
            const postId = item.getAttribute('data-post-id');
            if (!likedPostIds.has(postId)) {
                item.style.display = 'none';
            }
        });
        console.log("Posts filtered based on liked status.");
    }

    // Initial filtering and button updating
    filterPosts();
    await updateAllButtons(); // Assuming this function is defined elsewhere as it maintains the button states

    // Setup a MutationObserver to monitor changes in the container of the posts
    const container = document.querySelector('#like-feed'); // Adjust selector to your specific setup
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
