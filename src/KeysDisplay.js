module.exports = KeysDisplay;

function KeysDisplay(llama, element) {
  var $nav = $(element + ' .nav');
  $nav.find('.all a').on('click', changeUnit(llama));

  return llama.stream.display(element)
    .keys()
    .filter(function (d) {
      return d.substr(d.length - 6) == ' Count';
    })
    .map(function (d) {
      return d.substr(0, d.length - 6);
    })
    .addFrame(keysFrame(llama, $nav));
}

function keysFrame(llama, $nav) {
  return function (display, data, options) {
    if (data.length > 0) {
      var $proto = $nav.find('.placeholder');

      if (llama.currentUnitFilter == '#all') {
        $nav.find('.unit').remove();

        var units = data[0];
        for (var i = 0; i < units.length; i++) {
          var $i = $proto.clone()
            .removeClass('placeholder hidden')
            .addClass('unit');
          $i.find('a')
            .attr('href', '#' + units[i])
            .text(units[i])
            .on('click', changeUnit(llama));
          $nav.append($i);
        }
      }
      llama.displays.learners.update();
    }
  };
}

function changeUnit(llama) {
  return function (event) {
    llama.changeUnit(event, $(this));
  };
}
