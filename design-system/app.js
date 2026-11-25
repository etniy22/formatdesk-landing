/* FormatDesk Design System · интерактив сайта дизайн-системы */
(function () {
  'use strict';

  /* ---------- Hash-навигация по разделам ---------- */
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.topnav a'));

  function route() {
    var hash = (location.hash || '#/').replace('#/', '').split('?')[0];
    var found = false;
    pages.forEach(function (p) {
      var on = p.dataset.page === hash || (!hash && p.dataset.page === '');
      p.classList.toggle('active', on);
      if (on) found = true;
    });
    if (!found && pages.length) pages[0].classList.add('active');
    var current = found ? hash : '';
    navLinks.forEach(function (a) {
      var target = a.getAttribute('href').replace('#/', '');
      a.classList.toggle('active', target === current);
    });
    if (found) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  /* ---------- Вкладки (стрелки клавиатуры) ---------- */
  document.querySelectorAll('.fd-tabs').forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.fd-tab'));
    var panelsId = tablist.dataset.panels;
    var panels = panelsId ? Array.prototype.slice.call(document.querySelectorAll('#' + panelsId + ' .fd-tabpanel')) : [];

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (j !== null) { e.preventDefault(); tabs[j].focus(); select(tabs[j]); }
      });
    });
    if (tabs.length) select(tabs.find(function (t) { return t.getAttribute('aria-selected') === 'true'; }) || tabs[0]);
  });

  /* ---------- Диалог: открытие, Esc, возврат фокуса ---------- */
  var lastFocused = null;

  function openDialog(dlg) {
    lastFocused = document.activeElement;
    dlg.hidden = false;
    var focusable = dlg.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
    document.addEventListener('keydown', onDialogKey);
  }
  function closeDialog(dlg) {
    dlg.hidden = true;
    document.removeEventListener('keydown', onDialogKey);
    if (lastFocused) lastFocused.focus();
  }
  function onDialogKey(e) {
    var dlg = document.querySelector('.fd-dialog-wrap:not([hidden])');
    if (!dlg) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(dlg); }
    if (e.key === 'Tab') {
      var focusables = dlg.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  document.querySelectorAll('[data-dialog-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openDialog(document.getElementById(btn.dataset.dialogOpen));
    });
  });
  document.querySelectorAll('.fd-dialog-wrap').forEach(function (dlg) {
    dlg.addEventListener('mousedown', function (e) { if (e.target === dlg) closeDialog(dlg); });
    dlg.querySelectorAll('[data-dialog-close]').forEach(function (b) {
      b.addEventListener('click', function () { closeDialog(dlg); });
    });
  });

  /* ---------- Меню: клик, клавиатура, закрытие снаружи ---------- */
  document.querySelectorAll('.fd-menu-wrap').forEach(function (wrapEl) {
    var btn = wrapEl.querySelector('[data-menu-button]');
    var menu = wrapEl.querySelector('.fd-menu');
    if (!btn || !menu) return;
    var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      if (items.length) items[0].focus();
    }
    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function () {
      if (menu.hidden) open(); else close();
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && menu.hidden) { e.preventDefault(); open(); }
    });
    menu.addEventListener('keydown', function (e) {
      var i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
    });
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        close(); btn.focus();
        toast('Выбрано: «' + it.textContent.trim() + '»', 'info');
      });
    });
    document.addEventListener('mousedown', function (e) {
      if (!menu.hidden && !wrapEl.contains(e.target)) close();
    });
  });

  /* ---------- Тосты ---------- */
  window.toast = function (text, kind) {
    var zone = document.getElementById('toast-zone');
    if (!zone) return;
    var el = document.createElement('div');
    el.className = 'fd-alert fd-alert--' + (kind || 'success');
    el.setAttribute('role', 'status');
    el.innerHTML = '<p>' + text + '</p><button class="close" aria-label="Закрыть уведомление">×</button>';
    el.querySelector('.close').addEventListener('click', function () { el.remove(); });
    zone.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 4200);
  };
  document.querySelectorAll('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toast(btn.dataset.toast, btn.dataset.toastKind || 'success');
    });
  });

  /* ---------- Кнопка с загрузкой (демо) ---------- */
  document.querySelectorAll('[data-loading-demo]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-mini" aria-hidden="true"></span> Загружаю…';
      setTimeout(function () {
        btn.disabled = false;
        btn.innerHTML = original;
        toast('Данные версии загружены.', 'success');
      }, 1400);
    });
  });

  /* ---------- Пагинация (демо) ---------- */
  document.querySelectorAll('.fd-pagination').forEach(function (pg) {
    pg.addEventListener('click', function (e) {
      var b = e.target.closest('.fd-page');
      if (!b || b.disabled) return;
      if (b.dataset.page) {
        pg.querySelectorAll('.fd-page').forEach(function (x) { x.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'page');
      }
    });
  });

  /* ---------- Демо-форма: проверка и состояния ---------- */
  var form = document.getElementById('demo-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = form.querySelector('#demo-form-input');
      var wrap = field.closest('.fd-field');
      var hint = wrap.querySelector('.fd-hint');
      if (!field.value.trim()) {
        wrap.classList.remove('fd-field--success');
        wrap.classList.add('fd-field--error');
        hint.textContent = 'Поле обязательно. Укажите номер приказа, например ЕД-1-26/277@.';
        field.focus();
      } else {
        wrap.classList.remove('fd-field--error');
        wrap.classList.add('fd-field--success');
        hint.textContent = 'Номер сохранён в черновике карточки.';
        toast('Черновик карточки сохранён.', 'success');
      }
    });
  }

  /* ---------- Копирование значения токена ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = el.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () {
        toast('Скопировано: ' + v, 'info');
      });
    });
  });
})();
