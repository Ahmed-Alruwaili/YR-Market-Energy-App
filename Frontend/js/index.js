
  $(document).ready(function(){
    window.locationData = [];

    $.get("https://yrenergymarket.firebaseapp.com/stateslist", function(response){
      
      $.each(response, function(i, v){
        var valFormat = {};
        valFormat["key"] = i + "-" + v.ActualValue;
        valFormat["value"] = v.Name;
        valFormat["coordinates"] = v.Coordinates;
        valFormat["population"] = v.Population;
        locationData.push(valFormat);
      });
      locationData.sort(function (a, b) {
          return a.value.localeCompare(b.value);
      });
      
      $('#search-location').append($('<option>', {value:"", text:'Select'}));  

      $.each(locationData, function(i, v){
        $('#search-location').append($('<option>', { 
            value: v.key,
            text : v.value 
        }).attr("location-data", "" + v.coordinates + "").attr("population-data", "" + v.population + ""));
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

    $("#search-btn").on("click", function(e){
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
      var time = date[2].split("-");
      var year = $.trim(time[0]);
      time = $.trim(time[1]);
      var dateFormat = year + "-" + month + "-" + day;
      var selectedVal = [];
      var selectedStateId = $("#search-location option:selected").val();
      var selectedState = $("#search-location option:selected").text();
      var populationData = $("#search-location option:selected").attr("population-data");

      var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      var dateFormatforDay = month + "/" + day + "/" + year;
      var a = new Date(dateFormatforDay);
      var dayName = weekday[a.getDay()];

      var weatherDataVal = [];
      var locationName = $("#search-location option:selected").val().split("-")[1] + ",AU";
      var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + locationName + '&cnt=100&units=metric&APPID=908f958d6609dd37ee33114a87b81e1a';

      $.get(url, function(res){
        weatherDataVal.push(res);
        $.each(weatherDataVal[0].list, function(i, v){
          var resDate = v.dt_txt.split(" ");

          var timeVal = parseInt(resDate[1].split(":")[0]) * 100;
          var futuretimeVal = timeVal + 300;
          
          if(timeVal <= parseInt(time) && parseInt(time) <= futuretimeVal){
            if(resDate[0] == dateFormat){
              var valFormat = {};
              // valFormat["MaximumTemperature"] = v.main.temp_max + "°C";
              // valFormat["MinimumTemperature"] = v.main.temp_min + "°C";
              valFormat["Temperature"] = v.main.temp;
              valFormat["Time"] = time;
              valFormat["Population"] = $("#search-location option:selected").attr("population-data");
              valFormat["Day"] = dayName;
              selectedVal.push(valFormat);
            }
          }
        });
        //console.log(selectedVal[0].Population);
      }).then(function (x){
        $.ajax({
          url: 'https://yrenergymarket.firebaseapp.com/weather',
          method: 'POST',
          contentType: "application/x-www-form-urlencoded; charset=UTF-8", // send as JSON
          data: {id: selectedStateId, value: selectedState, weatherData: JSON.stringify(weatherDataVal), population: selectedVal[0].Population, weather: selectedVal[0].Temperature, time: selectedVal[0].Time, day: selectedVal[0].Day},
          success: function(response){
            //console.log(response);
            var color = "red";
            var description = "Low";
            if(response.success){

              if(response.value < 1.9){
                color = "red";
                description = "Low";
              } else if(response.value <= 2.7){
                color = "yellow";
                description = "Medium";
              }else if(response.value >= 2.8){
                color = "green";
                description = "High";
              }

              if(selectedState == "Victoria"){
                window.simplemaps_australiamap_mapdata.state_specific.VI.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "New South Wales"){
                window.simplemaps_australiamap_mapdata.state_specific.NS.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";
                
                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "Northern Territory"){
                window.simplemaps_australiamap_mapdata.state_specific.NT.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "Queensland"){
                window.simplemaps_australiamap_mapdata.state_specific.QL.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";
                
                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "South Australia"){
                window.simplemaps_australiamap_mapdata.state_specific.SA.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";
                
                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "Tasmania"){
                window.simplemaps_australiamap_mapdata.state_specific.TS.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";
                
                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.WA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = "default";
              } else if(selectedState == "Western Australia"){
                window.simplemaps_australiamap_mapdata.state_specific.WA.color = color;
                window.simplemaps_australiamap_mapdata.state_specific.WA.description = description;

                window.simplemaps_australiamap_mapdata.state_specific.VI.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.VI.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NT.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NT.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.NS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.NS.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.QL.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.QL.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.SA.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.SA.description = "default";

                window.simplemaps_australiamap_mapdata.state_specific.TS.color = "default";
                window.simplemaps_australiamap_mapdata.state_specific.TS.description = "default";
              }
              
              simplemaps_australiamap.load();

              processChart(weatherDataVal, dateFormat, populationData, selectedStateId, selectedState, dayName);
            }
          }
        });
      });
    });      
  });

  function processChart(weatherDataVal, dateFormat, populationData, selectedStateId, selectedState, dayName){
    
    var chartData = [];
    console.log(weatherDataVal);
    $.each(weatherDataVal[0].list, function(i, v){
      var resDate = v.dt_txt.split(" ");
      var selectedVal = [];

      var timeVal = parseInt(resDate[1].split(":")[0]) * 100;
      var futuretimeVal = timeVal + 300;
      // console.log(resDate[0]);

      if(resDate[0] == dateFormat){
        // console.log(v.main.temp);
        var valFormat = {};
        valFormat["Temperature"] = v.main.temp;
        valFormat["Time"] = timeVal;
        valFormat["Population"] = populationData;
        valFormat["Day"] = dayName;
        selectedVal.push(valFormat);

        console.log(selectedVal);

        $.ajax({
          url: 'https://yrenergymarket.firebaseapp.com/weather',
          method: 'POST',
          async: false,
          contentType: "application/x-www-form-urlencoded; charset=UTF-8", // send as JSON
          data: {id: selectedStateId, value: selectedState, weatherData: JSON.stringify(weatherDataVal), population: selectedVal[0].Population, weather: selectedVal[0].Temperature, time: selectedVal[0].Time, day: selectedVal[0].Day},
          success: function(response){
            //console.log(response);
            var color = "red";
            var description = "Low";
            if(response.success){
              if(timeVal == 0){
                chartData.push({label: "0:00 - 3:00", y: parseFloat(response.value)});
              }else if(timeVal == 300){
                chartData.push({label: "3:00 - 6:00", y: parseFloat(response.value)});
              }else if(timeVal == 600){
                chartData.push({label: "6:00 - 9:00", y: parseFloat(response.value)});
              }else if(timeVal == 900){
                chartData.push({label: "9:00 - 12:00", y: parseFloat(response.value)});
              }else if(timeVal == 1200){
                chartData.push({label: "12:00 - 15:00", y: parseFloat(response.value)});
              }else if(timeVal == 1500){
                chartData.push({label: "15:00 - 18:00", y: parseFloat(response.value)});
              }else if(timeVal == 1800){
                chartData.push({label: "18:00 - 21:00", y: parseFloat(response.value)});
              }else if(timeVal == 2100){
                chartData.push({label: "21:00 - 24:00", y: parseFloat(response.value)});
              }
            }
          }
        });

      }

      // console.log(selectedVal);
    });
    console.log(chartData);
    // chartData = [{ label: "0:00 - 3:00", y: 1.2 },
    //             { label: "3:00 - 6:00", y: 1.2 },
    //             { label: "6:00 - 9:00", y: 1.2 },
    //             { label: "9:00 - 12:00", y: 1.2 },
    //             { label: "12:00 - 15:00", y: 1.2 },
    //             { label: "15:00 - 18:00", y: 1.2 },
    //             { label: "18:00 - 21:00", y: 1.2 },
    //             { label: "21:00 - 24:00", y: 1.2 }];
    //             console.log("chart : ", chartData);
    getchart(chartData);
  }

  function getchart(data){
    var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      theme: "light2",
      title:{
        text: "Electricity Usability for the Whole Day"
      },
      axisX:{
        includeZero: false,
        valueFormatString: "DD MMM"
      },
      axisY:{
        includeZero: false
      },
      data: [{        
        type: "line",       
        dataPoints: data
      }]
    });
    chart.render();
  }

  function searchBar(){
    // $(".search-date").datepicker({ 
    //   autoclose: true, 
    //   todayHighlight: true,
    //   startDate: '0d',
    //   endDate: '+3d'
    // }).datepicker({ dateFormat: 'yy-mm-dd' });

    $(".search-date").datetimepicker({
      //language:  'fr',
      weekStart: 1,
      format: "mm/dd/yyyy - hhii",
      autoclose: true,
      todayBtn: true,
      todayBtn:  1,
      autoclose: 1,
      todayHighlight: 1,
      startDate: '+1d',
      endDate: '+4d',
      startView: 2,
      forceParse: 0,
      showMeridian: 1
    });
  }


function myMap(latLong) {
  // var mapProp= {
  //     center:new google.maps.LatLng(-37.8218, 145.1523),
  //     zoom:15,
  // };
  // window.map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}
