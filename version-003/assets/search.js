(function () {
  function getQueryParameter(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function createMovieCard(movie) {
    var tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="movie-cover" href="' + escapeHtml(movie.link) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<span class="cover-fallback">' + escapeHtml(movie.title) + '</span>' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-badge">' + escapeHtml(movie.year) + '</span>' +
          '<span class="play-fab" aria-hidden="true">▶</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<a class="movie-title" href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a>' +
          '<div class="movie-meta">' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>热度 ' + escapeHtml(movie.heat) + '</span>' +
          '</div>' +
          '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function searchMovies(keyword) {
    var normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      return window.MOVIE_SEARCH_DATA.slice(0, 48);
    }

    return window.MOVIE_SEARCH_DATA.filter(function (movie) {
      return movie.searchText.indexOf(normalized) !== -1;
    }).slice(0, 120);
  }

  function render() {
    var input = document.getElementById('global-search-input');
    var button = document.getElementById('global-search-button');
    var results = document.getElementById('search-results');
    var status = document.getElementById('search-status');

    if (!input || !button || !results || !status || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function execute() {
      var keyword = input.value;
      var matched = searchMovies(keyword);
      var label = keyword.trim() ? '“' + keyword.trim() + '”' : '热门影片';

      status.textContent = label + ' 找到 ' + matched.length + ' 条结果，最多展示前 120 条。';
      results.innerHTML = matched.map(createMovieCard).join('');
    }

    input.value = getQueryParameter('q');
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        execute();
      }
    });
    input.addEventListener('input', execute);
    button.addEventListener('click', execute);
    execute();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
