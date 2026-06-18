(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const tabs = Array.from(document.querySelectorAll('.hero-tab'));
  let current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('is-active', tabIndex === current);
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('.js-search-input');
  const yearSelect = document.querySelector('.js-filter-year');
  const categorySelect = document.querySelector('.js-filter-category');
  const cards = Array.from(document.querySelectorAll('.movie-card'));

  function applyFilters() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';

    cards.forEach(function (card) {
      const searchable = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const cardGenre = card.getAttribute('data-genre') || '';
      const keywordMatched = !keyword || searchable.indexOf(keyword) !== -1;
      const yearMatched = !year || cardYear.indexOf(year) !== -1;
      const categoryMatched = !category || cardGenre.indexOf(category) !== -1 || searchable.indexOf(category.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(keywordMatched && yearMatched && categoryMatched));
    });
  }

  [searchInput, yearSelect, categorySelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-button');
    const stream = player.getAttribute('data-stream');

    function start() {
      if (!video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(function () {});
        player.classList.add('is-playing');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.dataset.hlsReady) {
          const hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.dataset.hlsReady = '1';
        }
        video.play().catch(function () {});
        player.classList.add('is-playing');
        return;
      }

      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      player.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', start);
    }

    player.addEventListener('click', function (event) {
      if (event.target !== video) {
        start();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
    }
  });
})();
