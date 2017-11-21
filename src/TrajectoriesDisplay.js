module.exports = TrajectoriesDisplay;

function TrajectoriesDisplay(llama, element) {
  return llama.stream.display(element, {
      height: 350,
      selectPlot: true,
      update: selectCurrent(llama, element),
      select: selectLogic(llama),
    })
    .cross(llama.displays.keys)
    .mapAsStreams(function (row) {
      return row
        .filter(function (pair) {
          return pair[0][pair[1] + ' Count'] > 0;
        })
        .map(function (pair) {
          return {
            x: pair[1],
            y: +pair[0][pair[1] + ' Total'],
            z: +pair[0][pair[1] + ' Count'],
            payload: pair[0],
          };
        })
        .cumulate('y');
    })
    .domainIQR('z')
    .domainBands('x', 'x', llama.displays.keys)
    .addAxis('x', 'y')
    .lineChart({ curveLine: true });
}

function selectCurrent(llama, element) {
  return function (display, data) {
    var uids = llama.selectedLearners.array();
    d3.select(element)
      .selectAll('.d3stream-plot')
      .select('.d3stream-dot')
      .each(function (d) {
        if (llama.selectedLearners.contains(d.payload.UserID)) {
          d3.select(this.parentNode).classed('d3stream-selection', true);
          display.select.select(d.payload);
        }
      });
  };
}

function selectLogic(llama) {
  return {
    click: function (select, data) {
      var id = data.payload.UserID;
      if (!llama.selectedLearners.contains(id)) {
        llama.selectedLearners.add(id);
      } else {
        llama.selectedLearners.remove(id);
      }
      llama.displays.learners.update();
    },
  };
}
