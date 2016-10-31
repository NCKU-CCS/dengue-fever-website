(function(window) {

  var map,
      data,
      topoLayer,
      defaultZoom;

  var legend = L.control({position: 'bottomleft'});
  var scale;

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData(topoUrl, classUrl) {
    d3.json(classUrl, function(classData) {
      data = classData;
      scale = d3.scale.pow()
            .domain([0, data.max_e])
            .range(['#FDDDB3', 'rgb(175, 0, 0)']);

      d3.json(topoUrl, function(topoData) {
        $('#loading').text('');
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
    var color = getColor(feature.properties);
    var fillOpacity = 0.7;
    if (color === null) {
      fillOpacity = 0.7;
      color = '#B9B9B9';
    }
    return {
      fillColor: color,
      weight: 0.7,
      opacity: 0.25,
      color: '#666',
      dashArray: '',
      fillOpacity: fillOpacity
    };
  }

  function getColor(properties) {
    if (data.hasOwnProperty(properties.CODEBASE)) {
      var info = data[properties.CODEBASE];
      if (info.病例人數 === 0)
        return 'green';
      if (info.長者人數 === 0) 
        return '#0077D6'; 
      return scale(info.長者百分比);
    }
    return null;
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
    
    var props = feature.properties;
    var info = data[props.CODEBASE];
    if (data.hasOwnProperty(props.CODEBASE)) {
      layer.bindPopup('<div>統計區編號：' + props.CODEBASE +
                      '<br/>里別：' + props.VILLAGE + 
                      '<br/>大於60歲人數病例數：' + info.長者人數 + 
                      '<br/>60歲以上病例數比例：' + info.長者百分比 + '%' +
                      '<br/>所有病例數：' + info.病例人數 + 
                      '<br/>病例數比例：' + info.總百分比 + '%'+
                      '<br/>總人口數：' + info.人口數 +
                      '</div>');
    }
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
      var color = ['#B9B9B9', 'green', '#0077D6', 'rgb(175, 0, 0)'];
      var labels = ['無人口資料', '無登革熱病例', '無60歲以上病例','表示登革熱比例越高'];

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] + 
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }

})(window);
