(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRegionTabs() {
    var groups = document.querySelectorAll("[data-region-tabs]");
    groups.forEach(function (group) {
      var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-region-tab]"));
      var panels = Array.prototype.slice.call(document.querySelectorAll("[data-region-panel]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var target = button.getAttribute("data-region-tab");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          panels.forEach(function (panel) {
            panel.hidden = panel.getAttribute("data-region-panel") !== target;
          });
        });
      });
    });
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var tagButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-keyword]"));

      if (query && search && search.hasAttribute("data-global-search")) {
        search.value = query;
      }

      function apply() {
        var keyword = normalize(search ? search.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matched = matchesKeyword && matchesYear && matchesType;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      tagButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var keyword = button.getAttribute("data-keyword") || "";
          tagButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button && (!search || search.value !== keyword));
          });
          if (search) {
            search.value = search.value === keyword ? "" : keyword;
          }
          apply();
        });
      });
      apply();
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[type='search']");
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html";
      });
    });
  }

  window.setupMoviePlayer = function (videoSource) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var start = document.getElementById("playerStart");
      var message = document.getElementById("playerMessage");
      var hlsPlayer = null;
      var attached = false;

      if (!video || !start || !videoSource) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.hidden = false;
        }
      }

      function attachSource() {
        if (attached) {
          return true;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoSource;
          return true;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsPlayer.loadSource(videoSource);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsPlayer.startLoad();
              showMessage("播放暂不可用，请稍后再试");
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsPlayer.recoverMediaError();
            } else {
              hlsPlayer.destroy();
              showMessage("播放暂不可用，请稍后再试");
            }
          });
          return true;
        }
        showMessage("播放暂不可用，请稍后再试");
        return false;
      }

      function playNow() {
        if (!attachSource()) {
          return;
        }
        start.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            start.classList.remove("is-hidden");
          });
        }
      }

      start.addEventListener("click", playNow);
      video.addEventListener("click", function () {
        if (video.paused) {
          playNow();
        }
      });
      video.addEventListener("play", function () {
        start.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        start.classList.remove("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initRegionTabs();
    initFilters();
    initSearchForms();
  });
})();
