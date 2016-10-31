(function() {

  var map;
  var data;
  var circleData;
  var drugData;
  var bugData;
  var circles = [];
  var latlngs = {};
  var drugCircles = [];
  var markers = [];
  var bugMarkers = [];
  var day = 'three';
  var legend = L.control({position: 'bottomleft'});
  var info = L.control();
  var dist800 = 'off';
  var showDrug = false;
  var defaultCirlceParams = {
    size: 500,
    color: '#e851c',
    fillColor: '#E24A31',
    showBig: true,
    opacity: 0.1
  };
  var count = 0;
  var percentage = '003';


  legend.onAdd = onLegnendAdd;
  info.onAdd = onInfoAdd;
  info.update = onInfoUpdate;


  initMap();
  d3.csv('./file/three_003_data.csv', function(data) {
    circleData = data;
    var from = new Date(data[data.length-1].日期);
    var latestDate = new Date();
    latestDate.setDate(from.getDate()+2);

    $('.updateAt').text(latestDate.toLocaleDateString());
    $('.dataUpdateAt').text(from.toLocaleDateString());
    drawCircle(data, defaultCirlceParams);
  });

  d3.csv('./file/seven_data.csv', function(data) {
    markers = initMakers(data, {icon: 'circle'});
    $('.total').text(count);
  });

  d3.csv('./file/drug_seven.csv', function(data) {
    drugData = data;
  });

  d3.csv('./file/bug_8.csv', function(data) {
    bugData = data;
    bugMarkers = initMakers(bugData, {icon: 'bug'});
  });

  d3.json('./file/prev_block_geo.topojson', function(topoData) {
    for (var key in topoData.objects) {
      geojson = topojson.feature(topoData, topoData.objects[key]);
    }
    topoLayer = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  });

 function style(feature) {
    return {
      fillColor: '#009fda',
      weight: 1,
      opacity: 0.5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.4
    };
  }

  function onEachFeature(feature, layer) {
    layer.on({
      click: layerOnClick
    });
    layer.bindPopup('噴藥日期：'+feature.properties.date);
  }

  function layerOnClick(e) {
    $('#street-view').empty();
    var latlng = new google.maps.LatLng(e.latlng.lat, e.latlng.lng);
    var dist = new google.maps.LatLng(e.latlng.lat+0.01, e.latlng.lng+0.01);
    var hyperlapse = new Hyperlapse(document.getElementById('street-view'), {
      lookat: latlng,
      zoom: 1,
      use_lookat: true,
      width: $('#street-view').width(),
      height: $('#street-view').height(),
      elevation: 50
    });
    hyperlapse.onError = function(e) {
      console.log(e);
    };

    hyperlapse.onRouteComplete = function(e) {
        hyperlapse.load();
    };

    hyperlapse.onLoadComplete = function(e) {
        hyperlapse.play();
        setTimeout(function(){ hyperlapse.pause(); }, 3000);
    };
    var directions_service = new google.maps.DirectionsService();

    var route = {
        request:{
            origin: latlng,
            destination: latlng,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }
    };

    directions_service.route(route.request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            hyperlapse.generate( {route:response} );
        } else {
            console.log(status);
        }
    }); 
  }

  function initMap() {
    map = new L.Map('map');

    var url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    var attrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
    var osm = new L.TileLayer(url, {minZoom: 12,  maxZoom: 19, attribution: attrib});
    var googleStreet =  new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    });
    var googleHybrid = new L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
    });



    map.setView(new L.LatLng(23, 120.2), 13);
    googleHybrid.addTo(map);
    googleStreet.addTo(map);
    L.control.layers({
      "地球": googleHybrid,
      "地圖": googleStreet
    }).addTo(map);

    map.on('dblclick', onCircleClick);
    map.on('click', layerOnClick);
    legend.addTo(map);
    info.addTo(map); 
  }

  function drawCircle(data, argvs) {
    latlngs = {};

    data.forEach(function(point) {
      if (latlngs[point.Longitude] && latlngs[point.Longitude][point.Latitude]) {
        return;
      }
      if (argvs.showBig && dist800 == 'on') {
        var bigCircle = L.circle([point.Latitude, point.Longitude], 800, 
          {fillColor: '#DE8552', color: '#CA1F18', opacity: 0.1})
          .addTo(map);
        circles.push(bigCircle);
      }
     
      var circle = L.circle([point.Latitude, point.Longitude], argvs.size,
        {fillColor: argvs.fillColor, color: argvs.color, opacity: argvs.opacity})
        .addTo(map);

      if (argvs.showBig) {
        circles.push(circle);
      }
      else {
        circle.bindPopup("日期：" + point.日期);
        drugCircles.push(circle);
      }
      if (!latlngs[point.Longitude])
        latlngs[point.Longitude] = {};
        latlngs[point.Longitude][point.Latitude] = true;
      });
  }

  function initMakers(data, params) {
    var markers = [];
    data.forEach(function(e) {
      var icon;
      var marker;
      var content = '';

      icon =  L.AwesomeMarkers.icon({prefix: 'fa', icon: params.icon, 
        markerColor: e.color});

      marker = L.marker([e.Latitude, e.Longitude], {icon: icon});

      for (var key in e) {
        content += key + '： ' + e[key] + '<br/>';
      }
      if (e.color == 'red') count += 1;

      marker.bindPopup(content);
      markers.push(marker);
    });
    return markers;
  }

  function onCircleClick(e) {
    var nearPoints = getNearBy(e.latlng);
    addPoints(nearPoints);
  }

  function getNearBy(source) {
    var nearPoints = [];
    markers.forEach(function(marker) {
      if (source.distanceTo(marker.getLatLng()) < 500){
        nearPoints.push(marker);
      }
    });
    return nearPoints;
  }

  function addPoints(points) {
    points.forEach(function(marker) {
      marker.addTo(map);   
    });
  }

  function onInfoAdd(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this._div.innerHTML = '<h4><span>橘紅色</span>區塊表示：這個範圍three天內的登革熱病例數超過整體的百分之三</h4><span>（半徑500公尺）</span>';
    return this._div;
  }
  function onInfoUpdate() {
     if (percentage == '003') { 
       this._div.innerHTML = '<h4><span>橘紅色</span>區塊表示：這個範圍' + day  +
         '天內的登革熱病例數超過整體的百分之三</h4><span>（半徑500公尺）</span>';
     }
     else if (percentage == '0025') { 
       this._div.innerHTML = '<h4><span>橘紅色</span>區塊表示：這個範圍' + day  +
         '天內的登革熱病例數超過整體的百分之二點五</h4><span>（半徑500公尺）</span>';
     }
     else if (percentage == '002') {
       this._div.innerHTML = '<h4><span>橘紅色</span>區塊表示：這個範圍' + day  +
         '天內的登革熱病例數超過整體的百分之二</h4><span>（半徑500公尺）</span>';
     }
    return this._div;
  }

  function onLegnendAdd (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var color = ['#F52305', '#436978', '#6F7F23', '#5A386A'];
      var labels = ['3天內', '7天內', '布氏指數<10', '布氏指數>=10'];

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] + 
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }

  function updateCircle(d, dist) {
    day = d;
    dist800 = dist;
    removeCircles(circles);
    drawCircle(circleData, defaultCirlceParams);
    info.update();
  }

  function removeCircles(_circles) {
    _circles.forEach(function(circle) {
      map.removeLayer(circle);
    }); 
  }

  function toggleDrugCircle () {
    showDrug = !showDrug;
    if (!showDrug)  
      return removeCircles(drugCircles);
    drawCircle(drugData, {
      color: '#028D9B',
      fillColor: '#028D9B',
      size: 50,
      opacity: 0.5,
      showBig: false
    });
  }
  
  $('.checkbox')
    .checkbox({
      onChange: function() {
        var checkboxs = $(this);
        //var checkboxs = $('.checkbox').find('input');
        checkboxs.each(function(i) {
          var value = checkboxs[i].value;
          var name = checkboxs[i].name;
          if (name == 'drug'){
            return toggleDrugCircle();
          }

          if (checkboxs[i].checked) {
            // day
            if (name == 'days') {
              d3.csv('./file/'+ value + '_' + percentage + '_data.csv', function(rp) {
                circleData = rp;
                updateCircle(value, dist800);
              }); 
            }
            else if (name == 'bug') {
              addPoints(bugMarkers);
            }
            // 800 meter
            else {
              updateCircle(day, value); 
            }
          }
          // off
          else if (value == 'on') {
            updateCircle(day, 'off'); 
          } 
          else if (name == 'bug') {
            removeCircles(bugMarkers);
          }
        });
      }
    });

  $('.ui.dropdown')
  .dropdown({
  });

  $('#percentage').change(function() {
    percentage = this.value;   
    d3.csv('./file/'+ day + '_' + percentage + '_data.csv', function(rp) {
      circleData = rp;
      updateCircle(day, dist800);
    });
  });

})();
