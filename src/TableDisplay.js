module.exports = TableDisplay;

function TableDisplay(llama, element) {
  var $div = $(element);
  var $a = $div.find('a');

  return llama.stream.display(element, {
    update: updateDownloadLinks(llama, $div, $a),
  })
    .table();
}

function updateDownloadLinks(llama, $div, $a) {
  return function (display, data) {
    $a.eq(0).attr('href', llama.config.apiUrl(llama.currentUnitFilter, true));
    $a.eq(1).attr('href', llama.config.apiUrl(llama.currentUnitFilter));
  };
}
