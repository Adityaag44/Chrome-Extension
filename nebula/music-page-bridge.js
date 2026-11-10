// NEBULA — YouTube Music keyboard bridge

window.addEventListener("message", (event) => {
    const data = event.data;

    if (
        event.source !== window ||
        data?.source !== "NEBULA_EXTENSION" ||
        data?.type !== "NEBULA_PAGE_CONTROL"
    ) return;

    if (data.action === "next" || data.action === "previous") {
        const key = data.action === "next" ? "n" : "p";

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key,
            code: key === "n" ? "KeyN" : "KeyP",
            shiftKey: true,
            bubbles: true,
            cancelable: true
        }));
    }

    window.postMessage({
        source: "NEBULA_PAGE",
        type: "NEBULA_CONTROL_RESULT",
        id: data.id,
        success: true
    }, "*");
});