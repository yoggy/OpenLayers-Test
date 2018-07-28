// EPSG:4326 -> WGS84 http://spatialreference.org/ref/epsg/wgs-84/
// EPSG:3857 → WGS84 Web Mercator http://spatialreference.org/ref/sr-org/epsg3857-wgs84-web-mercator-auxiliary-sphere/
var initial_center = ol.proj.transform([139.76681118894027, 35.681279893274294], "EPSG:4326", "EPSG:3857");
var initial_zoom = 18;

var offset_center_x = 381541
var offset_center_y = 3950187

var input_lat = document.getElementById("input_lat")
var input_lng = document.getElementById("input_lng")
var input_x = document.getElementById("input_x")
var input_y = document.getElementById("input_y")
var input_dx = document.getElementById("input_dx")
var input_dy = document.getElementById("input_dy")
var div_zoom = document.getElementById("div_zoom");

proj4.defs([
  ['WGS84','+title=WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  ['UTM54N','+title=UTM zone 54N +proj=utm +zone=54 +ellps=WGS84 +datum=WGS84 +units=m']
]);

var map = new ol.Map({
    target: "openlayers-container",
    renderer: ['canvas', 'dom'],
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          attributions: [
            new ol.Attribution({
              html: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
            })
          ],
          url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
          projection: "EPSG:3857"
        })
      })
    ],
    controls: ol.control.defaults({
      attributionOptions: ({
        collapsible: false
      })
    }),

    view: new ol.View({
      projection: "EPSG:3857",
      center: initial_center,
      maxZoom: initial_zoom,
      zoom: 18
      })
  });

map.on('click', function(evt){console.log("click")})
map.on('moveend', function(evt){updateStatus()})

function updateStatus() {
    var p = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
    var zoom = map.getView().getZoom();

    var lng = p[0]
    var lat = p[1]

    var x, y;
    [x, y] = proj4('WGS84','UTM54N', [lng,lat]);

    var dx = x - offset_center_x
    var dy = y - offset_center_y

    updateInput(lat, lng, zoom, x, y, dx, dy);
}

function updateInput(lat, lng, zoom, x, y, dx, dy) {
  input_lat.value = lat;
  input_lng.value = lng;
  input_x.value = x;
  input_y.value = y;
  input_dx.value = dx;
  input_dy.value = dy;
  div_zoom.innerHTML = escapeHTML("zoom="+zoom);
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setCenterLatLng(lat, lng) {
  var p = ol.proj.transform([lng, lat], "EPSG:4326", "EPSG:3857");
  map.getView().setCenter(p);
}

function setCenterXY(x, y) {
  [lng,lat] = proj4('UTM54N','WGS84', [x,y]);
  setCenterLatLng(lat, lng)
}

function setCenterDxDy(dx, dy) {
  x = dx + offset_center_x;
  y = dy + offset_center_y;
  setCenterXY(x, y)
}

function onButtonReset() {
  console.log('onButtonReset()');
  map.getView().setCenter(initial_center);
  map.getView().setZoom(initial_zoom);
}

function getLatLngFromInput() {
  var lat = parseFloat(input_lat.value)
  var lng = parseFloat(input_lng.value)
  return [lat, lng]
}

function getXYFromInput() {
  var x = parseFloat(input_x.value)
  var y = parseFloat(input_y.value)
  return [x, y]
}

function getDxDyFromInput() {
  var dx = parseFloat(input_dx.value)
  var dy = parseFloat(input_dy.value)
  return [dx, dy]
}

function onButtonLatLng() {
  console.log('onButtonLatLng()');
  [lat, lng] = getLatLngFromInput();  
  setCenterLatLng(lat, lng)
}

function onButtonXY() {
  console.log('onButtonXY()');
  [x, y] = getXYFromInput();
  setCenterXY(x, y)
}

function onButtonDxDy() {
  console.log('onButtonDxDy');
  [dx, dy] = getDxDyFromInput();
  setCenterDxDy(dx, dy);
}

function drawCursor() {
    var canvas = document.getElementById("map-overlay");
    canvas.width = 600;
    canvas.height = 600;

    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'rgb(255, 0, 0)'
    ctx.lineWidth = 3;
    
    var w2 = canvas.width / 2;
    var h2 = canvas.height / 2;

    console.log(w2, h2)

    ctx.beginPath();
    ctx.moveTo(w2 - 50, h2);
    ctx.lineTo(w2 + 50, h2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w2, h2 - 50);
    ctx.lineTo(w2, h2 + 50);
    ctx.stroke();
}

window.addEventListener('load', function() {
    drawCursor();
    document.getElementById("button_latlng").addEventListener("click", onButtonLatLng);
    document.getElementById("button_xy").addEventListener("click", onButtonXY);
    document.getElementById("button_dxdy").addEventListener("click", onButtonDxDy);
    document.getElementById("button_reset").addEventListener("click", onButtonReset);
})
