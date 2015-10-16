console.log('error_handler.js loaded');

var ErrorHandler = function() {
  var showError = ko.observable(false).subscribeTo("errorState");
};

module.exports = ErrorHandler;
