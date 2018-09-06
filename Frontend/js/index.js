
  $(document).ready(function(){

      $('.js-scroll-trigger').click(function () {
        var id = $(this).attr("href");
        //console.log();
        var totalheight = ($(window).height() - $(id).height()) *5;
        //console.log(totalheight);
        $('html, body').animate({scrollTop : $(id).offset().top},800);
        return false;
      });

      $(".navbar-toggler").on("click", function(){
        $("#navbarResponsive").toggle();
      });

      searchBar();

      $("#calendar-btn").on("click", function(e){
        e.preventDefault();
        
        $(".search-date").focus();
      });

      $('.search-date').datepicker({ dateFormat: 'yy-mm-dd' }).on('changeDate', function (ev) {
        var date = $(this).val().split("/");
        var month = date[0];
        var day = date[1];
        var year = date[2];
        var dateFormat = year + "-" + month + "-" + day;
        var selectedVal = [];
        $.get("http://localhost:3000/weather/getData", function(response){
          response = JSON.parse(response[0].Data);
          //console.log(response);
          $.each(response.list, function(i, v){
            var resDate = v.dt_txt.split(" ");
            if(resDate[0] == dateFormat){
              var valFormat = {};
              valFormat["MaximumTemperature"] = v.main.temp_max + "°C";
              valFormat["MinimumTemperature"] = v.main.temp_min + "°C";
              valFormat["Temperature"] = v.main.temp + "°C";
              valFormat["Time"] = resDate[1];
              selectedVal.push(valFormat);
            }
          });
          //console.log(selectedVal)
          $(".json-data").html(JSON.stringify(selectedVal));
        });
      });
      
  });

  function searchBar(){
    $(".search-date").datepicker({ 
      autoclose: true, 
      todayHighlight: true,
      startDate: '+1d',
      endDate: '+4d'
    }).datepicker({ dateFormat: 'yy-mm-dd' });
  }
