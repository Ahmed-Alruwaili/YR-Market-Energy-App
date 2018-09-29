
  $(document).ready(function(){
    window.locationData = [];

    $.get("https://yrenergymarket.firebaseapp.com/stateslist", function(response){
      //response = response.data;
      //console.log(response);
      
      $.each(response, function(i, v){
        var valFormat = {};
        valFormat["key"] = i + "-" + v.ActualValue;
        valFormat["value"] = v.Name;
        valFormat["coordinates"] = v.Coordinates;
        locationData.push(valFormat);
      });
      locationData.sort(function (a, b) {
          return a.value.localeCompare(b.value);
      });
      
      $('#search-location').append($('<option>', {value:"", text:'Select'}));      
      //console.log(locationData);
      $.each(locationData, function(i, v){
        ///console.log("hello");
        $('#search-location').append($('<option>', { 
            value: v.key,
            text : v.value 
        }).attr("location-data", "" + v.coordinates + ""));
      });
    });

    

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

    $("#search-location").on("change", function(e){
      e.preventDefault();
      if($("#search-location option:selected").val() == ""){
        alert("Please select a valid location");
        $("#search-location").focus();
        return;
      }else if($('.search-date').val() == ""){ 
        alert("Please select a day");
        $(".search-date").focus();
        return;
      }

      var date = $(".search-date").val().split("/");
      var month = date[0];
      var day = date[1];
      var year = date[2];
      var dateFormat = year + "-" + month + "-" + day;
      var selectedVal = [];

      var weatherDataVal = [];
      var locationName = $("#search-location option:selected").val().split("-")[1] + ",AU";
      var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a';

      $.get(url, function(res){
        weatherDataVal.push(res);
        console.log(res);
      }).then(function (x){
          $.ajax({
            url: 'https://yrenergymarket.firebaseapp.com/weather',
            method: 'POST',
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // send as JSON
            data: {id: $("#search-location option:selected").val(), value: $("#search-location option:selected").text(), weatherData: JSON.stringify(weatherDataVal)},
            success: function(response){
              console.log(response);
              response = JSON.parse(response[0].Data);
              console.log(response);
              var latlong = response.city.coord.lat + ", " + response.city.coord.lon;
              $.each(response.list, function(i, v){
                var resDate = v.dt_txt.split(" ");
                if(resDate[0] == dateFormat){
                  var valFormat = {};
                  // valFormat["MaximumTemperature"] = v.main.temp_max + "°C";
                  // valFormat["MinimumTemperature"] = v.main.temp_min + "°C";
                  valFormat["Temperature"] = v.main.temp + "°C";
                  valFormat["Time"] = resDate[1];
                  valFormat["Suburb"] = response.city.name;
                  valFormat["Population"] = response.city.population;
                  selectedVal.push(valFormat);
                }
              });
              //console.log(latlong)
              myMap(latlong);

              google.maps.event.trigger(map, 'resize');
              $(".json-data").html(JSON.stringify(selectedVal));
            }
          });
        });
      });

    $('.search-date').datepicker({ dateFormat: 'yy-mm-dd' }).on('changeDate', function (ev) {
      if($("#search-location option:selected").val() == ""){
        alert("Please select the location");
        $("#search-location").focus();
        return;
      }
      var date = $(this).val().split("/");
      var month = date[0];
      var day = date[1];
      var year = date[2];
      var dateFormat = year + "-" + month + "-" + day;
      var selectedVal = [];

      var weatherDataVal = [];
      var locationName = $("#search-location option:selected").val().split("-")[1] + ",AU";
      var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a';

      console.log(url);
      $.get(url, function(res){
        weatherDataVal.push(res);
        console.log(res);
      }).then(function (x){
          $.ajax({
            url: 'https://yrenergymarket.firebaseapp.com/weather',
            method: 'POST',
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // send as JSON
            data: {id: $("#search-location option:selected").val(), value: $("#search-location option:selected").text(), weatherData: JSON.stringify(weatherDataVal)},
            success: function(response){
              console.log(response);
              response = JSON.parse(response[0].Data);
              console.log(response);
              var latlong = response.city.coord.lat + ", " + response.city.coord.lon;
              $.each(response.list, function(i, v){
                var resDate = v.dt_txt.split(" ");
                if(resDate[0] == dateFormat){
                  var valFormat = {};
                  // valFormat["MaximumTemperature"] = v.main.temp_max + "°C";
                  // valFormat["MinimumTemperature"] = v.main.temp_min + "°C";
                  valFormat["Temperature"] = v.main.temp + "°C";
                  valFormat["Time"] = resDate[1];
                  valFormat["Suburb"] = response.city.name;
                  valFormat["Population"] = response.city.population;
                  selectedVal.push(valFormat);
                }
              });
              //console.log(latlong)
              myMap(latlong);

              google.maps.event.trigger(map, 'resize');
              $(".json-data").html(JSON.stringify(selectedVal));
            }
          });
        });
      });
      
  });

  function searchBar(){
    $(".search-date").datepicker({ 
      autoclose: true, 
      todayHighlight: true,
      startDate: '0d',
      endDate: '+3d'
    }).datepicker({ dateFormat: 'yy-mm-dd' });
  }


function myMap(latLong) {
  var mapProp= {
      center:new google.maps.LatLng(-37.8218, 145.1523),
      zoom:15,
  };
  window.map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}
