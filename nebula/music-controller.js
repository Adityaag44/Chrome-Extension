
// NEBULA — YouTube Music Controller

function getPlayerState() {
    const trackInfo = document.querySelector("ytmusic-miniplayer");
    const video = document.querySelector("video.html5-main-video");

    if (!trackInfo) {
        return {
            connected: false,
            playing: false,
            title: "No song playing",
            artist: "Open YouTube Music",
            artwork: "",
            currentTime: 0,
            duration: 0
        };
    }

    const title = trackInfo.querySelector(".ytmusicTrackInfoTitle");
    const subtitle = trackInfo.querySelector(".ytmusicTrackInfoByline");
    const artwork = trackInfo.querySelector("img");

    const queueItems = [
        ...document.querySelectorAll(
            "ytmusic-player-queue ytmusic-player-queue-item"
        )
    ];

    const currentIndex = queueItems.findIndex(
        item => item.hasAttribute("selected")
    );

    const queueItem = currentIndex >= 0
        ? queueItems[currentIndex + 1]
        : null;

    const nextTitle = queueItem?.querySelector(".song-title")
        ?.textContent?.trim() || "End of queue";

    const nextArtist = queueItem?.querySelector(".byline")
        ?.textContent?.trim() || "";

    const nextArtwork = queueItem?.querySelector("yt-img-shadow img")
        ?.src || "";

    return {
        connected: true,
        playing: video ? !video.paused : false,
        title: title?.textContent?.trim() || "Unknown title",
        artist: subtitle?.textContent?.trim() || "Unknown artist",
        artwork: artwork?.src || "",
        currentTime: video?.currentTime || 0,
        duration: video?.duration || 0,
        nextTitle,
        nextArtist,
        nextArtwork
    };
}

function controlPlayer(action, value) {
    const video = document.querySelector("video.html5-main-video");

    if (!video) return false;

    if (action === "playPause") {
        video.paused ? video.play() : video.pause();
        return true;
    }

    if (action === "seek" && Number.isFinite(value)) {
        video.currentTime = Math.max(
            0,
            Math.min(value, video.duration || value)
        );
        return true;
    }

    return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NEBULA_GET_STATE") {
        sendResponse(getPlayerState());
        return true;
    }

    if (request.type === "NEBULA_CONTROL") {
        if (request.action === "next" || request.action === "previous") {
            const id = Date.now() + Math.random();

            function receiveResult(event) {
                const data = event.data;

                if (
                    event.source !== window ||
                    data?.source !== "NEBULA_PAGE" ||
                    data?.type !== "NEBULA_CONTROL_RESULT" ||
                    data?.id !== id
                ) return;

                window.removeEventListener("message", receiveResult);
                sendResponse({ success: data.success });
            }

            window.addEventListener("message", receiveResult);

            window.postMessage({
                source: "NEBULA_EXTENSION",
                type: "NEBULA_PAGE_CONTROL",
                id,
                action: request.action
            }, "*");

            return true;
        }

        const success = controlPlayer(request.action, request.value);
        sendResponse({ success });
        return true;
    }
});
