/**!
 * GMapsTable v1.0
 *
 * Copyright 2017, Barashev Ivan - All Rights Reserved.
 * E-mail: aivanf@mail.ru
 * Website: www.aivanf.com
 * This is proprietary software. Unauthorized commercial use of this code via any medium is strictly prohibited.
 * When use the code, you must give appropriate credit, provide a link to this license, and indicate if changes were made.
 * The work is provided "as is". You may not hold the author liable.
 */

DataContainer = (function(window, gmaps){
    // Stores all the DataContainers
    // helpful in case of multiple google maps using
    var dcs = [];

    // Settings object
    var set = {
        debug: false
    };

    /** @constructor */
    function Borders(nlat, xlat, nlon, xlon) {
        this.minlat = nlat;
        this.maxlat = xlat;
        this.minlon = nlon;
        this.maxlon = xlon;
    }


    // Initialises the maps and DataContainers
    function initMaps() {
        for (var i = 0; i < dcs.length; i++) {
            (function () {
                var dc = dcs[i];
                dc.map = new gmaps.Map(document.getElementById(dc.mapid), dc.args);
                gmaps.event.addListener(dc.map, 'bounds_changed', function(){dc.boundsChanged()});
                gmaps.event.addListener(dc.map, 'zoom_changed', function(){dc.zoomChanged()});
            })();
        }
        dcs = [];
    }


    // Table with data for current scale and borders
    OverTable.prototype = new gmaps.OverlayView();

    /** @constructor */
    function OverTable(dc, data, map) {
        this.dc = dc;

        this.prec = parseInt(data['scale']);
        // explicit borders of loaded data
        this.minLat = Number(data['minLat']);
        var difLat = Number(data['difLat']);
        this.minLon = Number(data['minLon']);
        var difLon = Number(data['difLon']);

        // rows and columns of the dataset in borders for cached data
        this.rowmin = difLat - Math.min(difLat, Math.round(dc.br.maxlat * this.prec) - this.minLat);
        this.rowmax = difLat - Math.max(0, Math.round(dc.br.minlat * this.prec) - this.minLat);
        this.colmin = Math.max(0, Math.round(dc.br.minlon * this.prec) - this.minLon);
        this.colmax = Math.min(difLon, Math.round(dc.br.maxlon * this.prec) - this.minLon);

        this.minLat = (this.minLat + difLat - this.rowmax) / this.prec;
        this.minLon = (this.minLon + this.colmin) / this.prec;
        difLat = (this.rowmax - this.rowmin) / this.prec;
        difLon = (this.colmax - this.colmin) / this.prec;

        if (set.debug) {
            console.log("[ -- OverTable -- ]");
            console.log("Scale: " + this.prec);
            console.log("Border: minLat: " + dc.br.minlat + ", maxLat: " + dc.br.maxlat + "," +
                "minLon: " + dc.br.minlon + ", maxLon: " + dc.br.maxlon);
            console.log("Col: [" + this.colmin + "-" + this.colmax + "] of " + difLon +
                ", Row: [" + this.rowmin + "-" + this.rowmax + "] of " + difLat);
            console.log("minLat: " + this.minLat + ", difLat: " + difLat + "," +
                "minLon: " + this.minLon + ", difLon: " + difLon);
        }

        this.maxLat = this.minLat + difLat;
        this.maxLon = this.minLon + difLon;
        this.bounds_ = new gmaps.LatLngBounds(
            new gmaps.LatLng(this.minLat, this.minLon),
            new gmaps.LatLng(this.maxLat, this.maxLon)
        );
        this.div_ = null;

        this.tbl = document.createElement('table');
        this.tbl.style.tableLayout = 'fixed';
        this.tbl.style.textAlign = 'center';
        this.tbl.style.overflowY = 'hidden';

        this.dc.tableBeforeInit(map, this.tbl, data);

        this.fillTable(this.tbl, data['table']);
        this.setMap(map);
    }

    OverTable.prototype.addCell = function (row, val) {
        var note = document.createElement('td');
        if (val[0] !== "0") {
            this.dc.cellFormatter(note, val);
        }
        row.appendChild(note);
    };

    OverTable.prototype.addRow = function (tbl, vals, j) {
        var row = document.createElement('tr');
        for (var i = 0, len = vals.length; i < len; i++) {
            if ((i >= this.colmin) && (i <= this.colmax)) {
                this.addCell(row, vals[i], j, i);
            }
        }
        tbl.appendChild(row);
    };

    //
    OverTable.prototype.fillTable = function (tbl, data) {
        for (var i = 0, len = data.length; i < len; i++) {
            if ((i >= this.rowmin) && (i <= this.rowmax)) {
                this.addRow(tbl, data[i], i);
            }
        }
    };

    OverTable.prototype.onAdd = function () {
        this.div_ = document.createElement('div');
        this.div_.style.border = 'none';
        this.div_.style.borderWidth = '0px';
        this.div_.style.position = 'absolute';
        this.div_.appendChild(this.tbl);

        // if (clicked) {
            // map.setCenter(new gmaps.LatLng((this.minLat + this.maxLat) / 2,
            //     (this.minLon + this.maxLon) / 2));
        // }

        // Add the element to the "overlayImage" pane
        this.getPanes().overlayImage.appendChild(this.div_);
    };

    OverTable.prototype.draw = function () {
        var overlayProjection = this.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

        // Resize the div to fit the indicated dimensions
        this.div_.style.left = sw.x + 'px';
        this.div_.style.top = ne.y + 'px';
        this.div_.style.width = (ne.x - sw.x) + 'px';
        this.div_.style.height = (sw.y - ne.y) + 'px';
        // console.log("W/H: " + (Math.round((ne.x - sw.x))).toString() + "/" + (Math.round(sw.y - ne.y)).toString());

        this.tbl.style.width = this.div_.style.width;
        this.tbl.style.height = this.div_.style.height;
    };

    OverTable.prototype.onRemove = function () {
        this.div_.parentNode.removeChild(this.div_);
    };

    OverTable.prototype.hide = function () {
        if (this.div_) {
            this.div_.style.visibility = 'hidden';
        }
    };

    OverTable.prototype.show = function () {
        if (this.div_) {
            this.div_.style.visibility = 'visible';
        }
    };


    /** @constructor */
    function DataContainer(mapid, args) {
        dcs.push(this);
        // google maps object
        this.map = null;
        // div element id
        this.mapid = mapid;
        // google maps arguments
        this.args = args;
        // default function pointers
        this.dataLoader = function () {};
        this.boundsChangedListener = function () {};
        this.scaler = function () {return 1};
        this.cellFormatter = function (td, val) {
            td.innerHTML = val.toString();
        };
        this.tableBeforeInit = function () {};
        // allowed map zoom
        this.minZoomLevel = 6;
        this.maxZoomLevel = 16;
        // scale of the loaded data
        this.scale = 1;
        // saved data for different scales
        this.cache = {};
        // OverTable object
        this.overlay = null;
        // borders of the data loaded with padding
        this.br = new Borders(0, 0, 0, 0);
    }

    DataContainer.prototype.reset = function (force) {
        this.removeTable();

        this.scale = this.getScale();
        // set new borders with padding
        var bnd = this.getBorder();
        this.br.minlat = Math.min(bnd.minlat, bnd.maxlat);
        this.br.maxlat = Math.max(bnd.minlat, bnd.maxlat);
        var diflat = this.br.maxlat - this.br.minlat;
        this.br.minlat -= diflat;
        this.br.maxlat += diflat;
        this.br.minlon = bnd.minlon;
        this.br.maxlon = bnd.maxlon;
        var diflon = this.br.maxlon - this.br.minlon;
        this.br.minlon -= diflon;
        this.br.maxlon += diflon;

        if (set.debug)
            console.log("[ -- DataContainer.reset -- ]");
        var z = this.scale.toString();
        var toload = true;
        if (z in this.cache) {
            var a = this.cache[z];
            if (a['tocache'] || force) {
                if (a["table"].length > 0) {
                    if (set.debug)
                        console.log("new OverTable");
                    this.overlay = new OverTable(this, a, this.map);
                } else {
                    if (set.debug)
                        console.log("no data!");
                    this.overlay = null;
                }
                toload = false
            }
        }
        if (toload) {
            if (set.debug)
                console.log("dataLoader(...)");
            this.dataLoader(this.scale, this.getBorder());
        }
    };

    DataContainer.prototype.removeTable = function () {
        if (this.overlay) {
            this.overlay.setMap(null);
            this.overlay = null;
        }
    };

    DataContainer.prototype.clear = function () {
        this.cache = {};
        this.removeTable();
    };

    DataContainer.prototype.processData = function (data) {
        this.cache[data['scale']] = data;
        this.reset(true);
    };

    DataContainer.prototype.getScale = function () {
        return this.scaler(this.map.getZoom());
    };

    DataContainer.prototype.getBorder = function () {
        var bnd = this.map.getBounds();
        return new Borders(
            Math.round(bnd.f.f * 100) / 100,
            Math.round(bnd.f.b * 100) / 100,
            Math.round(bnd.b.b * 100) / 100,
            Math.round(bnd.b.f * 100) / 100);
    };

    DataContainer.prototype.wrongBorder = function () {
        var bnd = this.getBorder();
        return ((bnd.maxlon > this.br.maxlon) || (bnd.minlon < this.br.minlon) || (bnd.maxlat > this.br.maxlat) || (bnd.minlat < this.br.minlat));
    };

    DataContainer.prototype.boundsChanged = function () {
        this.boundsChangedListener(this.map.getZoom());
        if (this.wrongBorder()) {
            this.reset(false);
        }
    };

    DataContainer.prototype.zoomChanged = function () {
        // check min and max zoom
        if (this.map.getZoom() < this.minZoomLevel) {
            this.map.setZoom(this.minZoomLevel);
        }
        if (this.map.getZoom() > this.maxZoomLevel) {
            this.map.setZoom(this.maxZoomLevel);
        }
        // check if scale must be changed
        if (this) {
            if (this.scale !== this.getScale()) {
                this.reset(false);
            }
        }
    };

    gmaps.event.addDomListener(window, 'load', initMaps);

    return DataContainer;
}(window, google.maps));