(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var contractorId = script.getAttribute('data-contractor-id');
  if (!contractorId) {
    console.warn('[BetterRoofing] Missing data-contractor-id');
    return;
  }

  var appUrl  = script.getAttribute('data-app-url') || script.src.replace('/tab-widget.js', '');
  var tabText = script.getAttribute('data-tab-text') || 'Get Instant Quote';
  var position = script.getAttribute('data-position') || 'right'; // 'right' | 'left'
  var embedUrl = appUrl + '/embed/' + contractorId;

  // Double-init guard
  if (document.getElementById('br-tab')) {
    console.warn('[BetterRoofing] Already initialized.');
    return;
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  var isLeft = position === 'left';

  var css = [
    '@keyframes br-pulse {',
    '  0%, 100% { box-shadow: 4px 0 0 0 rgba(249,115,22,0.5); }',
    '  50%       { box-shadow: 8px 0 0 8px rgba(249,115,22,0); }',
    '}',

    '#br-tab {',
    '  position: fixed;',
    '  top: 50%;',
    isLeft ? '  left: 0;' : '  right: 0;',
    '  transform: translateY(-50%) rotate(' + (isLeft ? '-90' : '90') + 'deg);',
    '  transform-origin: ' + (isLeft ? 'left' : 'right') + ' center;',
    '  background: #f97316;',
    '  color: #fff;',
    '  font: 700 13px/1 system-ui, -apple-system, sans-serif;',
    '  letter-spacing: 0.08em;',
    '  text-transform: uppercase;',
    '  padding: 12px 20px;',
    '  border-radius: 0 0 6px 6px;',
    '  z-index: 2147483646;',
    '  cursor: pointer;',
    '  transition: opacity 0.2s ease;',
    '  white-space: nowrap;',
    '  animation: br-pulse 2.5s ease-in-out infinite;',
    '  user-select: none;',
    '}',

    '#br-backdrop {',
    '  position: fixed;',
    '  inset: 0;',
    '  background: rgba(0,0,0,0.55);',
    '  z-index: 2147483645;',
    '  opacity: 0;',
    '  visibility: hidden;',
    '  transition: opacity 0.3s ease, visibility 0.3s ease;',
    '}',
    '#br-backdrop.br-open {',
    '  opacity: 1;',
    '  visibility: visible;',
    '}',

    '#br-panel {',
    '  position: fixed;',
    '  top: 0;',
    '  right: 0;',
    '  bottom: 0;',
    '  width: 420px;',
    '  max-width: 100vw;',
    '  background: #fff;',
    '  z-index: 2147483647;',
    '  display: flex;',
    '  flex-direction: column;',
    '  transform: translateX(100%);',
    '  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);',
    '  box-shadow: -4px 0 32px rgba(0,0,0,0.25);',
    '}',
    '#br-panel.br-open {',
    '  transform: translateX(0);',
    '}',
    '@media (max-width: 480px) {',
    '  #br-panel { width: 100vw; }',
    '}',

    '#br-panel-header {',
    '  background: #1c1917;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 14px 16px;',
    '  flex-shrink: 0;',
    '}',

    '#br-panel-title {',
    '  color: #f97316;',
    '  font: 700 14px/1 system-ui, -apple-system, sans-serif;',
    '  letter-spacing: 0.08em;',
    '  text-transform: uppercase;',
    '}',

    '#br-close {',
    '  background: none;',
    '  border: none;',
    '  color: #fff;',
    '  font-size: 18px;',
    '  line-height: 1;',
    '  cursor: pointer;',
    '  padding: 4px 8px;',
    '  opacity: 0.7;',
    '  transition: opacity 0.15s ease;',
    '}',
    '#br-close:hover { opacity: 1; }',

    '#br-iframe {',
    '  flex: 1;',
    '  width: 100%;',
    '  border: none;',
    '  display: block;',
    '}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── DOM ───────────────────────────────────────────────────────────────────
  var tab = document.createElement('div');
  tab.id = 'br-tab';
  tab.textContent = tabText;

  var backdrop = document.createElement('div');
  backdrop.id = 'br-backdrop';

  var panel = document.createElement('div');
  panel.id = 'br-panel';

  var header = document.createElement('div');
  header.id = 'br-panel-header';

  var title = document.createElement('span');
  title.id = 'br-panel-title';
  title.textContent = 'Get Instant Quote';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'br-close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close');

  header.appendChild(title);
  header.appendChild(closeBtn);

  var iframe = document.createElement('iframe');
  iframe.id = 'br-iframe';
  iframe.allow = 'geolocation';
  iframe.title = 'Roofing Instant Quote';

  panel.appendChild(header);
  panel.appendChild(iframe);

  document.body.appendChild(tab);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  // ── State ─────────────────────────────────────────────────────────────────
  var iframeLoaded = false;

  function open() {
    if (!iframeLoaded) {
      iframe.src = embedUrl;
      iframeLoaded = true;
    }
    backdrop.classList.add('br-open');
    panel.classList.add('br-open');
    tab.style.opacity = '0';
    tab.style.pointerEvents = 'none';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    backdrop.classList.remove('br-open');
    panel.classList.remove('br-open');
    tab.style.opacity = '';
    tab.style.pointerEvents = '';
    document.body.style.overflow = '';
  }

  // ── Events ────────────────────────────────────────────────────────────────
  tab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // Pause pulse on hover
  tab.addEventListener('mouseenter', function () {
    tab.style.animationPlayState = 'paused';
  });
  tab.addEventListener('mouseleave', function () {
    tab.style.animationPlayState = '';
  });
})();
