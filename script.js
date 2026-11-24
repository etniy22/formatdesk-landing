// FormatDesk — витрина Lo-Fi прототипа: переключение экранов по шагам
(function () {
  var img = document.getElementById('vitrina-img');
  var cap = document.getElementById('steps-cap');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  if (!img || !cap || !steps.length) return;

  steps.forEach(function (step) {
    step.addEventListener('click', function () {
      steps.forEach(function (s) { s.classList.remove('is-active'); });
      step.classList.add('is-active');
      var shot = step.getAttribute('data-shot');
      var text = step.getAttribute('data-cap');
      if (shot) img.src = shot;
      if (text) cap.textContent = text;
    });
  });
})();
