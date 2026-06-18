(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function() {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".poster-image, .rank-thumb img, .hero-slide img").forEach(function(img) {
      img.addEventListener("error", function() {
        img.classList.add("image-error");
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
      var activeIndex = 0;

      function showSlide(index) {
        activeIndex = index % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("active", i === activeIndex);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("active", i === activeIndex);
        });
      }

      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          showSlide(i);
        });
      });

      showSlide(0);
      window.setInterval(function() {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-site-search]");
    var searchableCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function runSearch(value) {
      var query = (value || "").trim().toLowerCase();
      var visible = 0;

      searchableCards.forEach(function(card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();

        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("hidden-by-search", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      runSearch(initial);
      searchInput.addEventListener("input", function() {
        runSearch(searchInput.value);
      });
    }

    function startPlayer(shell) {
      var video = shell.querySelector("video");
      var source = shell.getAttribute("data-source");

      if (!video || !source) {
        return;
      }

      shell.classList.add("playing");

      if (video.getAttribute("data-ready") !== "true") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.setAttribute("data-ready", "true");
          video.play().catch(function() {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          video.setAttribute("data-ready", "true");
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {});
          });
          return;
        }

        video.src = source;
        video.setAttribute("data-ready", "true");
      }

      video.play().catch(function() {});
    }

    document.querySelectorAll(".player-shell").forEach(function(shell) {
      var overlay = shell.querySelector(".play-overlay");
      var video = shell.querySelector("video");

      if (overlay) {
        overlay.addEventListener("click", function() {
          startPlayer(shell);
        });
      }

      if (video) {
        video.addEventListener("click", function() {
          if (video.paused) {
            startPlayer(shell);
          }
        });
        video.addEventListener("play", function() {
          shell.classList.add("playing");
        });
        video.addEventListener("pause", function() {
          if (!video.ended) {
            shell.classList.remove("playing");
          }
        });
      }
    });
  });
})();
