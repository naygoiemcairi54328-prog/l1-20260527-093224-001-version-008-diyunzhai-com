(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs("[data-menu-button]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", opened);
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHeaderSearch() {
    qsa("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var keyword = input ? input.value.trim() : "";
        var target = keyword ? "search.html?q=" + encodeURIComponent(keyword) : "search.html";
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    var forms = qsa("[data-filter-form]");
    forms.forEach(function (form) {
      var cards = qsa("[data-movie-card]");
      var keywordInput = qs("[data-filter-keyword]", form);
      var regionSelect = qs("[data-filter-region]", form);
      var yearSelect = qs("[data-filter-year]", form);
      var typeSelect = qs("[data-filter-type]", form);
      var apply = function () {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-summary"));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
          card.classList.toggle("hidden-by-filter", !(matchKeyword && matchRegion && matchYear && matchType));
        });
      };
      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function setupSearchPage() {
    var input = qs("[data-search-input]");
    var cards = qsa("[data-movie-card]");
    var title = qs("[data-search-title]");
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    var run = function () {
      var keyword = normalize(input.value);
      var any = false;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-summary") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type"));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-by-filter", !matched);
        if (matched) {
          any = true;
        }
      });
      if (title) {
        title.textContent = keyword ? "搜索结果" : "全部片库";
      }
      var empty = qs("[data-search-empty]");
      if (empty) {
        empty.style.display = any ? "none" : "block";
      }
    };
    var form = qs("[data-search-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var target = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        history.replaceState(null, "", target);
        run();
      });
    }
    input.addEventListener("input", run);
    run();
  }

  function hideBrokenImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.classList.add("image-hidden");
      }
    }, true);
  }

  function initPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var message = document.getElementById(config.messageId);
    if (!video) {
      return;
    }
    var source = config.source;
    var hls = null;
    var ready = false;
    var showMessage = function (text) {
      if (message) {
        message.textContent = text;
        message.classList.add("show");
      }
    };
    var attach = function () {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showMessage("播放加载中，请稍候");
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage("播放暂时不可用");
          }
        });
        return;
      }
      showMessage("播放暂时不可用");
    };
    var play = function () {
      if (!ready && !video.src && !hls) {
        attach();
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
          showMessage("点击播放按钮开始观看");
        });
      }
    };
    attach();
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime > 0 && !video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHeaderSearch();
    setupFilters();
    setupSearchPage();
    hideBrokenImages();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
