
  $(document).ready(function(){

      $('.js-scroll-trigger').click(function () {
        var id = $(this).attr("href");
        console.log();
        var totalheight = ($(window).height() - $(id).height()) *5;
        console.log(totalheight);
        $('html, body').animate({scrollTop : $(id).offset().top},800);
        return false;
      });

      $(".navbar-toggler").on("click", function(){
        $("#navbarResponsive").toggle();
      });
  });
