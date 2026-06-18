import { H as Hls } from './hls-vendor-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const message = player.querySelector('[data-player-message]');
  const videoUrl = player.dataset.videoUrl;
  let initialized = false;
  let hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initializePlayer() {
    if (!video || !videoUrl || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      setMessage('播放源加载完成。');
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放源加载完成。');
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage('网络波动，正在尝试恢复播放。');
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage('媒体错误，正在尝试恢复播放。');
          hlsInstance.recoverMediaError();
        } else {
          setMessage('播放源暂时无法加载。');
          hlsInstance.destroy();
        }
      });
    } else {
      video.src = videoUrl;
      setMessage('已尝试直接加载播放源。');
    }
  }

  function startPlayback() {
    initializePlayer();
    player.classList.add('is-playing');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('浏览器阻止自动播放，请再次点击视频控件播放。');
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
