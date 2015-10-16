
var $ = require('jquery');
var ko = require('knockout');
var _  = require('underscore');
var knockout_postbox = require('knockout-postbox');
var CustomMarker = require('./viewmodels/customMarker.js'); // might be removable

/**
* @description Represents our app in entirety
* @constructor
*/
var AppViewModel = function() {
  var self = this;

  this.showError = ko.observable(false).subscribeTo("errorState");
  this.errText = ko.observable("Application failed to load. Please try reloading the page.").subscribeTo("errorText");

  // Custom Binding Handlers

  // Scroll Visible
  // slides element up or down based on a passed value ( valueAccessor)
  ko.bindingHandlers.slideVisible = {
    update: function(element, valueAccessor, allBindings) {
      var value = valueAccessor();
      var valueUnwrapped = ko.unwrap(value);
      if(valueUnwrapped === true) {
        $(element).slideDown();
      } else {
        $(element).slideUp();
      }
    }
  };

  // Info Click
  // Handles animation and selection of markers when location items are clicked
  // Also handles the scrolling of the location list, to bring selected item
  // into view.
  ko.bindingHandlers.infoClick = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext ) {
      var locations = $(bindingContext.$component.locations());
      var marker = ko.utils.unwrapObservable(valueAccessor());

      // Toggle all locations closed excluding the one which was clicked
      $(element).click(function(){
        _.each(locations, function(location){
          if( location !== bindingContext.$data ) {
            location.viewState(false);
          }
        });
        // If location item isn't already selected, select it, and trigger
        // click ont he associated marker
        if( !bindingContext.$data.viewState()) {
          bindingContext.$data.select();
          $(marker.div).click();
        }

        // Scroll to a specific element in the list ( uses hardcoded height )
        // TODO: make this more general, eliminate hardcoded height.
        var el = $(this);
        el.parents('.list-container').animate({
          scrollTop: ( ( el.prevAll().length * 138 ) + 'px' )
        });
      });
    }
  };

  // Register Components
  ko.components.register('map', {
    viewModel: require('./modules/map.js'),
    template: require('fs').readFileSync('src/templates/map.tpl.html', 'utf8')
  });

  ko.components.register('search', {
    viewModel: require('./modules/search.js'),
    template: require('fs').readFileSync('src/templates/search.tpl.html', 'utf8')
  });

  ko.components.register('info', {
    viewModel: require('./modules/info.js'),
    template: require('fs').readFileSync('src/templates/info.tpl.html', 'utf8')
  });

};

$(document).ready(function(){
  ko.applyBindings(new AppViewModel());
});

// Fairly unneccesary atm
$(window).load(function(){
	$('#preloader').fadeOut('slow',function(){$(this).remove();});
});
