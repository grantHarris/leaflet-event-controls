'use strict';

describe('L.EventControls', function() {

    let L, map, control1, control2;

    beforeEach(() => {
        L = require('leaflet')
        L.EventControls = require('../src/L.EventControls.js');
        map = {
            on: jasmine.createSpy(),
            off: jasmine.createSpy(),
            addControl: jasmine.createSpy().and.callFake(function(control) {
                control._map = map;
            }),
            removeControl: jasmine.createSpy(),
            invalidateSize: jasmine.createSpy(),
        };
        control1 = {
            options: {}
        };

        control2 = {
            options: {}
        };
    });

    it('Basic test. Adding control with remove/add event', function() {
        var ec = L.eventControls();

        //Start with _controls set to []
        expect(ec._controls.length).toBe(0);

        //Should return this
        expect(ec.addTo(map)).toBe(ec);

        //String based events
        ec.addTo(map).addControl(control1, 'add', 'remove');
        ec.addTo(map).addControl(control2, 'add_second', 'remove_second');

        //Add it
        expect(map.on).toHaveBeenCalled();
        expect(map.on).toHaveBeenCalledWith('add', ec._controls[0].addLayerOnEvent);
        expect(map.on).toHaveBeenCalledWith('remove', ec._controls[0].removeLayerOnEvent);

        var event = {
            'fake': 'event'
        };

        //Trigger the on add event
        ec._controls[0].addLayerOnEvent(event);
        expect(control1.options.$event).toBe(event);

        expect(map.addControl).toHaveBeenCalled();
        expect(map.addControl).toHaveBeenCalledWith(control1);
        expect(map.invalidateSize).toHaveBeenCalled();

        //Trigger the on remove event for first ctrl
        ec._controls[0].removeLayerOnEvent(event);
        expect(map.removeControl).toHaveBeenCalled();
        expect(map.removeControl).toHaveBeenCalledWith(control1);
        expect(map.invalidateSize).toHaveBeenCalled();

        //Remove from map. Tear down
        expect(ec.removeFrom(map)).toBe(ec);
        expect(ec._map).toBe(undefined);

    });

    it('Adding control with multiple remove/add events', function() {
        var ec = L.eventControls();

        //Array based events
        ec.addTo(map).addControl(control1, ['add', 'foo'], ['remove', 'bar']);

        //Add it
        expect(map.on).toHaveBeenCalled();
        expect(map.on).toHaveBeenCalledWith('add', ec._controls[0].addLayerOnEvent);
        expect(map.on).toHaveBeenCalledWith('foo', ec._controls[0].addLayerOnEvent);
        expect(map.on).toHaveBeenCalledWith('remove', ec._controls[0].removeLayerOnEvent);
        expect(map.on).toHaveBeenCalledWith('bar', ec._controls[0].removeLayerOnEvent);

        // Remove it
        expect(ec._controls.length).toBe(1);
        ec.removeControl(control1);

        expect(map.off).toHaveBeenCalled();

        /* 
        Have to use jasmine.any(Function), as addLayerOnEvent and removeLayerOnEvent
        are gone by the time we have a chance to expect
        */
        expect(map.off).toHaveBeenCalledWith('add', jasmine.any(Function));
        expect(map.off).toHaveBeenCalledWith('foo', jasmine.any(Function));
        expect(map.off).toHaveBeenCalledWith('remove', jasmine.any(Function));
        expect(map.off).toHaveBeenCalledWith('bar', jasmine.any(Function));
        expect(ec._controls.length).toBe(0);

    });


});