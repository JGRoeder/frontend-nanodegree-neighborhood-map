var $ = require('jquery');
var ko = require('knockout');

console.log('customMarker.js loaded');


/**
* @description Creates a custom google maps marker and defines the behaviors
* necessary to display it on the map, animate, and remove it.
* @constructor
* @param {Object} An object containing options ( generally identical to those
* taken by google.maps.marker())
*/
var CustomMarker = function(options) {
  this.setValues(options);
  // categories for color coding markers
  this.categories = {
    '107': "monument",
    '108': "historic",
    '109': "natural",
    '110': "historic",
    '111': "monument",
    '112': "natural",
    '113': "natural",
    '114': "natural",
    '115': "natural",
    '116': "natural",
    '117': "natural"
  };
};

// copy the OverlayView prototype which governs most of our markers behaviors
// please see google maps documentation for more info.
CustomMarker.prototype = new google.maps.OverlayView();

/**
* @description Constructs the div for injection into our map, and appends it.
*/
CustomMarker.prototype.draw = function() {
  var self = this;
  var div = this.div;
  if (!div) {
    div = this.div = $('' +
            '<div class="marker marker-' + this.categories[this.category] + '">' +
            '<div class="shadow" data-bind="visible: testo"></div>' +
            '<div class="pulser"></div>' +
            '<div class="pin-wrap">' +
            '<div class="pin"></div>' +
            '</div>' +
            '</div>' +
            '')[0];

    this.marker = $(this.div.getElementsByClassName('marker'));
    this.pinwrap = $(this.div.getElementsByClassName('pin-wrap'));
    this.pulser = $(this.div.getElementsByClassName('pulser'));
    this.pin = $(this.div.getElementsByClassName('pin'));
    this.pinShadow = $(this.div.getElementsByClassName('shadow'));
    div.style.position = 'absolute';
    div.style.cursor = 'pointer';

    // Wether or not our marker is currently selected
    this.selected = false;
    var panes = this.getPanes();
    panes.overlayImage.appendChild(div);

    // trigger provided events within this objects context
    google.maps.event.addDomListener(div, 'webkitAnimationEnd', function(event){
      google.maps.event.trigger(self,'webkitAnimationEnd',event);
    });
    google.maps.event.addDomListener(div, 'click', function(event) {
      google.maps.event.trigger(self, 'click', event);
    });
  } //endif

  var point = this.getProjection().fromLatLngToDivPixel(this.position);
  if (point) {
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';
  }
};

/**
* @description returns the position of the marker ( positions is required as part
of the options which are extend to CustomMarker via setValues in the constructor)
*/
CustomMarker.prototype.getPosition = function() {
  return this.position;
};

CustomMarker.prototype.wobble = function() {
  this.pinwrap.addClass('wobbly');
  this.select();
};

CustomMarker.prototype.stopWobble = function() {
  this.pinwrap.removeClass('wobbly');
};

CustomMarker.prototype.select = function() {
  var pulser = $(this.pulser);
  pulser.addClass("pulse");
  this.selected = true;
};

CustomMarker.prototype.deselect = function() {
  var pulser = $(this.pulser);
  pulser.removeClass('pulse');
  this.selected = false;
};

CustomMarker.prototype.remove = function() {
  this.setMap(null);
  $(this.div).remove();
};


module.exports = CustomMarker;
