var $ = require('jquery');
var ko = require('knockout');
var _  = require('underscore');
var knockout_postbox = require('knockout-postbox');
var CustomMarker = require('../viewmodels/customMarker.js');

/**
* @description Represents the Map View
* @constructor
*/
var MapViewModel = function(){
  var self = this;
  var mapOptions = {
    center: {lat: 42.352711, lng: -83.099205},
    zoom: 12,
    disableDefaultUI: true
  };

  // Subscribe to search results published by InfoViewModel in info.js
  // Array of locations ( see locationViewModel.js ) extended with results
  // from factual API request in InfoViewModel.setLocations()
  this.pois = ko.observable().subscribeTo('SearchResults');

  // When pois is updated via infoviewmodel, call method mapPoints on the array of pois
  this.pois.subscribe(function(){this.mapPoints(this.pois());}, this);
  this.markers = ko.observableArray([]);
  this.lastSelected = false;
  this.bounds = null;
  this.offset = $(window).width() > 980 ? -240 : 0;
  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Store an offset for the info panel based on window size
  google.maps.event.addDomListener(window, 'resize', _.debounce(function(){
      self.offset = $(window).width() > 980 ? -240 : 0;
  }, 150));

  // subscribe to map-center as provided by our SearchViewModel in search.js
  this.location = ko.observable().subscribeTo('map-center');
  this.location.subscribe(function(){
    this.updateCenter();
  }, this);
};


/**
* @description Triggers events necessary to diplay markers at provided search location
* @param {Array.<Object>} provided by this.pois.subscribe, array of locations
* ( see locationViewModel.js ) extended with Factual API location data.
*/
MapViewModel.prototype.mapPoints = function(points) {

  this.clearMarkers();
  // create a new bounds object to refresh bounds for each search results
  // this is necessary to properly center the map for each search.
  this.bounds = new google.maps.LatLngBounds();
  this.createMarkers(points);
  this.updateCenter();
};

/**
* @description Constructs markers and associated objects for display on the map
* also applies google.maps specific event handlers
* @param {Array.<Object>} provided by this.pois.subscribe, array of locations
* ( see locationViewModel.js ) extended with Factual API location data.
*/
MapViewModel.prototype.createMarkers = function(locations) {
  var self = this;

  // Sort out locations by latitude to stack them front to back when displayed
  // on google maps. Then return to this.markers an array of locations, extended
  // with our markers, infowindow and event handlers.
  this.markers(_.chain(locations).sortBy('latitude').reverse().map(function(location){
    // create an info window for each marker
    var infoWindow = new google.maps.InfoWindow({
      content: '' +
            '<div class="infowindow">' +
              '<h4 class="iw_title">' + location.name + '</h4>' +
              '<p class="iw_addr_1">' + location.address + '</p>' +
              '<p class="iw_addr_2">' + location.locality + ' ' + location.region + ' ' + location.country + ' ' + location.postcode + '</p>' +
              '<h5>Category:</h5>' +
              '<p class="iw_cat_1">' + location.category_labels[0][0] + '</p>' +
              '<p class="iw_cat_2">' + location.category_labels[0][1] + '</p>' +
            '</div>' +
            '',
      pixelOffset: new google.maps.Size(0, -45)
    });

    // create the marker itself, set its position and associate our map and info window
    var marker = new CustomMarker({
      position: new google.maps.LatLng(location.latitude, location.longitude),
      map: this.map,
      infowindow: infoWindow,
      category: location.category_ids[0]
    });

    // Apply maps specific event handlers
    // TODO: These could probably be handled in ko.bindingHandlers
    google.maps.event.addListener(marker, 'click', function() {

      // updated map center to the markers position
      self.updateCenter(marker.position);

      // close all infowindows
      var element = $('#' + location.factual_id);
      _.each(self.markers(), function(value){
        value.infowindow.close();
      });

      // open infowindow of the clicked element
      marker.infowindow.open(marker.map, marker);

      // trigger markers wobble animation
      if(this !== self.lastSelected) {
        if(self.lastSelected) {
          self.lastSelected.deselect();
        }
        this.wobble();
        self.lastSelected = this;
        element.children().first().click();
      }
    });

    // handler to remove the css class used for animation after the animation
    // has finished.
    // TODO: Handle additional vendor prefixes
    google.maps.event.addListener(marker, 'webkitAnimationEnd', function(){
      this.stopWobble();
    });
    location.marker = marker;
    self.bounds.extend(marker.position);
    return marker;
  }, this).value());
};


/**
* @description Calls each markers remove method - defined within CustomMarker
* constructor in customMarker.js. Calls setMap(null), and then removes the markers
* associated div from the dom. Finally, set this.markers to an empty array.
*/
MapViewModel.prototype.clearMarkers = function() {
  _.each(this.markers(), function(value){
    value.remove();
  });
  this.markers([]);
};

/**
* @description Controls the centering of our map on the bounds of our markers
* or our search location if no markers are present.
* @param <Object> a google maps latlng object or latlng object literal
* TODO: general restructure, this is messy.
*/
MapViewModel.prototype.updateCenter = function (discretePoint) {

  // Reduce All lat/lng property values of this.bounds to a single number by adding them together
  var hasBounds = _.chain(this.bounds).map(_.values).flatten().reduce(function(a,b){return a+b;}).value();
  var hasLocation = this.location() || false;

  // Force panning to a discrete point - handy for centering selected markers
  if(discretePoint) {
    this.map.panTo(discretePoint);
    this.map.panBy(this.offset,0); // apply an offset for our info panel
    return;
  }

  // if hasBounds is 0 ( or didn't exist) our location likely didn't have any pois,
  // so use the default search location to center the map instead
  if ( hasBounds ) {
    this.map.fitBounds(this.bounds);
    this.map.panBy(this.offset,0); // apply an offset for our info panel
    return;
  }

  if ( hasLocation && this.location().geometry.bounds ) {
    this.map.fitBounds(this.location().geometry.bounds);
  } else if ( hasLocation && this.location().geometry.location ) {
    this.map.setCenter(this.location().geometry.location);
  }
  this.map.panBy(this.offset,0); // apply an offset for our info panel

};

module.exports = MapViewModel;
