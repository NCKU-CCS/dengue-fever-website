(function(window) {

  var map,
      data,
      drugData,
      villageData,
      topoLayer,
      defaultZoom,
      legend = L.control({position: 'bottomleft'});

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData(topoUrl) {
    //$('.updateAt').text(data.updateAt);
    d3.json(topoUrl, function(topoData) {
      var geojson = getGeojson(topoData);
      topoLayer = L.geoJson(geojson, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);
    });

    d3.csv('./file/drug_2015.csv', function(data) {
      drugData = data;
      drawCircle(drugData, {
        color: '#028D9B',
        fillColor: '#028D9B',
        size: 50,
        opacity: 0.9,
        showBig: false
      });
    });
  }

  function initMap(centerLat, centerLng, _defaultZoom) {
    defaultZoom = _defaultZoom;
    map = new L.Map('map');

    var url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    var attrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,' +
      'Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian '+
      'OpenStreetMap Team</a>';
    var osm = new L.TileLayer(url, {minZoom: 10,  maxZoom: 19, attribution: attrib});   

    map.setView(new L.LatLng(centerLat, centerLng), defaultZoom);
    osm.addTo(map);
    legend.addTo(map);
  }

  function style(feature) {
    var color = getColor(feature.properties);
    return {
      fillColor: color,
      weight: 1,
      opacity: 0.3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    };
  }
  var count = 0;
  var count2 = 0;
  function getColor(properties) {
    var origin = properties.is_origin_effect.replace(' ', '').split(',');
    if (!properties.date || origin[1] === 'uncertain') {
      return '#333';
    }
    before = parseInt(origin[0]);
    after = parseInt(origin[1]);
    if (before >= after) {
      return '#21ba45';
    }
    console.log(before, after, origin);
    return '#DB2828';
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: layerOnClick
    });

    var properties = feature.properties;
    if (properties.date) {
      var effect = properties.is_origin_effect;
      layer.bindPopup(
          '區塊ID：' + properties.way_id +
          '<br/>噴藥日期：' + properties.date + 
          '<br/>里別：' + properties.region + 
          '<br/>噴藥區域前11-後3天與後4-17天人數總計：' + effect + getPercentage(effect) + 
          '<br/>噴藥50公尺區域前11-後3天與後4-17天人數總計：' + properties.is_50_effect +
           getPercentage(properties.is_50_effect) + 
          '<br/>噴藥100公尺區前11-後3天與後4-17天人數總計：' + properties.is_100_effect +
           getPercentage(properties.is_100_effect) + 
          '<br/>噴藥150公尺區域前11-後3天前與後4-17天人數總計：' + properties.is_150_effect +
           getPercentage(properties.is_150_effect) + 
          '<br/>全台南同一時期病例變化：' + properties.tainan_same_period + 
          getPercentage(properties.tainan_same_period),
          {maxWidth: 400}
        );
    }
    else {
      layer.bindPopup('無日期資料');
    }
  }

  var layers = [];
  function layerOnClick(e) {
    var properties = e.target.feature.properties;
    var id = properties.way_id;
    
    layers.forEach(function(layer) {
      map.removeLayer(layer);
    });

    $.get('/d/drug_geo?id='+id, function(data) {
      layers.push(extendLayer(data.poly_50));
      layers.push(extendLayer(data.poly_100));
      layers.push(extendLayer(data.poly_150));

      if (properties.date)
        updateBar(properties);
    })
    .fail(function() {
      console.log('error');
    });
  }

  function updateBar(properties) {
    var bar50 = formatAsBarData(properties.count_50_14_day);
    var bar100 = formatAsBarData(properties.count_100_14_day);
    var bar150 = formatAsBarData(properties.count_150_14_day);
    var bar = formatAsBarData(properties.count_origin_14_day);
    $('#bar').empty();
    $('#bar-50').empty();
    $('#bar-100').empty();
    $('#bar-150').empty();
    new window.BarLineChart('#bar', bar, tipHTML, {
      showLine: false,
      height: 120
    });
    new window.BarLineChart('#bar-50', bar50, tipHTML, {
      showLine: false,
      height: 120
    });
    new window.BarLineChart('#bar-100', bar100, tipHTML, {
      showLine: false,
      height: 120
    });
    new window.BarLineChart('#bar-150', bar100, tipHTML, {
      showLine: false,
      height: 120
    });
  }

  function tipHTML(d) {
    return d.date.toLocaleDateString() + 
      '<br/>當日病例<span style="color:red">' + d.value + '</span>人'; 
  }

  function resetHighlight(e) {
    topoLayer.resetStyle(e.target);
  }

  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 2,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.9
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }

  function onLegnendAdd (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var color = ['#333', '#DB2828', '#21ba45'].reverse();
      var labels = ['無日期資料或尚未確定', '前11-後3天<噴藥後4-17天', 
          '前11-後3天>=噴藥後4-17天'].reverse();

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] + 
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }

  function getGeojson(topoData) {
    var geojson;
    for (var key in topoData.objects) {
      geojson = topojson.feature(topoData, topoData.objects[key]);
    }
    return geojson;
  }

  function extendLayer(poly, properties) {
    return L.geoJson(poly, {}).addTo(map);
  }


  function formatAsBarData(data) {
    if (!data) return null;

    var dataArray = data.split(',');
    var result = [];
    for (var i = 0; i < dataArray.length; i += 2) {
      result.push({
        value: dataArray[i+1],
        date: dataArray[i].replace(/-/g, '/')
      });
    }
    return result;
  }

  function drawCircle(data, argvs) {
    latlngs = {};

    data.forEach(function(point) {
      if (latlngs[point.Longitude] && latlngs[point.Longitude][point.Latitude]) {
        return;
      }
      var circle = L.circle([point.Latitude, point.Longitude], argvs.size,
        {fillColor: argvs.fillColor, color: argvs.color, opacity: argvs.opacity})
        .addTo(map);

      circle.bindPopup("日期：" + point.日期);
      if (!latlngs[point.Longitude])
        latlngs[point.Longitude] = {};
        latlngs[point.Longitude][point.Latitude] = true;
      });
  }

  function getPercentage(text) {
    if (!text) {
      return ''
    }

    var arr = text.replace(' ', '').split(',');
    if (arr[1] && arr[1] !== 'uncertain')  {
      arr[1] = parseFloat(arr[1]);
      arr[0] = parseFloat(arr[0]);
      return ' / ' + ( (arr[1] - arr[0]) / arr[0] * 100 ).toFixed(1) + '%';
    }
    return '';
  }




})(window);
