(function () {
  function attachHlsPlayer(video) {
    var source = video.dataset.source;

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      window.currentMovieHls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.src = source;
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    attachHlsPlayer(video);

    if (overlay) {
      overlay.addEventListener('click', function () {
        overlay.classList.add('is-hidden');
        video.play().catch(function () {
          overlay.classList.remove('is-hidden');
        });
      });

      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
