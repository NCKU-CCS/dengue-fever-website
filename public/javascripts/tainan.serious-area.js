(function(window) {

  var map,
      data,
      topoLayer,
      defaultZoom;

  var legend = L.control({position: 'bottomleft'});
  var region = 'all';

  var regions = ['東區', '中西區', '北區', '南區', '安平區', '安南區', '永康區', '仁德區', '歸仁區', '關廟區',
    '龍崎區', '新化區', '新市區', '善化區', '山上區', '左鎮區', '玉井區', '楠西區',
    '南化區', '安定區', '西港區', '七股區', '佳里區', '將軍區'];
  regions.forEach(function(r) {
    $('.menu').append('<div data-value="' + r + '" class="item">' + r + '</div>');
  });

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData(topoUrl, classUrl) {
    d3.json(classUrl, function(classData) {
      data = classData;

      d3.json(topoUrl, function(topoData) {
        $('#loading').text('');
        for (var key in topoData.objects) {
          geojson = topojson.feature(topoData, topoData.objects[key]);
        }
        updateLayer()
      });
    });
  }

  function updateLayer() {
    if (topoLayer) map.removeLayer(topoLayer);
    var changeView = true;

    topoLayer = L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature,
      filter: function(feature, layer) { 
        var info = data[feature.properties.CODEBASE];

        if (info && (info.label !== undefined) && (info.region  === region || region === 'all' ) &&
           info.village == feature.properties.VILLAGE) {

          if (changeView && region !== 'all' && info && info.lat) {
            map.setView(new L.LatLng(info.lng, info.lat), 13);
            changeView = false;
          }
          return true;
        }
        return false;
      }
    }).addTo(map);
  }

  function initMap(centerLat, centerLng, _defaultZoom) {
    defaultZoom = _defaultZoom;
    map = new L.Map('map');

    var googleStreet =  new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    });
    var googleHybrid = new L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3']
    });

    googleHybrid.addTo(map);
    googleStreet.addTo(map);
    L.control.layers({
      "地球": googleHybrid,
      "地圖": googleStreet
    }).addTo(map);

    map.setView(new L.LatLng(centerLat, centerLng), defaultZoom);
    legend.addTo(map);
  }


  function style(feature) {
    var color = getColor(feature.properties);
    var opacity = 1;

    if (color === null) {
      opacity = 0;
    }

    return {
      fillColor: color,
      weight: 2.5,
      opacity: opacity,
      color: color,
      dashArray: '',
      fillOpacity: 0
    };
  }

  function getColor(properties) {
    if (data.hasOwnProperty(properties.CODEBASE)) {
      var info = data[properties.CODEBASE];

      if (info.label === 1) {
        return 'red';
      }
      else if (info.label === 0) {
        return 'blue';
      }

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
    var people = info.people ? info.people : 0;
    var ratio = info.ratio ? parseFloat(info.ratio).toFixed(2) : '';

    if (data.hasOwnProperty(props.CODEBASE)) {
      layer.bindPopup('<div>統計區編號：' + props.CODEBASE +
                      '<br/>里別：' + props.VILLAGE + 
                      '<br/>登革熱病例：' + info.dengue + 
                      '<br/>人口：' + people + 
                      '<br/>病例數比例：' + ratio + '%'+
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
      dashArray: '',
      fillOpacity: 0.1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }

  function onLegnendAdd (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var color = ['red', 'blue'];
      var labels = ['登革熱病例數 ＞ 20人', '登革熱人口比例＞1％，10 < 病例數 ＜20'];

      for (var i = 0; i < labels.length; i++) {
          div.innerHTML += '<i style="background:' + color[i] + 
            '"></i>' + labels[i] + '<br/>';
      }

      return div;
  }

  $('.ui.dropdown')
  .dropdown({
    onChange: function(value, text, $selectedItem) {
      region = value;
      updateLayer();
      $("main").animate({ scrollTop: $(document).height() }, "slow");
    }
  });

})(window);
