// EPSG:4326 -> WGS84 http://spatialreference.org/ref/epsg/wgs-84/
// EPSG:3857 → WGS84 Web Mercator http://spatialreference.org/ref/sr-org/epsg3857-wgs84-web-mercator-auxiliary-sphere/
var initial_center = ol.proj.transform([139.76681118894027, 35.681279893274294], "EPSG:4326", "EPSG:3857");
var initial_zoom = 18;

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

function displayMessage() {
    var p = ol.proj.transform(map.getView().getCenter(), "EPSG:3857", "EPSG:4326");
    var zoom = map.getView().getZoom();

    var lng = p[0]
    var lat = p[1]

    var x, y;
    [x, y] = proj4('WGS84','UTM54N', [lng,lat]);

    var dx = x - 381541
    var dy = y - 3950187

    updateMessage("lat=" + lat + ", lng=" + lng + ", zoom=" + zoom + ", (x,y)=" + x + "," + y + ", (dx,dy)=" + dx + ", " + dy);
}

function updateMessage(str) {
    var dom_msg = document.getElementById("message");
    dom_msg.innerHTML = escapeHTML(str);
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function onResetButton() {
    map.getView().setCenter(initial_center);
    map.getView().setZoom(initial_zoom);
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
    setInterval(displayMessage, 500);
    document.getElementById("reset-button").addEventListener("click", onResetButton);
})


