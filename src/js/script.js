$(document).ready(function(){
  $('.photogallery__slider').slick({
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    autoplay: true,
    autoplaySpeed: 1200,
    arrows: false,
  });
});

$(document).ready(function(){
  $('.carousel__inner').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
  });
});