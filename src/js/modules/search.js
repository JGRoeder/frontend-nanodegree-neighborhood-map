console.log('search.js loaded');
var ko = require('knockout');
var _  = require('underscore');

/**
* @description Represents the Seach Controls
* @constructor
*/
var SearchViewModel = function() {
  var self = this;

  // should probably be inherited from some base
  this.errorState = ko.observable(false).publishOn("errorState");
  this.errorMessage = ko.observable().publishOn("errorText");
  this.isSearching = ko.observable(false).publishOn('searchStatus');

  // Bind a couple of our functions to execute in this view models context
  this.boundGetClick = this.getClick.bind(this);
  this.boundSuccess = this.success.bind(this);

  // rate limit - experienced strange geocoding behavior without it
  this.keyword = ko.observable().extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 100 } });
  this.keyword.subscribe(function(){this.performSearch(this.keyword());}, this);

  this.suggestions = ko.observable(null);
  this.location = ko.observable().publishOn('map-center');
  this.searchResult = ko.observable().publishOn('resolvedInput');

  this._init();

};

SearchViewModel.prototype.getClick = function (d,e) {
  this.publish(d);
  this.depopSuggestions();
};

SearchViewModel.prototype._init = function() {
  if ( this.geocoder ) {
    this.errorMessage("<p>There was a problem finding the location.</p><p>You should try refresing the page</p>");
    this.errorState(true);
  }

  if ( !google ) {
    this.errorMessage("<p>Unable to contact the geocoding service.</p><p>Make sure you are not blocking google owned addresses</p>");
    this.errorState(true);
    return;
  }

  this.geocoder = new google.maps.Geocoder();
};

/**
* @description Pass pass the first 5 results of our geocoding request to
* the pub/sub publication handler.
* NOTE: Allow this to fail silently as it should be prefectly clear to the user.
* zero results will be handled by infoViewModel.
*/
SearchViewModel.prototype.success = function( result, status ) {
  if ( status === 'OK' ) {
    var list = _.chain(result).first(5)
      .map(function(value){
        return value;
      }).value();

      this.populateSuggestions(list);
      this.isSearching(false);
  }
};

SearchViewModel.prototype.clearSearch = function() {
  this.keyword('');
  this.depopSuggestions();
};

SearchViewModel.prototype.populateSuggestions = function( list ) {
    this.suggestions(list);
};

SearchViewModel.prototype.depopSuggestions = function() {
   this.suggestions(null);
};

SearchViewModel.prototype.performSearch = function( keyword ) {
  this.isSearching(true);
  this.geocoder.geocode({'address': keyword }, this.boundSuccess );
};

SearchViewModel.prototype.publish = function(result) {
  this.location(result);
  this.searchResult(result);
};

module.exports = SearchViewModel;
