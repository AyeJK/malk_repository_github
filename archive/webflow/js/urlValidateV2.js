document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wf-form-signup');
    form.addEventListener('submit', function(event) {
        const urlInput = document.getElementById('social');
        // This pattern matches URLs beginning with http:// or https://, allows any domain name with any TLD
        const urlPattern = /^https?:\/\/www\.[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/;
        // Check if the field is not empty and then validate the URL format
        if (urlInput.value !== "" && !urlPattern.test(urlInput.value)) {
            event.preventDefault(); // Stop the form from submitting
            alert('Please enter a valid URL. For example, http://www.example.com');
        }
    });
});