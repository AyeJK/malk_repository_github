document.addEventListener("DOMContentLoaded", async function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedInUserId;
    var splideInstance;  // Declare a variable to hold the Splide instance

    if (memberElement) {
        loggedInUserId = memberElement.textContent.trim();
        if (!loggedInUserId) {
            console.log("No logged in user ID found, script stopping.");
            document.getElementById('login-signup-tip').style.display = 'block'; // Show login-signup-tip
            ['following-group', 'following-group-discover'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });
            return;
        }
        console.log("Logged in user ID:", loggedInUserId);
        document.getElementById('login-signup-tip').style.display = 'none'; // Hide login-signup-tip
    } else {
        console.log("No member element found, script stopping.");
        document.getElementById('login-signup-tip').style.display = 'block'; // Show login-signup-tip
        ['following-group', 'following-group-discover'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
        return;
    }

    const netlifyFunctionUrl = `https://chocomalk.netlify.app/.netlify/functions/getFollowing`;
    let followingUserIds = new Set();

    try {
        const response = await fetch(`${netlifyFunctionUrl}?userId=${loggedInUserId}`);
        const data = await response.json();
        followingUserIds = new Set(data);
        window.followingUserIds = followingUserIds; 
        console.log("Following user IDs fetched and set:", data);

        const startFollowingElement = document.getElementById('start-following');
        if (followingUserIds.size === 0) {
            document.getElementById('following-link').style.display = 'none';
            ['following-group', 'following-group-discover'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none';
                }
            });
            console.log("No users are followed. Hiding 'following-link', 'following-group' and 'following-group-discover'.");

            // Show 'start-following' element if no users are followed
            if (startFollowingElement) {
                startFollowingElement.style.display = 'block';
                console.log("'start-following' element displayed.");
            }
        } else {
            // Hide 'start-following' element if there are followed users
            if (startFollowingElement) {
                startFollowingElement.style.display = 'none';
                console.log("'start-following' element hidden.");
            }
        }

    } catch (error) {
        console.error("Error fetching follow status:", error);
        return;
    }

    function filterPosts() {
        document.querySelectorAll('.followed-list-item').forEach(item => {
            const userId = item.getAttribute('data-user-id');
            if (!followingUserIds.has(userId)) {
                item.style.display = 'none';
            }
        });
        console.log("Posts filtered based on follow status.");

        // Reinitialize Splide
        if (splideInstance) {
            splideInstance.destroy(true);  // Destroy the existing instance
        }

        splideInstance = new Splide('#following-slider', {
            autoWidth: true,
            perMove: 3,
            gap: 10,
            rewind: true,
            pagination: false,
            arrows: true,
            breakpoints: {
                991: {},
                767: { arrows: false },
                478: {}
            }
        }).mount();
    }

    filterPosts();
    await updateAllButtons();

    const container = document.querySelector('#following-feed');
    const observer = new MutationObserver(async (mutations) => {
        let addedNodes = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addedNodes = true;
            }
        });
        if (addedNodes) {
            console.log("New nodes added to the DOM.");
            filterPosts(); 
            await updateAllButtons(); 
            console.log("Updated buttons for new posts.");
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(container, config);
});