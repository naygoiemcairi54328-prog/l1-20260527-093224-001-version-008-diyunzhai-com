import { H as Hls } from "./hls-vendor.js";

const instances = new WeakMap();

const playVideo = async (video, overlay) => {
    try {
        video.controls = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        await video.play();
    } catch (error) {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    }
};

const bindPlayer = (player) => {
    const video = player.querySelector("video[data-stream]");
    const overlay = player.querySelector(".player-overlay");

    if (!video) {
        return;
    }

    const source = video.getAttribute("data-stream");

    const start = () => {
        if (!source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = source;
            }
            playVideo(video, overlay);
            return;
        }

        if (Hls.isSupported()) {
            let hls = instances.get(video);

            if (!hls) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function onManifestParsed() {
                    hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
                    playVideo(video, overlay);
                });
                instances.set(video, hls);
            } else {
                playVideo(video, overlay);
            }
            return;
        }

        if (!video.src) {
            video.src = source;
        }
        playVideo(video, overlay);
    };

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
};

document.querySelectorAll("[data-player]").forEach(bindPlayer);
