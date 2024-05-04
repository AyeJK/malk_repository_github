document.addEventListener("DOMContentLoaded", function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    var loggedOutNav = document.querySelector('[data-nav="logged-out"]'); // Select using the custom attribute

    if (!memberElement || !memberElement.textContent) {
        console.log('No logged in user ID found.');
        loggedOutNav.style.display = 'flex'; // Make 'nav-logged-out' visible
    }
});