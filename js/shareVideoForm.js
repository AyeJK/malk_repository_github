document.addEventListener("DOMContentLoaded", function() {
  var wfForm = document.getElementById('share-video');

  wfForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    var formData = new FormData(wfForm);

    
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });
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