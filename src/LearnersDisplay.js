module.exports = LearnersDisplay;

function LearnersDisplay(llama, element) {
  this.llama = llama;
  this.$div = $(element);

  this.$div.find('button').on('click', function (event) {
    llama.clearSelection(event, $(this));
  });
}

LearnersDisplay.prototype.update = function() {
  var $div = this.$div;
  var uids = this.llama.selectedLearners.array();
  var learners = this.llama.stream.array();

  if (uids.length > 0) {
    $div.show();
  } else {
    $div.hide();
  }

  var $proto = $div.find('.placeholder');
  $div.find('.unit').remove();

  for (var i = 0; i < uids.length; i++) {
    var learner = pickLearner(uids[i], learners);
    if (learner != null) {
      var $i = $proto.clone()
        .removeClass('placeholder hidden')
        .addClass('unit');
      $div.append($i);
      this.createBadge($i, uids[i], learner);
    }
  }
};

LearnersDisplay.prototype.createBadge = function($i, uid, learner) {
  var llama = this.llama;

  if (llama.config.userUrl) {
    $i.find('a').attr('href', llama.config.userUrl(uid));
  } else {
    $i.find('a').removeAttr('href');
  }

  $i.find('.name').text(learner.Email || learner.UserID);
  $i.find('.studentid').text(learner.StudentID || '');

  var stream = new llama.d3Stream(llama.displays.keys.array())
    .map(function (key, i) {
      return {
        x: key,
        p: +learner[key + ' Ratio'],
        e: +learner[key + ' Count'],
      };
    });

  var opt = {
    height: 20,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    transitionDuration: 0,
  };

  stream.display($i.find('.up'), opt, llama.d3)
    .domainBands('x', 'x')
    .barChart({ verticalVariable: 'p' });
  stream.display($i.find('.down'), opt, llama.d3)
    .domainBands('x', 'x')
    .barChartDownwards({ verticalVariable: 'e' });
};

function pickLearner(uid, learners) {
  for (var i = 0; i < learners.length; i++) {
    if (learners[i].UserID == uid) {
      return learners[i];
    }
  }
  return null;
}
