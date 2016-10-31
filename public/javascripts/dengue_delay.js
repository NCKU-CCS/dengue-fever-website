(function(window) {

  var map,
      data,
      villageData,
      topoLayer,
      defaultZoom;
  var legend = L.control({position: 'bottomleft'});
  var heat;
  var select = 0;
  var delay = false;
  var pfrom = new Date('2015/08/01');
  var pend = new Date('2015/10/31');

  window.initData = initData;
  window.initMap = initMap;
  legend.onAdd = onLegnendAdd;

  function initData() {
    d3.tsv("./file/dropbox.tsv", function(_data) {
      data = _data;
      addHeat(_data, 0);
    });
  }
  $('.ui.dropdown')
  .dropdown({
  });


  function addHeat(data, day) {
    var count = 0;
    var latlng = [];
    if (heat) 
      map.removeLayer(heat);

    data.forEach(function(point) {

      var diffDay = getDiffDay(point.發病日期, point.個案研判日期);
      if (diffDay > day) {
        if (delay) {
          for (var i = 0; i < (diffDay+1); ++i) {
            latlng.push([parseFloat(point.緯度座標), parseFloat(point.經度座標)]);
          }
        }
        else {
          latlng.push([parseFloat(point.緯度座標), parseFloat(point.經度座標)]);
        }
      }

    });

    heat = L.heatLayer(latlng, {
      radius: 10
    }).addTo(map);
    $('.current').text(''); 
  }

  function initMap(centerLat, centerLng, _defaultZoom) {
    defaultZoom = _defaultZoom;
    map = new L.Map('map');

    var url = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    var attrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
    var osm = new L.TileLayer(url, {minZoom: 10,  maxZoom: 19, attribution: attrib});   

    map.setView(new L.LatLng(centerLat, centerLng), defaultZoom);
    osm.addTo(map);
    //legend.addTo(map);
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

  function getDiffDay(from, end) {
    from = new Date('2015/'+from);

    if (end.indexOf('2015') == -1) {
      end = new Date('2015/'+end);
    }
    else {
      end = new Date(end); 
    }

    if (from <= pfrom || end >= pend)  {
      return -1;
    }

    var timeDiff = Math.abs(end.getTime() - from.getTime());
    diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays;
  }

  $('#percentage').change(function() {
    select = this.value;
    addHeat(data, this.value);
  });

  $('.checkbox')
    .checkbox({
      onChange: function() {
        var checkboxs = $(this);
        checkboxs.each(function(i) {
          var value = checkboxs[i].value;
          var name = checkboxs[i].name;
          if (checkboxs[i].checked) {
            delay = true;
            addHeat(data, select);
          }
          else{
            delay = false;
            addHeat(data, select);
          }
        });
      }
    });

   $( "#from" ).datepicker({
    dateFormat: 'yy/mm/dd',
    defaultDate: '2015/08/01',
    onSelect: function(dateText) {
      pfrom = new Date(dateText);
      addHeat(data, select);
    }
   });
   $( "#end" ).datepicker({
      dateFormat: 'yy/mm/dd',
      onSelect: function(dateText) {
        pend = new Date(dateText);
        addHeat(data, select);
    }
   });

})(window);
