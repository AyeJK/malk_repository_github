document.addEventListener("DOMContentLoaded", function() {
    var memberElement = document.querySelector('[data-ms-member="id"]');
    console.log(memberElement ? 'Logged in Member ID: ' + memberElement.textContent : 'No logged in user ID found.');
});
