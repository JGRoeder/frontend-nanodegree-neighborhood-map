var ko = require('knockout');
var knockout_postbox = require('knockout-postbox');
var $ = require('jquery');
var _  = require('underscore');
var LocationObject = require('../viewmodels/locationViewModel.js');

/**
* @description Represents the Info Window(list) view
* @constructor
*/
var InfoViewModel = function() {
  this.errorState = ko.observable(false).publishOn("errorState");
  this.errorMessage = ko.observable().publishOn("errorText");
  this.boundSuccess = this.success.bind(this);
  this.locations = ko.observableArray().publishOn("SearchResults");
  this.articleLink = null;
  this.empty = ko.observable(false);
  this.viewList = ko.observable(false);
  this.searchLocation = ko.observable().subscribeTo('resolvedInput');
  this.searchLocation.subscribe(function(searchLocation){
    this.getLocations(searchLocation);
  }, this);

};

/**
* @description calls the provided cb on a response object within the context
* of the InfoViewModel
* @param {Object} data - An ajax request response object
* @param {requestCallback} cb - a callback function
*/
InfoViewModel.prototype.success = function (data, cb) {
  if ( data.status === "ok" && data.response.data.length > 0 ) {
    this.empty(false); // set false to diplay 0 result notice
    this.viewList(true); // make or locations list visible because we executed a search that had results
    cb.call(this, data);
  } else if (data.response.data.length <= 0 ) {
    this.empty(true); // set true to hide 0 result notice
    this.locations([]); // empty locations from previous serach
  } else {
    this.errorMessage('Unrecognized response from Factual API, please try refreshing the browser.');
    this.errorState(true);
  }
};

InfoViewModel.prototype.request = function(url) {
  var request = $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: url
  });

  return request;
};

/**
* @description Toggle visibility of the locations list
*/
InfoViewModel.prototype.showList = function() {
  if(this.viewList() === false ) {
    this.viewList(true);
  } else {
    this.viewList(false);
  }
};

/**
* @description Fetch related articles from wikipedia
* @param {Object} location - An location object ( locationViewModel.js ) which
* has been extended with properties from Factual API landmark data.
* TODO: currently gets crazy/undesirable results in too many cases. Might be a
* way to improve it by using geo data. Or the NRHP could bring back their API.
* Wouldn't that be handy?
* NOTE: Articles are optional as coverage is spotty, no need to display an error
* here.
*/
InfoViewModel.prototype.setArticles = function(location) {
  var request = this.request('http://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&list=search&format=json&srlimit=1&callback=?&srsearch=' + location.query);

  request.done(function(results){
    var hasItems = results.query.search.length > 0;
    var snippet = hasItems ? results.query.search[0].snippet : false;
    var articleUri = hasItems ? results.query.search[0].title : false;
    location.article(snippet);

    if(typeof articleUri === 'string') {
      location.articleUri('http://www.wikipedia.org/wiki/' + articleUri.replace(/\s/g, "_"));
    }
  });
};

/**
* @description Retrieves/Build static links to location bound photos from the
* flicker API and appends them to the provided location object.
* @param {Object} location - An location object ( locationViewModel.js ) which
* has been extended with properties from Factual API landmark data.
* TODO: Currenly storing up to 5 photos/thumbnails for each location, but have
* not yet implement a method to view the full photos.
* NOTE: Photos are optional as coverage is spotty, no need to display an error
* here.
*/
InfoViewModel.prototype.setPhotos = function(location) {
  var queryString = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=efb2e7ae89e178d645301e36391aee03&text=' + location.name.replace(/\s/g,'+') + '&lat=' + location.latitude + '&lon=' + location.longitude + '&radius=10&format=json&jsoncallback=?';
  var request = this.request(queryString);

  request.done(function(results){
    if( results.photos.photo.length > 0 ) {
      location.photos(_.chain(results.photos.photo).first(5).map(function(value){
        return {
          thumb: 'http://farm' + value.farm + '.staticflickr.com/' + value.server + '/' + value.id + '_' + value.secret + '_s.jpg',
          photo: 'http://farm' + value.farm + '.staticflickr.com/' + value.server + '/' + value.id + '_' + value.secret + '_s.jpg'
        };
      }).value());
    }
  });
};

/**
* @description Populates this.locations array with new Location objects generated
* using data from an ajax response object. Also fills in all undefined properties
* with the properties of the response object
@param {Object} data - An ajax request response
*/
InfoViewModel.prototype.setLocations = function(data) {
  var self = this;
  // empty our locations array
  self.locations.removeAll();

  // create a new location object for each object in the response, and extend
  // any undefined properties in the location object, with those from the reponse
  self.locations(_.map(data.response.data, function(value){
    var newLocation = _.defaults(value, new LocationObject(value));
    self.setArticles(newLocation);
    self.setPhotos(newLocation);

    // returning the location includes it in the array returned by map
    return newLocation;
    })
  );
};

/**
* @description Performs a request against the factual API limiting results to
* historical, cultural and natural landmarks, in a circularly boundry with a
* 5000 meter radius from our searched location.
*/
InfoViewModel.prototype.getLocations = function () {
  var self = this;
  var apikey = 'ZY3UJZH0EoGyjvONJTVdNX9ZYPdZmyhaaIyvHpdV';
  var urlString = 'http://api.factual.com/t/places?filters={"category_ids":{"$includes_any":[110,111,112]}}&geo={"$circle":{"$center":[' + this.searchLocation().geometry.location.lat() + ',' + this.searchLocation().geometry.location.lng() + '],"$meters":5000}}&KEY=' + apikey;

  $.getJSON( urlString, function(data){ self.boundSuccess(data, self.setLocations);}).fail(function(d, textStatus, error) {
    this.errorMessage("Unable to complete request against Factual database. Please try reloading the page.");
    this.errorState(true);
  });
};

module.exports = InfoViewModel;
