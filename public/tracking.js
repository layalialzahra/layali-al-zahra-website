/* Google Analytics and Meta Pixel bootstrap. Kept external to support a strict script-src policy. */
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-V3MD9PPDX4");

  var googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = "https://www.googletagmanager.com/gtag/js?id=G-V3MD9PPDX4";
  document.head.appendChild(googleTag);

  if (window.fbq) return;
  var n = window.fbq = function () {
    if (n.callMethod) n.callMethod.apply(n, arguments);
    else n.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  var pixel = document.createElement("script");
  pixel.async = true;
  pixel.src = "https://connect.facebook.net/en_US/fbevents.js";
  var firstScript = document.getElementsByTagName("script")[0];
  if (firstScript && firstScript.parentNode) firstScript.parentNode.insertBefore(pixel, firstScript);
  else document.head.appendChild(pixel);

  n("init", "1373529641289790");
  n("track", "PageView");
})();
