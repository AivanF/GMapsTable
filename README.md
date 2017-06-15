# GMapsTable
JavaScript library for dynamic visualising of datasets as tables on Google Maps and full, well-commented example of it's work.
[Live example is here.](http://www.aivanf.com/static/gmt/example.html)

![TMapsTable screenshot 0](http://www.aivanf.com/static/gmt/gmt_s0.jpg)
![TMapsTable screenshot 1](http://www.aivanf.com/static/gmt/gmt_s1.jpg)

## The usage briefly

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

## List of properties

You may specify the following properties of DataContainer:

1) `scaler(zoom)` — translates GoogleMaps zoom to GMapsTable scale. Both are integer numbers.

2) `dataLoader(scale, borders)` — is called when DataContainer needs new data. Must call `DataContainer.processData(data)`.

`borders` is a JavaScript object with properties minlat, maxlat, minlon, maxlon — current bounds of Google Maps view with big padding on each side.

3) `tableBeforeInit(map, table, data)` — is called when table element was created but not filled with rows and cells. `map` is a Google Maps object, `table` is an HTML element, and data is your data object for current scale. Here you can prepare your table, some variables with actual data object and current maps parameters.

4) `cellFormatter(td, val)` — is called when table is generating. `td` is an HTML element, a cell of the table. `val` is a value from your data object. Here you can easily set output for multiple values or fill background according to some parameters.

5) `boundsChangedListener(zoom)` — is called when Google Maps bounds are changed.

6) `minZoomLevel`, `maxZoomLevel` — minimal and maximal zoom of Google Maps. Integer numbers ranged between 1 (world map) and 22 (street view).

Only the 1st and 2nd are necessary for DataContainer successful operation.
