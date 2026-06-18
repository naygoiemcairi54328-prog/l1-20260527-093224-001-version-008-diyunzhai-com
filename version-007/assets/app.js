(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var opened = panel.hasAttribute('hidden') === false;
            if (opened) {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    function setupHero(hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-hero]'), setupHero);

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters(panel) {
        var scope = panel.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-list] .movie-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && keyword) {
            keyword.value = query;
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var t = normalize(type && type.value);
            var r = normalize(region && region.value);
            var y = normalize(year && year.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                var keep = true;

                if (q && haystack.indexOf(q) === -1) {
                    keep = false;
                }
                if (t && normalize(card.dataset.type) !== t) {
                    keep = false;
                }
                if (r && normalize(card.dataset.region) !== r) {
                    keep = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    keep = false;
                }

                card.classList.toggle('is-hidden-by-filter', !keep);
            });
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-filter-panel]'), setupFilters);

    function attachPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var stream = shell.getAttribute('data-stream');
        var ready = false;

        function load() {
            if (!video || !stream) {
                return;
            }

            if (!ready) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    ready = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                    ready = true;
                } else {
                    video.src = stream;
                    ready = true;
                }
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', load);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    load();
                }
            });
        }
    }

    Array.prototype.forEach.call(document.querySelectorAll('.player-shell'), attachPlayer);
})();
