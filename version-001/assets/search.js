(function () {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const list = document.querySelector('[data-search-list]');
  const items = window.MOVIE_SEARCH_INDEX || [];
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (!input || !list) {
    return;
  }

  input.value = initialQuery;

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function movieCard(item) {
    const tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card movie-card-compact" data-title="', escapeHtml(item.title), '" data-year="', escapeHtml(item.year), '">',
      '<a class="poster-link" href="', escapeHtml(item.url), '">',
      '<img src="', escapeHtml(item.cover), '" alt="', escapeHtml(item.title), '封面" loading="lazy">',
      '<span class="poster-badge">', escapeHtml(item.year || '精选'), '</span>',
      '<span class="poster-play">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="card-meta-line"><a href="categories.html">', escapeHtml(item.category), '</a><span>', escapeHtml(item.region), '</span></div>',
      '<h3><a href="', escapeHtml(item.url), '">', escapeHtml(item.title), '</a></h3>',
      '<p>', escapeHtml(item.summary || item.genre || ''), '</p>',
      '<div class="card-tags">', tags, '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search() {
    const query = normalize(input.value.trim());
    const words = query.split(/\s+/).filter(Boolean);
    let results = items;

    if (words.length) {
      results = items.filter(function (item) {
        const haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          (item.tags || []).join(' '),
          item.summary
        ].join(' '));
        return words.every(function (word) {
          return haystack.includes(word);
        });
      });
    }

    list.innerHTML = results.slice(0, 240).map(movieCard).join('') || '<p class="empty-result">没有找到匹配影片，请更换关键词。</p>';
  }

  input.addEventListener('input', search);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState({}, '', url.toString());
      search();
    });
  }

  search();
})();
