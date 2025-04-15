document.addEventListener("DOMContentLoaded", function() {
  var wfForm = document.getElementById('feedback-form');

  wfForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    var formData = new FormData(wfForm);

    
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });
    var json = JSON.stringify(object);


    fetch('https://hook.us1.make.com/jtvr83n1az9ngcbat5or1s3amwo2o9iy', { 
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
