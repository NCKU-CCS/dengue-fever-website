(function(window) {

  var map,
      data,
      topoLayer,
      defaultZoom;

  var legend = L.control({position: 'bottomleft'});
  var nearPoints = [];

  var circles = [];
  var previousCircles = [];
  var markersCluster;

  var currentCircles = [];
  var currentInterval = '';
  var lengthOfNears = 0;

  var animateIndex = 0;
  var scale;
  var stopIntervalIsTrue = false;
  var rangeInput = $('.range input')[0];

  var defaultCirlceParams = {
    size: 10,
    color: '#CDDC39',
    fillColor: '#CDDC39',
    opacity: 1
  };

  var redCirlceParams = {
    size: 7,
    color: 'red',
    fillColor: 'red',
    opacity: 1
  };

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData(topoUrl, classUrl) {
    d3.csv(classUrl, function(data) {
      initCircles(data, defaultCirlceParams);
      inquire(23.00139, 120.19748, 300);
    });
  }

  function initMap(centerLat, centerLng, _defaultZoom) {
    defaultZoom = _defaultZoom;
    map = new L.Map('map');

    var layer = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2hpaHN1YW4iLCJhIjoiY2l0NnlvcGY0MDRxaTJ0bXc1YXBlMmlmZyJ9.ffA4FYGZw3hpcXn1MTAyWw', {
      maxZoom: 18
    }).addTo(map);
    map.setView(new L.LatLng(centerLat, centerLng), defaultZoom);

    map.on('click', function(e) {
      stopIntervalIsTrue = true;
      clearInterval(currentInterval);
      clear();
      setTimeout(function() {
      stopIntervalIsTrue = false;
      inquire(e.latlng.lat, e.latlng.lng, 300);
      }, 300);
    });
  }


  function onLegnendAdd (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var color = ['red'];
      var labels = ['各里登革熱雨後上升區域'];

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] +
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }


  function initCircles(data, argvs) {
    data.forEach(function(d) {
      if (!d.發病日期) {
        return;
      }
      var circle = L.circle([d.緯度座標, d.經度座標], argvs.size,
        {fillColor: argvs.fillColor, color: argvs.color, opacity: argvs.opacity});

      circle.date = new Date('2015/'+d.發病日期);
      circles.push(circle);
    });
  }

 function initMarkers(data, params) {
    var markers = [];
    data.forEach(function(e) {
      var icon;
      var marker;
      var content = '';

      icon =  L.AwesomeMarkers.icon({prefix: 'fa', icon: params.icon,
        markerColor: e.color});
      marker = L.marker([e.緯度座標, e.經度座標], {icon: icon});

      markers.push(marker);
    });
    return markers;
 }

  function inquire(lat, lng, distance) {
    nearPoints = getNearBy(L.latLng(lat, lng), distance);

    var argvs = redCirlceParams;
    currentInquire = L.circle([lat, lng], argvs.size,
      {fillColor: argvs.fillColor, color: argvs.color, opacity: argvs.opacity, fillOpacity: 0.9}).addTo(map);

    map.setView(new L.LatLng(lat, lng));
    map.setZoom(17);

    lengthOfNears = nearPoints.length;
    $('.result').text('總病例數：' + lengthOfNears);

    if (lengthOfNears > 0) {
      rangeInput.value = 0;
      rangeInput.max = lengthOfNears;
    }

    addPoints(nearPoints);
  }

  function getNearBy(source, distance) {
    var points = [];
    circles.forEach(function(marker) {
      if (source.distanceTo(marker.getLatLng()) < distance){
        points.push(marker);
      }
    });
    points.sort(function(a, b) {
      return a.date - b.date;
    });
    return points;
  }

  function addPoints(points) {
    scale = d3.scale.linear()
      .domain([0, lengthOfNears])
      .range(['#FEBED2', '#950431']);

    var interval = setInterval(function(){
      currentInterval = interval;
      return updateVis(interval);
    }, 1200);
  }

  $('.submit').click(function() {
    var lat = $('#lat').val();
    var lng = $('#lng').val();
    var distance = $('#distance').val();

    if (isNumber(lat) && isNumber(lng) && isNumber(distance)) {
      stopIntervalIsTrue = true;
      clearInterval(currentInterval);

      clear();
      stopIntervalIsTrue = false;
      inquire(lat, lng, distance);
    }
    else {
      alert('填入欄位為空白或非數字');
    }
  });

  function clear() {
    nearPoints.forEach(function(circle) {
      map.removeLayer(circle);
    });
    previousCircles.forEach(function(circle) {
      map.removeLayer(circle);
    });
    currentCircles.forEach(function(circle) {
      map.removeLayer(circle);
    });
    map.removeLayer(currentInquire);

    animateIndex = 0;
  }

  function isNumber(value) {
    if ((undefined === value) || (null === value)) {
        return false;
    }
    if (!value) {
      return false;
    }
    if (typeof value == 'number') {
        return true;
    }
    return !isNaN(value - 0);
  }

  function isNear(now, date) {
    var current = new Date(now);
    var from = new Date(date);
    var timeDiff = Math.abs(current.getTime() - from.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays <= 7;
  }

  function updateVis (interval) {
    if (animateIndex >= lengthOfNears || (stopIntervalIsTrue && interval)) {
      markersCluster = null;
      clearInterval(interval);
      return;
    }

    var color = scale(animateIndex);
    var opacity = 0.3 + parseFloat(animateIndex)/lengthOfNears;

    if (!markersCluster)
      markersCluster = L.markerClusterGroup();

    currentCircles.forEach(function(circle) {
      map.removeLayer(circle);

      var grayCircle = L.circle(circle.getLatLng(), 10,
        {fillColor: color, color: color, opacity: opacity }).addTo(map);

      var key = circle.date.toISOString().substring(0, 10).replace(/-/g, '/');
      grayCircle.bindPopup("日期：" + key);
      previousCircles.push(grayCircle);
      markersCluster.addLayer(grayCircle);
    });

    if (currentCircles.length > 0 && !isNear(nearPoints[animateIndex].date, currentCircles[0].date) ||
       animateIndex % 6 === 1) {
      map.addLayer(markersCluster);
      previousCircles.push(markersCluster);
      markersCluster = null;
    }
    else {
    }
    currentCircles = [];

    for (var i = animateIndex;
         (i+1) < lengthOfNears &&
         (i === animateIndex || nearPoints[i].date.getTime() == nearPoints[i+1].date.getTime()); ++i) {


      nearPoints[i].addTo(map);
      currentCircles.push(nearPoints[i]);

      var key = nearPoints[i].date.toISOString().substring(0, 10).replace(/-/g, '/');
      $('.current').text(key);
      var timeDiff = Math.abs(nearPoints[i].date.getTime() - nearPoints[0].date.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      rangeInput.value = i;
    }

    if (animateIndex !== i)
      animateIndex = i;
    else
      animateIndex += 1;
  }

  $('.pause').click(function() {
    stopIntervalIsTrue = true;
  });

  $('.stepback').click(function() {
    stopIntervalIsTrue = true;
    rangeInput.value = 0;
    previousCircles.forEach(function(circle) {
      map.removeLayer(circle);
    });
  });

  $('.play').click(function() {
    stopIntervalIsTrue = false;
    var interval = setInterval(function(){
      return updateVis(interval);
    }, 1200);
  });

  $('.range input').change(function() {
    stopIntervalIsTrue = true;
    animateIndex = parseInt(this.value);
    previousCircles.forEach(function(circle) {
      map.removeLayer(circle);
    });
    updateVis();
  });

})(window);
