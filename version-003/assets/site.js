(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      button.textContent = isOpen ? '☰' : '×';
    });
  }

  function handleMissingImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      if (timer) {
        clearInterval(timer);
      }
    });

    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-sort-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-filter-card'));

    function getText(card) {
      return [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.tags
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var matched = !keyword || getText(card).indexOf(keyword) !== -1;
        card.hidden = !matched;
      });
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : 'year-desc';
      var sorted = cards.slice().sort(function (a, b) {
        var yearA = Number(a.dataset.year || 0);
        var yearB = Number(b.dataset.year || 0);
        var heatA = Number(a.dataset.heat || 0);
        var heatB = Number(b.dataset.heat || 0);
        var titleA = a.dataset.title || '';
        var titleB = b.dataset.title || '';

        if (mode === 'year-asc') {
          return yearA - yearB;
        }

        if (mode === 'heat-desc') {
          return heatB - heatA;
        }

        if (mode === 'title-asc') {
          return titleA.localeCompare(titleB, 'zh-Hans-CN');
        }

        return yearB - yearA;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    handleMissingImages();
    setupHeroCarousel();
    setupFilters();
  });
})();
