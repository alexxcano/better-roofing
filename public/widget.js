(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var contractorId = script.getAttribute('data-contractor-id');
  if (!contractorId) {
    console.warn('[BetterRoofing] Missing data-contractor-id attribute on widget script.');
    return;
  }

  var baseUrl = script.src.replace('/widget.js', '');

  var container = document.getElementById('roof-estimator');
  if (!container) {
    console.warn('[BetterRoofing] Could not find #roof-estimator element.');
    return;
  }

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/' + contractorId;
  iframe.title = 'Roofing Instant Quote';
  iframe.allow = 'geolocation';
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';

  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.display = 'block';
  iframe.style.minHeight = '550px';

  // Auto-resize iframe height via postMessage
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'betterroofing:resize') {
      iframe.style.height = event.data.height + 'px';
    }
  });

  container.appendChild(iframe);
})();
