console.log('baseViewModel.js loaded');
var ko = require('knockout');
var knockout_postbox = require('knockout-postbox');

var BaseViewModel = function() {
  this.isError = ko.observable(false).publishOn("errorState");
  this.errText = ko.observable().publishOn('errorText');
};

module.exports = BaseViewModel;
