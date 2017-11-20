module.exports = LlamaClient;

var KeysDisplay = require('./KeysDisplay.js');
var LearnersDisplay = require('./LearnersDisplay');
var Factory = {
  '#llama-view-progress': require('./ProgressDisplay.js'),
  '#llama-view-trajectories': require('./TrajectoriesDisplay.js'),
  '#llama-view-table': require('./TableDisplay.js'),
};

function LlamaClient(options) {

  var defaults = {
    progressLabels: ['Not submitted', '< 90% points', '>= 90% points'],
  };

  this.config = $.extend({}, defaults, options);
  if (typeof this.config.apiUrl != 'function') {
    throw new Error('Llama Client requires apiUrl (function) in options argument!');
  }

  this.stream = new d3Stream();
  this.filterTagIds = new d3Stream();
  this.selectedLearners = new d3Stream();
  this.displays = {
    keys: new KeysDisplay(this, '#llama-unit-select'),
    learners: new LearnersDisplay(this, '#llama-view-learners'),
  };
  this.currentDisplay = undefined;
  this.currentUnitFilter = undefined;

  var llama = this;
  $('#llama-view-select .nav a').on('click', function(event) {
    llama.changeView(event, $(this));
  });
  $('#llama-filter-tags button').on('click', function(event) {
    llama.toggleFilter(event, $(this));
  });

  this.load('#all');//(window.location.hash || '#all');
  this.displayView('#llama-view-progress');
}

LlamaClient.prototype.load = function(filter) {
  this.currentUnitFilter = filter;
  this.stream.load(this.config.apiUrl(filter));
};

LlamaClient.prototype.changeUnit = function(event, $a) {
  $('#llama-unit-select .nav').find('.active').removeClass('active');
  $a.parent().addClass('active');
  this.load($a.attr('href'));
};

LlamaClient.prototype.changeView = function(event, $a) {
  event.preventDefault();
  $('#llama-view-select .nav').find('.active').removeClass('active');
  $a.parent().addClass('active');
  this.displayView($a.attr('href'));
};

LlamaClient.prototype.toggleFilter = function(event, $b) {
  var id = $b.attr('data-id');
  if (this.filterTagIds.contains(id)) {
    this.filterTagIds.remove(id);
    $b.find('.glyphicon').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
  } else {
    this.filterTagIds.add(id);
    $b.find('.glyphicon').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
  }
  this.filterStream();
};

LlamaClient.prototype.clearSelection = function(event, $b) {
  this.selectedLearners.empty();
  this.displays.learners.update();
  this.displays[this.currentDisplay].update();
};

LlamaClient.prototype.filterStream = function() {
  if (this.filterTagIds.data.length > 0) {
    var llama = this;
    this.stream.reset().filter(function (d) {
      return llama.filterTagIds.containedIn(d.Tags.split('|'));
    });
  } else {
    this.stream.reset();
  }
  this.displays.learners.update();
};

LlamaClient.prototype.displayView = function(id) {
  for (var key in Factory) {
    if (key[0] == '#') {
      $(key).hide();
    }
  }
  $(id).show();
  if (this.displays[id] == undefined) {
    this.displays[id] = new Factory[id](this, id);
  } else {
    this.displays[id].update();
  }
  this.currentDisplay = id;
};
