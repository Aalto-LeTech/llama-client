module.exports = ProgressDisplay;

function ProgressDisplay(llama, element) {
  var $div = $(element);
  var $pop = $div.find('.llama-detail').hide();

  return llama.stream.display(element, {
    select: selectLogic(llama, $div, $pop)
  }, llama.d3)
    .repeat(llama.displays.keys)
    .map(function (pair, i) {
      var countKey = pair[1] + ' Count';
      var ratioKey = pair[1] + ' Ratio';

      return new llama.d3Stream(pair[0])
        .group([
          function (d) { return +d[countKey] == 0; },
          function (d) { return +d[ratioKey] < 0.9; },
          function (d) { return true; },
        ])
        .map(function (group, i) {
          return {
            x: pair[1],
            y: group.length,
            z: 0,
            group: i,
            payload: group,
          };
        })
        .array();
    })
    .domainBands('x', 'x')
    .addAxis('x', 'y')
    .stackedBarChart({ reverseStack: true })
    .labels(llama.config.progressLabels);
}

function selectLogic(llama, $div, $pop) {
  return {

    over: function (select, data) {
      var position = llama.d3.mouse($div[0]);
      $pop.show()
        .css('left', (position[0] + 15) + "px")
        .css('top', position[1] + "px");
      var group = data.payload;
      var countKey = data.x + ' Count';
      var ratioKey = data.x + ' Ratio';
      var submissions = group.map(function(d) { return d[countKey]; });
      var ratios = group.map(function(d) { return d[ratioKey]; });
      $pop.find('.number').text(group.length);
      $pop.find('.submissions').text(llama.d3.min(submissions) + ' - ' + llama.d3.max(submissions));
      $pop.find('.ratio').text(per(llama.d3.min(ratios)) + ' - ' + per(llama.d3.max(ratios)));
    },

    out: function (select, data) {
      $pop.hide();
    },

    click: function (select, data) {
      llama.selectedLearners.empty();
      var groups = select.selected;
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i].payload;
        for (var j = 0; j < group.length; j++) {
          var id = group[j].UserID;
          if (!llama.selectedLearners.contains(id)) {
            llama.selectedLearners.add(id);
          }
        }
      }
      llama.displays.learners.update();
    },
  };
}

function per(val) {
  return Math.round(val * 100) + '%';
}
