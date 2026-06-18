(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const year = filterRoot.querySelector('[data-filter-year]');
    const reset = filterRoot.querySelector('[data-filter-reset]');
    const list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      const keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      const selectedYear = year && year.value ? year.value : '';

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.textContent
        ].join(' ').toLowerCase();
        const keywordOk = !keyword || text.includes(keyword);
        const yearOk = !selectedYear || card.dataset.year === selectedYear;
        card.style.display = keywordOk && yearOk ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilter();
      });
    }
  });
})();
