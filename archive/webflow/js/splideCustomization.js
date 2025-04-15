document.addEventListener('DOMContentLoaded', function() {
  var elms = document.getElementsByClassName('splide');

  for (var i = 0; i < elms.length; i++) {
    new Splide(elms[i], {
      autoWidth: true,
      perMove: 3,
      gap: 10,
      rewind: true,
      pagination: false,
      arrows: true,  // Ensure arrows are enabled
      prevArrow: elms[i].querySelector('.splide__arrow--prev'),
      nextArrow: elms[i].querySelector('.splide__arrow--next'),
      breakpoints: {
        991: {
          // Tablet options can be added here
        },
        767: {
          // Mobile Landscape
          arrows: false  // Hides arrows on smaller screens
        },
        478: {
          // Mobile Portrait
          // Additional options can be added here
        }
      }
    }).mount();  // Mount each instance
  }
});