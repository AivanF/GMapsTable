/**!
 * Copyright 2017, Barashev Ivan - All Rights Reserved.
 * E-mail: aivanf@mail.ru
 * Website: www.aivanf.com
 * This is proprietary software. Unauthorized commercial use of this code via any medium is strictly prohibited.
 * When use the code, you must give appropriate credit, provide a link to this license, and indicate if changes were made.
 * The work is provided "as is". You may not hold the author liable.
 */

var loading = false;
// maximal value of a cell
var tmax = 255;

// Arguments: ID of div
//   and GoogleMaps parameters dictionary, it’s not necessary
var container = new DataContainer("map", {
    zoom: 9,
    center: {lat: 55.7558, lng: 37.6173},
    mapTypeId: 'roadmap'
    // roadmap, satellite, hybrid, terrain
});

// Set zoom bounds
container.minZoomLevel = 9;
container.maxZoomLevel = 14;

// Translates GoogleMaps zoom to GMapsTable scale
container.scaler = function getScale(zoom) {
    if (zoom > 12) {
        return 100;
    } else if (zoom > 10) {
        return 50;
    } else {
        return 10;
    }
};

// dataLoader is called every time
// DataContainer needs to update the content
container.dataLoader = function (scale, borders) {
    // exit if the data is already loading
    if (loading)
        return;

    // show loading indicater
    $(".loader-small").show();

    // simulate HTTP request
    setTimeout(function () {
        // get appropriate data from data.js
        var data;
        switch (scale) {
            case 10:
                data = data1; break;
            case 50:
                data = data2; break;
            case 100: default:
                // this one has tocache:false
                // and will be loaded again every time
                data = data3; break;
        }

        // reset GUI
        $(".loader-small").hide();
        $("#btnupdate").removeClass("disabled");
        loading = false;

        // pass data to GMapsTable
        container.processData(data);
    }, 2000);
};

container.cellFormatter = function (td, val) {
    // no need to draw empty cells
    if (val !== "0") {
        // set cell text from the value and some additional fake info
        //       if your value is a dictionary,
        //       then this is the place to set custom layout
        td.innerHTML = val.toString() + "<br>[" +
            (Math.round(Math.pow(val, 0.5)) % 10).toString() + ":" +
            (Math.round(Math.log(val)) % 10).toString() + "]";

        // fill cell according to max value
        var t = 0.8 * parseFloat(val) / tmax;
        td.style.border = '1px solid #7799bb';
        td.style.background = 'rgba(127,159,255,' + t.toString() + ')';
    }
};

container.boundsChangedListener = function (zoom) {
    // show the scale
    $("#scaler").html(container.scaler(zoom));
};

container.tableBeforeInit = function (map, table, data) {
    // save max value for cell coloring
    tmax = parseInt(data['tmax']);
    // set appropriate text color
    if (map.getMapTypeId() === 'roadmap') {
        table.style.color = 'black';
    } else {
        table.style.color = 'white';
    }
};

$(document).ready(function () {
    $(".loader-small").hide();

    $("#btnupdate").click(function () {
        $("#btnupdate").addClass("disabled");
        // manual clearing the content
        container.clear();
        // restart DataContainer
              // by the way, this is called when GoogleMaps loaded
        container.reset();
    });
});
