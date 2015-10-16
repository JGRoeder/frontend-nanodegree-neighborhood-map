var ko = require('knockout');
var $ = require('jquery');
var _ = require('underscore');

/**
* @description Respresents a single location
* @constructor
* @param {Object} A single object from a response returned by the Factual API
* in InfoViewModel setLocations ( info.js )
*/
var LocationViewModel = function(value) {
  this.address = value.locality + ' ' + value.region + ' ' + value.country.toUpperCase() || value.region + ' ' + value.country.toUpperCase() || value.country.toUpperCase() || "Inexact Location";
  this.name = value.locality + ' ' + value.region || value.locality || value.region || "Point of Interest";
  this.query = value.name + ' ' + value.locality || value.name || false;
  this.article = ko.observable(null);
  this.articleUri = ko.observable(false);
  this.photos = ko.observable(false);
  this.viewState = ko.observable(false);
  this.selected = ko.observable(false);
  this.marker = null;
};

/**
* @description Creates a custom google maps marker and defines the behaviors
* necessary to display it on the map, animate, and remove it.
* @constructor
* @param {Object} An object containing options ( generally identical to those
* taken by google.maps.marker())
*/
LocationViewModel.prototype.select = function() {
  if (this.viewState() === false ) {
    this.viewState(true);
  } else {
    this.viewState(false);
  }
};

module.exports = LocationViewModel;
