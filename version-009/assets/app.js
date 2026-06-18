(() => {
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');

  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    show(0);
    start();
  }

  const setupFilters = () => {
    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach((scope) => {
      const panel = scope.parentElement?.querySelector('.filter-panel');
      if (!panel) {
        return;
      }

      const input = panel.querySelector('[data-filter-input]');
      const year = panel.querySelector('[data-year-filter]');
      const region = panel.querySelector('[data-region-filter]');
      const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

      const apply = () => {
        const q = (input?.value || '').trim().toLowerCase();
        const y = year?.value || '';
        const r = region?.value || '';

        cards.forEach((card) => {
          const haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
          ].join(' ').toLowerCase();
          const okQuery = !q || haystack.includes(q);
          const okYear = !y || card.dataset.year === y;
          const okRegion = !r || card.dataset.region === r;
          card.classList.toggle('is-hidden', !(okQuery && okYear && okRegion));
        });
      };

      input?.addEventListener('input', apply);
      year?.addEventListener('change', apply);
      region?.addEventListener('change', apply);
    });
  };

  setupFilters();

  const players = Array.from(document.querySelectorAll('.stream-player'));

  players.forEach((wrap) => {
    const video = wrap.querySelector('video');
    const button = wrap.querySelector('[data-play]');
    const stream = wrap.dataset.stream;
    let hls = null;
    let prepared = false;

    const prepare = () => {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    };

    const play = () => {
      prepare();
      wrap.classList.add('is-ready');
      const result = video?.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          wrap.classList.remove('is-ready');
        });
      }
    };

    button?.addEventListener('click', play);
    wrap.addEventListener('click', (event) => {
      if (event.target === button || button?.contains(event.target)) {
        return;
      }
      if (!prepared) {
        play();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
