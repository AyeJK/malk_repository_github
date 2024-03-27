document.addEventListener("DOMContentLoaded", function() {
  var wfForm = document.getElementById('share-video');

  wfForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    var formData = new FormData(wfForm);
    
    var object = {};
    formData.forEach(function(value, key){
        if (key === 'Video Tags') {
            // If the current key is 'Video Tags', we skip it because we'll handle it separately
            return;
        }
        object[key] = value;
    });
    
    // Handle 'Video Tags' separately to ensure it's sent as an array
    // Note: This assumes 'Video Tags' is the correct name attribute for your form field
    var tags = formData.getAll('Video Tags'); // This gets all values for 'Video Tags' as an array
    if (tags.length > 0) {
        object['Video Tags'] = tags; // Add this array to the object
    } else {
        // If no tags are selected, you could choose to omit the property or add it as an empty array
        // Uncomment the next line if you want to include it as an empty array
        // object['Video Tags'] = [];
    }

    var json = JSON.stringify(object);

    fetch('https://hook.us1.make.com/5vracq62nan6kgtmb2nlrs76mchcanmv', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
    })
    .then(response => {
      if (response.ok) {
        wfForm.querySelector('.w-form-done').style.display = 'block';
      } else {
        wfForm.querySelector('.w-form-fail').style.display = 'block';
      }
    })
    .catch(error => console.error('Error:', error));
  });
});
