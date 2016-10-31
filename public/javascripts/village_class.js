(function(window) {

  var map,
      data,
      topoLayer,
      defaultZoom;
  var legend = L.control({position: 'bottomleft'});

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData(topoUrl, classUrl) {
    d3.json(classUrl, function(classData) {
      data = classData;
      $('.updateAt').text(data.updateAt);

      d3.json(topoUrl, function(topoData) {
        for (var key in topoData.objects) {
          geojson = topojson.feature(topoData, topoData.objects[key]);
        }
        topoLayer = L.geoJson(geojson, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
      });
    });
  }

  function initMap(centerLat, centerLng, _defaultZoom) {
    defaultZoom = _defaultZoom;
    map = new L.Map('map');

    var url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    var attrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
    var osm = new L.TileLayer(url, {minZoom: 10,  maxZoom: 19, attribution: attrib});   

    map.setView(new L.LatLng(centerLat, centerLng), defaultZoom);
    osm.addTo(map);
    legend.addTo(map);
  }

  function style(feature) {
    var color = getColor(feature.properties.TOWNNAME+feature.properties.VILLAGENAM);
    return {
      fillColor: color,
      weight: 1,
      opacity: 0.3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    };
  }

  function getColor(village) {
    if (!(village in data)) {
      return '#21ba45';
    }
    switch (data[village].class) {
      case 'height-up':
        return '#db2828';

      case 'height-down':
        return '#f2711c';

      case 'low-up':
        return '#fbbd08';

      case 'low-down':
        return '#b5cc18';
    }
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });

    var village = feature.properties.TOWNNAME +feature.properties.VILLAGENAM;

    if (village in data) {
      layer.bindPopup(
        '<div class="village-pop"><span>' + feature.properties.TOWNNAME +
        ' ' + feature.properties.VILLAGENAM + '</span>' + getArrow(data[village]) +
        '<hr/>1-7天內病例數：' + isToRed(data[village].day_1_7) +
        '<br/>8-14天內病例數：' + data[village].day_8_14 + '</div>');
    }
    else {
      layer.bindPopup(feature.properties.TOWNNAME +
        ' ' + feature.properties.VILLAGENAM + '<br/>' +
        '14天病例數：0');
    }
  }

  function getArrow(d) {
    var diff = d.day_1_7 - d.day_8_14;
    if (diff > 0)
      return '<span class="arrow-up"></span>' + Math.abs(diff);
    else if (diff < 0)
      return '<span class="arrow-down"></span>' + Math.abs(diff);
    return '--';
  }

  function isToRed(value) {
    if (value < 10) 
      return value;
    return '<span class="red">'+value+'</span>';
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
      var color = ['#21ba45', '#b5cc18', '#fbbd08', '#f2711c', '#db2828'].reverse();
      var labels = ['無病例數', 
          '低病例數7天內<span class="arrow-down"></span>', 
          '低病例數7天內<span class="arrow-up"></span>或不變', 
          '高病例數7天內<span class="arrow-down"></span>', 
          '高病例數7天內<span class="arrow-up"></span>或不變'].reverse();

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] + 
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }

})(window);
