# GMapsTable
JavaScript library for dynamic tables on Google Maps

## The usage

In your HTML:

```html
 ..in <head>:
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
<script src="http://www.aivanf.com/static/gmt/gmapstable.js"></script>

 ..in <body>:
<div id="map"></div>
```

In your JavaScript:

```javascript
// Arguments: ID of div
//   and GoogleMaps parameters dictionary
var container = new DataContainer("map", {
    zoom: 9,
    center: {lat: 55.7558, lng: 37.6173},
    mapTypeId: 'roadmap'
});

container.dataLoader = function (scale, borders) {
    ... call container.processData(some_data)
}

container.scaler = function getScale(zoom) {
    ... return some number
}
```
