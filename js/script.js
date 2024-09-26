$(document).ready(function(){
  $('.photogallery__slider').slick({
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    autoplay: true,
    autoplaySpeed: 1200,
    arrows: false,
  });
  
  $('.carousel__inner').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    // prevArrow: <button type="button" class="slick-prev">Previous</button>,
    // nextArrow: <button type="button" class="slick-next">Next</button>
  });

  $('ul.calendar__tabs').on('click', 'li:not(.calendar__tab_active)', function(){
    $(this)
    .addClass('calendar__tab_active').siblings().removeClass('calendar__tab_active')
    .closest('div.container').find('div.calendar__content').removeClass('calendar__content_active').eq($(this).index()).addClass('calendar__content_active');
  })
});