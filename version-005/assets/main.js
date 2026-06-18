(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var showSlide = function (next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var currentPrefix = (location.pathname.indexOf('/category/') !== -1 || location.pathname.indexOf('/movies/') !== -1) ? '../' : './';
  var resolveLocalPath = function (path) {
    if (/^https?:\/\//.test(path)) return path;
    return currentPrefix + String(path || '').replace(/^\.\//, '');
  };
  var escapeHtml = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };

  var renderSearch = function (input, panel) {
    var query = normalize(input.value);
    if (!query) {
      panel.classList.remove('active');
      panel.innerHTML = '';
      return;
    }
    var items = (window.SEARCH_ITEMS || []).filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
    }).slice(0, 12);
    panel.innerHTML = items.map(function (item) {
      return '<a class="search-result" href="' + resolveLocalPath(item.url) + '">' +
        '<img src="' + resolveLocalPath(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</em></span>' +
        '</a>';
    }).join('');
    panel.classList.toggle('active', items.length > 0);
  };

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var wrap = input.parentElement;
    var panel = wrap ? wrap.querySelector('[data-search-panel]') : null;
    if (!panel) return;
    input.addEventListener('input', function () {
      renderSearch(input, panel);
    });
    input.addEventListener('focus', function () {
      renderSearch(input, panel);
    });
    document.addEventListener('click', function (event) {
      if (!wrap.contains(event.target)) {
        panel.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('[data-local-list]').forEach(function (list) {
    var area = list.closest('main') || document;
    var input = area.querySelector('[data-local-search]');
    var buttons = Array.prototype.slice.call(area.querySelectorAll('[data-local-filter]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var active = '';
    var apply = function () {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var filterValue = normalize(card.getAttribute('data-filter-value'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = !active || filterValue.indexOf(normalize(active)) !== -1 || text.indexOf(normalize(active)) !== -1;
        card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-local-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });
})();
