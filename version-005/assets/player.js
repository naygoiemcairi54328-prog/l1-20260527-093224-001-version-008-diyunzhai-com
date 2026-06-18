function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-player-button]');
  if (!video || !streamUrl) return;

  var ready = false;
  var prepare = function () {
    if (ready) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  var start = function () {
    prepare();
    if (button) {
      button.classList.add('hidden');
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('hidden');
    }
  });

  prepare();
}
