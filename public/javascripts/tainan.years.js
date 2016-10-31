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
    size: 10,
    color: 'rgb(222, 50, 24)',
    fillColor: '#E24A31',
    opacity: 0.9,
    all: true
  };
  var count = 0;
  var percentage = '003';

  initMap();

  d3.csv('./file/2010_2014_tainan.csv', function(_data) {
      data = _data;
      drawCircle(data, defaultCirlceParams);
  });



  function initMap() {
    map = new L.Map('map');

    var url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    var attrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
    var osm = new L.TileLayer(url, {minZoom: 12,  maxZoom: 19, attribution: attrib});   

    map.setView(new L.LatLng(22.99, 120.2), 13);
    osm.addTo(map);
    map.on('click', layerOnClick);
  }

  function drawCircle(data, argvs) {
    latlngs = {};

    data.forEach(function(point) {
      if (!point.Latitude) return;
      var circle = L.circle([point.Latitude, point.Longitude], argvs.size,
        {fillColor: argvs.fillColor, color: argvs.color, opacity: argvs.opacity})
        .addTo(map);
        circles.push(circle);
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

  function addPoints(points) {
    points.forEach(function(marker) {
      marker.addTo(map);   
    });
  }

  function onInfoAdd(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this._div.innerHTML = '<h4><span>橘紅色</span>區塊表示：這個範圍超過3人</h4><span>（半徑100公尺）</span>';
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

  function updateCircle(circleData) {
    removeCircles(circles);
    drawCircle(circleData, defaultCirlceParams);
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

  function layerOnClick(e) {
    var data = getNearBy(e.latlng);
    var date_obj = {};
    var barData = [];

    data.forEach(function(d) {
      if (!d.hasOwnProperty(d.發病日期))
        date_obj[d.發病日期] = 0;
      date_obj[d.發病日期] += 1;
    });

    for (var key in date_obj) {
      barData.push({
        date: key,
        value: date_obj[key]
      });
    }

    var svg = $('#bar svg');
    if (svg.length > 0) {
      svg[0].remove();
    }

    new window.BarLineChart('#bar', barData, function(d) {
        return d.date.toLocaleDateString() + '  <strong>病例數：</strong>' +
          '<span style="color:red">' + d.value + '</span>';
      }, {showLine: false});
  }

  function getNearBy(source) {
    var nearPoints = [];
    circles.forEach(function(cirlce) {
      if (source.distanceTo(cirlce.getLatLng()) < 300){
        nearPoints.push(cirlce._data);
      }
    });
    return nearPoints;
  }

  $('.ui.dropdown')
  .dropdown({
  });

  $('#percentage').change(function() {
    var percentage = this.value;   
    d3.csv('./file/201' + this.value +'_tainan.csv', function(_data) {
      updateCircle(_data);
    });
  });
  

})();
