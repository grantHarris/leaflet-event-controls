'use strict';

/*
    
    Dynamically add and remove controls from leaflet via leaflet events. 
    var map = L.map(id, options);
    var ec = L.eventControls();
    var control = L.control.foo();
    ec.addControl(control, 'foo', ['click', 'bar']).addTo(map);

    Will add the foo control to map on foo event. Will remove it on the click event or bar event.

*/

L.EventControls = L.Class.extend({
    initialize: function() {
        this._controls = [];
    },
    addTo: function(map) {
        this._map = map;
        L.EventControls.prototype._hookUpControlEvents.call(this);
        return this;
    },
    removeFrom: function(map) {
        L.EventControls.prototype._teardownControlEvents.call(this);
        L.EventControls.prototype._removeControlsFromMap.call(this);
        if (this._map === map) {
            delete this._map;
        }
        return this;
    },
    /* 
        addEvents and removeEvents can be either strings (for specifying one event) or
        arrays of strings (for adding and removing on multiple events).
    */
    addControl: function(control, addEvents, removeEvents) {
        this._controls.push({
            control: control,
            addEvents: addEvents,
            removeEvents: removeEvents
        });

        if (this._map) {
            L.EventControls.prototype._hookUpControlEvents.call(this);
        }
        return this;
    },
    removeControl: function(control) {
        for (var i = this._controls.length - 1; i >= 0; i--) {
            if (this._controls[i].control === control) {
                L.EventControls.prototype._tearDownControlEvent.call(this, this._controls[i]);
                this._controls.splice(i, 1);
            }
        }
        return this;
    },
    _removeControlsFromMap: function(){
        this._controls.map(function(entry) {
            if (entry.control._map) {
                entry.control.removeFrom(entry.control._map);
            }
        });
    },
    _hookUpControlEvents: function() {
        var that = this;
        this._controls.map(function(entry) {
            if (entry.addEvents && !entry.addLayerOnEvent) {
                entry.addLayerOnEvent = function addLayerOnEvent(evt) {
                    //Only add if the control is not on the map already
                   if (!entry.control._map) {
                        //Pass the event that triggered the control creation on to its options
                        entry.control.options.$event = evt;
                        that._map.addControl(entry.control);
                        that._map.invalidateSize();
                   }
                };
                if (Array.isArray(entry.addEvents)) {
                    entry.addEvents.map(function(event) {
                        that._map.on(event, entry.addLayerOnEvent);
                    });

                } else {
                    that._map.on(entry.addEvents, entry.addLayerOnEvent);
                }
            }

            if (entry.removeEvents && !entry.removeLayerOnEvent) {
                entry.removeLayerOnEvent = function removeLayerOnEvent() {
                    if (entry.control._map) {
                        that._map.removeControl(entry.control);
                        that._map.invalidateSize();
                    }
                };

                if (Array.isArray(entry.removeEvents)) {
                    entry.removeEvents.map(function(event) {
                        that._map.on(event, entry.removeLayerOnEvent);
                    });

                } else {
                    that._map.on(entry.removeEvents, entry.removeLayerOnEvent);
                }
            }
            return entry;
        });
    },
    _teardownControlEvents: function() {
        var that = this;
        this._controls.map(function(entry) {
            L.EventControls.prototype._tearDownControlEvent.call(that, entry);
        });
    },
    _tearDownControlEvent: function(entry) {
        var that = this;
        if (entry.addEvents && entry.addLayerOnEvent) {
            if (Array.isArray(entry.addEvents)) {
                entry.addEvents.map(function(event) {
                    that._map.off(event, entry.addLayerOnEvent);
                });

            } else {
                that._map.off(entry.addEvents, entry.addLayerOnEvent);
            }
            delete entry.addLayerOnEvent;
        }

        if (entry.removeEvents && entry.removeLayerOnEvent) {
            if (Array.isArray(entry.removeEvents)) {
                entry.removeEvents.map(function(event) {
                    that._map.off(event, entry.removeLayerOnEvent);
                });

            } else {
                that._map.off(entry.removeEvents, entry.removeLayerOnEvent);
            }
            delete entry.removeLayerOnEvent;
        }
        return entry;
    }
});

L.eventControls = function(options) {
    return new L.EventControls(options);
};

module.exports = L.EventControls;