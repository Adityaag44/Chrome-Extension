
document.addEventListener("DOMContentLoaded", () => {

    // 1. CLOCK, DATE AND GREETING

    const clock = document.getElementById("clock");
    const date = document.getElementById("date");
    const greeting = document.getElementById("greeting");

    function updateClock() {
        const now = new Date();

        if (clock) {
            clock.textContent = now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
        }

        if (date) {
            date.textContent = now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }).toUpperCase();
        }

        if (greeting) {
            const hour = now.getHours();

            if (hour >= 5 && hour < 12) {
                greeting.textContent = "GOOD MORNING";
            } else if (hour >= 12 && hour < 17) {
                greeting.textContent = "GOOD AFTERNOON";
            } else if (hour >= 17 && hour < 21) {
                greeting.textContent = "GOOD EVENING";
            } else {
                greeting.textContent = "WELCOME BACK";
            }
        }
    }

    updateClock();
    setInterval(updateClock, 1000);


    // 2. UNIVERSAL MULTI-PLATFORM SEARCH

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const input = searchInput.value.trim();

            if (!input) {
                searchInput.focus();
                return;
            }

            let query = input;
            let destination = "google";

            const keywordMatch = input.match(/^(ytm|yt|gpt)\s+/i);

            if (keywordMatch) {
                const keyword = keywordMatch[1].toLowerCase();

                query = input.slice(keywordMatch[0].length).trim();

                if (keyword === "yt") {
                    destination = "youtube";
                } else if (keyword === "ytm") {
                    destination = "youtube-music";
                } else if (keyword === "gpt") {
                    destination = "chatgpt";
                }
            }

            if (!query) {
                searchInput.focus();
                return;
            }

            const encodedQuery = encodeURIComponent(query);

            const searchURLs = {
                google:
                    `https://www.google.com/search?q=${encodedQuery}`,

                youtube:
                    `https://www.youtube.com/results?search_query=${encodedQuery}`,

                "youtube-music":
                    `https://music.youtube.com/search?q=${encodedQuery}`,

                chatgpt:
                    `https://chatgpt.com/?q=${encodedQuery}`
            };

            window.location.assign(searchURLs[destination]);
        });
    }


    // 3. DAILY QUOTE

    const quoteElement = document.getElementById("quote");

    const quotes = [
        "Somewhere between dreams and reality.",
        "Create your own universe.",
        "The future belongs to those who build it.",
        "Stay curious. Stay limitless.",
        "Not all who wander are lost.",
        "Your next chapter starts now.",
        "Dream beyond the boundaries.",
        "Silence the noise. Focus on becoming."
    ];

    if (quoteElement) {
        const day = Math.floor(
            Date.now() / (1000 * 60 * 60 * 24)
        );

        quoteElement.textContent = quotes[day % quotes.length];
    }


    // 4. LIVE WEATHER — AUTOMATIC LOCATION

    const weatherIcon = document.getElementById("weatherIcon");
    const weatherTemperature = document.getElementById("weatherTemperature");
    const weatherCondition = document.getElementById("weatherCondition");
    const weatherLocation = document.getElementById("weatherLocation");

    async function updateWeather() {

        if (
            !weatherIcon ||
            !weatherTemperature ||
            !weatherCondition ||
            !weatherLocation
        ) {
            return;
        }

        weatherLocation.textContent = "Detecting location...";
        weatherTemperature.textContent = "--°";

        const conditions = {
            0: ["☀️", "Clear sky"],
            1: ["🌤️", "Mainly clear"],
            2: ["⛅", "Partly cloudy"],
            3: ["☁️", "Overcast"],
            45: ["🌫️", "Foggy"],
            48: ["🌫️", "Rime fog"],
            51: ["🌦️", "Light drizzle"],
            53: ["🌦️", "Drizzle"],
            55: ["🌧️", "Heavy drizzle"],
            61: ["🌧️", "Light rain"],
            63: ["🌧️", "Moderate rain"],
            65: ["🌧️", "Heavy rain"],
            71: ["🌨️", "Light snow"],
            73: ["🌨️", "Snow"],
            75: ["❄️", "Heavy snow"],
            80: ["🌦️", "Rain showers"],
            81: ["🌧️", "Rain showers"],
            82: ["⛈️", "Heavy showers"],
            95: ["⛈️", "Thunderstorm"],
            96: ["⛈️", "Thunderstorm"],
            99: ["⛈️", "Heavy thunderstorm"]
        };

        try {

            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported");
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: false,
                        timeout: 10000,
                        maximumAge: 10 * 60 * 1000
                    }
                );
            });

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const [weatherResponse, locationResponse] = await Promise.all([
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
                ),

                fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                )
            ]);

            if (!weatherResponse.ok) {
                throw new Error("Weather request failed");
            }

            const data = await weatherResponse.json();

            let city = "Your location";

            if (locationResponse.ok) {
                const locationData = await locationResponse.json();

                city =
                    locationData.city ||
                    locationData.locality ||
                    locationData.principalSubdivision ||
                    "Your location";
            }

            const temperature = Math.round(
                data.current.temperature_2m
            );

            const code = data.current.weather_code;

            const condition = conditions[code] || ["🌡️", "Current weather"];

            weatherIcon.textContent = condition[0];
            weatherTemperature.textContent = `${temperature}°C`;
            weatherCondition.textContent = condition[1];
            weatherLocation.textContent = city;

        } catch (error) {

            weatherIcon.textContent = "☁️";
            weatherTemperature.textContent = "--°";
            weatherCondition.textContent =
                error.code === 1
                    ? "Location permission denied"
                    : "Weather unavailable";

            weatherLocation.textContent = "Location unavailable";

            console.error("NEBULA weather error:", error);
        }
    }

    updateWeather();
    setInterval(updateWeather, 15 * 60 * 1000);


    // 5. SMOOTH LOOPING GOOGLE APPS CAROUSEL

    const dock = document.querySelector(".google-dock");

    const apps = dock
        ? Array.from(dock.querySelectorAll(".dock-app"))
        : [];

    let activeApp = 0;
    let isAnimating = false;
    let scrollAccumulator = 0;
    let scrollReset;

    function renderCarousel() {
        const total = apps.length;

        apps.forEach((app, index) => {
            let distance = index - activeApp;

            if (distance > total / 2) distance -= total;
            if (distance < -total / 2) distance += total;

            const visible = Math.abs(distance) <= 1;

            app.classList.toggle("active", distance === 0);
            app.classList.toggle("neighbour", Math.abs(distance) === 1);

            app.style.opacity = visible
                ? (distance === 0 ? "1" : "0.5")
                : "0";

            app.style.pointerEvents = visible ? "auto" : "none";

            app.style.transform =
                `translate3d(-50%, calc(-50% + ${distance * 125}px), 0) scale(${distance === 0 ? 1.12 : 0.88})`;

            app.style.zIndex = distance === 0 ? "3" : "2";
        });
    }

    function moveCarousel(direction) {
        if (isAnimating || !apps.length) return;

        isAnimating = true;

        activeApp = (activeApp + direction + apps.length) % apps.length;

        renderCarousel();

        setTimeout(() => {
            isAnimating = false;
        }, 430);
    }


    // 6. SMOOTH LOOPING QUICK ACCESS CAROUSEL

    const quickDock = document.querySelector(".quick-dock");

    const quickApps = quickDock
        ? Array.from(quickDock.querySelectorAll(".quick-app"))
        : [];

    let activeQuickApp = 0;
    let quickAnimating = false;
    let quickScrollAccumulator = 0;
    let quickScrollReset;

    function renderQuickCarousel() {
        const total = quickApps.length;

        quickApps.forEach((app, index) => {
            let distance = index - activeQuickApp;

            if (distance > total / 2) distance -= total;
            if (distance < -total / 2) distance += total;

            const visible = Math.abs(distance) <= 1;

            app.classList.toggle("active", distance === 0);
            app.classList.toggle("neighbour", Math.abs(distance) === 1);

            app.style.opacity = visible
                ? (distance === 0 ? "1" : "0.5")
                : "0";

            app.style.pointerEvents = visible ? "auto" : "none";

            app.style.transform =
                `translate3d(-50%, calc(-50% + ${distance * 125}px), 0) scale(${distance === 0 ? 1.12 : 0.88})`;

            app.style.zIndex = distance === 0 ? "3" : "2";
        });
    }

    function moveQuickCarousel(direction) {
        if (quickAnimating || !quickApps.length) return;

        quickAnimating = true;

        activeQuickApp =
            (activeQuickApp + direction + quickApps.length) % quickApps.length;

        renderQuickCarousel();

        setTimeout(() => {
            quickAnimating = false;
        }, 550);
    }

    if (quickDock && quickApps.length) {

        renderQuickCarousel();

        quickDock.addEventListener("wheel", (event) => {
            event.preventDefault();

            if (quickAnimating) return;

            quickScrollAccumulator += event.deltaY;

            clearTimeout(quickScrollReset);

            if (Math.abs(quickScrollAccumulator) >= 35) {
                const direction = quickScrollAccumulator > 0 ? 1 : -1;

                quickScrollAccumulator = 0;
                moveQuickCarousel(direction);
            }

            quickScrollReset = setTimeout(() => {
                quickScrollAccumulator = 0;
            }, 180);

        }, { passive: false });

        quickApps.forEach((app, index) => {
            app.addEventListener("click", (event) => {
                if (index === activeQuickApp) return;

                event.preventDefault();

                const total = quickApps.length;
                let distance = index - activeQuickApp;

                if (distance > total / 2) distance -= total;
                if (distance < -total / 2) distance += total;

                moveQuickCarousel(distance > 0 ? 1 : -1);
            });
        });

        document.addEventListener("keydown", (event) => {
            const typing = ["INPUT", "TEXTAREA"].includes(
                document.activeElement.tagName
            );

            if (typing || event.altKey || event.ctrlKey || event.metaKey) return;

            if (event.key === "ArrowDown") {
                moveQuickCarousel(1);
            }

            if (event.key === "ArrowUp") {
                moveQuickCarousel(-1);
            }
        });
    }

    if (dock && apps.length) {
        renderCarousel();

        dock.addEventListener("wheel", (event) => {
            event.preventDefault();

            if (isAnimating) return;

            scrollAccumulator += event.deltaY;

            clearTimeout(scrollReset);

            if (Math.abs(scrollAccumulator) >= 35) {
                const direction = scrollAccumulator > 0 ? 1 : -1;

                scrollAccumulator = 0;
                moveCarousel(direction);
            }

            scrollReset = setTimeout(() => {
                scrollAccumulator = 0;
            }, 180);
        }, { passive: false });

        apps.forEach((app, index) => {
            app.addEventListener("click", (event) => {
                if (index === activeApp) return;

                event.preventDefault();

                const total = apps.length;
                let distance = index - activeApp;

                if (distance > total / 2) distance -= total;
                if (distance < -total / 2) distance += total;

                moveCarousel(distance > 0 ? 1 : -1);
            });
        });

        document.addEventListener("keydown", (event) => {

            const typing = ["INPUT", "TEXTAREA"].includes(
                document.activeElement.tagName
            );

            if (typing) return;

            if (event.key === "ArrowDown") {
                event.preventDefault();
                moveCarousel(1);
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                moveCarousel(-1);
            }

            if (event.key === "Enter") {
                event.preventDefault();

                if (apps[activeApp]) {
                    window.open(
                        apps[activeApp].href,
                        "_blank",
                        "noopener,noreferrer"
                    );
                }
            }
        });
    }


    // 7. NEBULA RECENTLY CLOSED TABS

    
const recentTabsList = document.getElementById("recentTabsList");

if (recentTabsList && chrome.sessions) {

    const HIDDEN_TABS_KEY = "nebulaHiddenRecentlyClosedTabs";

    let hiddenTabIds = [];

    function refreshRecentlyClosedTabs() {

        chrome.sessions.getRecentlyClosed(
            { maxResults: 25 },
            (sessions) => {

                if (chrome.runtime.lastError) {
                    console.error(
                        "NEBULA sessions error:",
                        chrome.runtime.lastError.message
                    );
                    return;
                }

                recentTabsList.replaceChildren();

                const closedTabs = (sessions || [])
    .filter(session =>
        session.tab &&
        !hiddenTabIds.includes(session.tab.sessionId) &&
        session.tab.url !== "chrome://newtab/" &&
        session.tab.url !== "chrome://new-tab-page/"
    )
    .slice(0, 10);

                if (!closedTabs.length) {
                    const empty = document.createElement("span");
                    empty.className = "recent-tabs-empty";
                    empty.textContent = "No recently closed tabs";

                    recentTabsList.appendChild(empty);
                    return;
                }

                closedTabs.forEach(session => {

                    const tab = session.tab;
                    const sessionId = tab.sessionId;

                    const tabItem = document.createElement("div");
                    tabItem.className = "recent-tab-item";

                    const tabButton = document.createElement("button");

                    tabButton.type = "button";
                    tabButton.className = "recent-tab";
                    tabButton.title = tab.title || "Recently closed tab";

                    const favicon = document.createElement("img");

                    favicon.alt = "";
                    favicon.draggable = false;

                    if (tab.favIconUrl) {
                        favicon.src = tab.favIconUrl;
                    } else {
                        favicon.style.display = "none";
                    }

                    favicon.addEventListener("error", () => {
                        favicon.style.display = "none";
                    });

                    const title = document.createElement("span");
                    title.textContent = tab.title || "Untitled tab";

                    tabButton.appendChild(favicon);
                    tabButton.appendChild(title);

                    // Restore tab
                    tabButton.addEventListener("click", () => {

                        chrome.sessions.restore(sessionId, () => {

                            if (chrome.runtime.lastError) {
                                console.error(
                                    "NEBULA restore error:",
                                    chrome.runtime.lastError.message
                                );
                                return;
                            }

                            refreshRecentlyClosedTabs();
                        });

                    });

                    // Remove tab from NEBULA bar
                    const removeButton = document.createElement("button");

                    removeButton.type = "button";
                    removeButton.className = "recent-tab-remove";
                    removeButton.textContent = "×";
                    removeButton.title = "Hide this recently closed tab";
                    removeButton.setAttribute(
                        "aria-label",
                        "Remove " + (tab.title || "recently closed tab")
                    );

                    removeButton.addEventListener("click", (event) => {

                        event.stopPropagation();

                        hiddenTabIds.push(sessionId);

                        chrome.storage.local.set(
                            { [HIDDEN_TABS_KEY]: hiddenTabIds },
                            () => {
                                refreshRecentlyClosedTabs();
                            }
                        );

                    });

                    tabItem.appendChild(tabButton);
                    tabItem.appendChild(removeButton);

                    recentTabsList.appendChild(tabItem);
                });
            }
        );
    }

    // Load hidden tabs before displaying the bar
    chrome.storage.local.get(
        HIDDEN_TABS_KEY,
        (result) => {

            hiddenTabIds = result[HIDDEN_TABS_KEY] || [];

            refreshRecentlyClosedTabs();
        }
    );

    chrome.sessions.onChanged.addListener(
        refreshRecentlyClosedTabs
    );
}

    // 8. NEBULA CALENDAR + FULL-SCREEN NOTES

    const calendarPanel = document.getElementById("calendarPanel");
    const calendarOverlay = document.getElementById("calendarOverlay");
    const calendarEdgeTrigger = document.getElementById("calendarEdgeTrigger");
    const calendarClose = document.getElementById("calendarClose");

    const calendarGrid = document.getElementById("calendarGrid");
    const calendarMonthYear = document.getElementById("calendarMonthYear");

    const calendarPrevMonth = document.getElementById("calendarPrevMonth");
    const calendarNextMonth = document.getElementById("calendarNextMonth");

    const selectedDateTitle = document.getElementById("selectedDateTitle");
    const selectedDateDescription = document.getElementById("selectedDateDescription");
    const calendarHolidayList = document.getElementById("calendarHolidayList");

    const notesPage = document.getElementById("notesPage");
    const notesEdgeTrigger = document.getElementById("notesEdgeTrigger");
    const notesBack = document.getElementById("notesBack");
    const notesTitle = document.getElementById("notesTitle");
    const notesContent = document.getElementById("notesContent");
    const notesSaveStatus = document.getElementById("notesSaveStatus");

    let calendarOpen = false;
    let notesOpen = false;

    // -----------------------------------------
    // NOTES WORKSPACE
    // -----------------------------------------

   
    // -----------------------------------------
    // NOTES WORKSPACE — MULTIPLE NOTES
    // -----------------------------------------

    const notesGrid = document.getElementById("notesGrid");
    const notesNew = document.getElementById("notesNew");
    const notesEmptyState = document.getElementById("notesEmptyState");
    const notesEmptyCreate = document.getElementById("notesEmptyCreate");

    const notesEditorOverlay = document.getElementById("notesEditorOverlay");
    const notesEditorBack = document.getElementById("notesEditorBack");
    const notesEditorStatus = document.getElementById("notesEditorStatus");
    const notesDelete = document.getElementById("notesDelete");

    const NOTES_STORAGE_KEY = "nebulaNotes";

    let notes = [];
    let currentNoteId = null;
    let notesLoaded = false;
    let notesSaveTimer = null;

    // Generate unique note IDs

    function generateNoteId() {
        return Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
    }

    // Format note dates

    function formatNoteDate(timestamp) {
        return new Date(timestamp).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Save all notes to Chrome storage

    function saveAllNotes() {
        if (!notesLoaded || !chrome.storage?.local) return;

        if (notesSaveStatus) {
            notesSaveStatus.textContent = "SAVING...";
        }

        if (notesEditorStatus) {
            notesEditorStatus.textContent = "SAVING...";
        }

        clearTimeout(notesSaveTimer);

        notesSaveTimer = setTimeout(() => {

            chrome.storage.local.set({
                [NOTES_STORAGE_KEY]: notes
            }, () => {

                if (chrome.runtime.lastError) {
                    console.error(
                        "NEBULA notes saving error:",
                        chrome.runtime.lastError.message
                    );

                    if (notesSaveStatus) {
                        notesSaveStatus.textContent = "SAVE FAILED";
                    }

                    if (notesEditorStatus) {
                        notesEditorStatus.textContent = "SAVE FAILED";
                    }

                    return;
                }

                if (notesSaveStatus) {
                    notesSaveStatus.textContent = "ALL CHANGES SAVED";
                }

                if (notesEditorStatus) {
                    notesEditorStatus.textContent = "SAVED";
                }
            });

        }, 400);
    }

    // Render all note cards

    function renderNotes() {
        if (!notesGrid) return;

        notesGrid.replaceChildren();

        const hasNotes = notes.length > 0;

        if (notesEmptyState) {
            notesEmptyState.classList.toggle("visible", !hasNotes);
        }

        notesGrid.style.display = hasNotes ? "grid" : "none";

        notes.forEach(note => {

            const card = document.createElement("article");
            card.className = "note-card";
            card.dataset.noteId = note.id;
            card.tabIndex = 0;
            card.setAttribute("role", "button");

            const title = document.createElement("div");
            title.className = "note-card-title";
            title.textContent = note.title.trim() || "Untitled note";

            const preview = document.createElement("div");
            preview.className = "note-card-preview";
            preview.textContent = note.content.trim() || "No content yet...";

            const date = document.createElement("div");
            date.className = "note-card-date";
            date.textContent = formatNoteDate(note.updatedAt || note.createdAt);

            card.appendChild(title);
            card.appendChild(preview);
            card.appendChild(date);

            card.addEventListener("click", () => {
                openNoteEditor(note.id);
            });

            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openNoteEditor(note.id);
                }
            });

            notesGrid.appendChild(card);
        });
    }

    // Load notes from storage

    function loadNotes() {

        if (!chrome.storage?.local) {
            notesLoaded = true;
            renderNotes();
            return;
        }

        chrome.storage.local.get(NOTES_STORAGE_KEY, result => {

            if (chrome.runtime.lastError) {
                console.error(
                    "NEBULA notes loading error:",
                    chrome.runtime.lastError.message
                );

                notesLoaded = true;
                renderNotes();
                return;
            }

            const savedNotes = result[NOTES_STORAGE_KEY];

            if (Array.isArray(savedNotes)) {

                notes = savedNotes;

            } else if (
                savedNotes &&
                typeof savedNotes === "object"
            ) {

                // Migrate the previous single-note format

                if (
                    savedNotes.title ||
                    savedNotes.content
                ) {
                    notes = [{
                        id: generateNoteId(),
                        title: savedNotes.title || "",
                        content: savedNotes.content || "",
                        createdAt: savedNotes.updatedAt || Date.now(),
                        updatedAt: savedNotes.updatedAt || Date.now()
                    }];

                    saveAllNotes();

                } else {
                    notes = [];
                }

            } else {
                notes = [];
            }

            notesLoaded = true;
            renderNotes();

            if (notesSaveStatus) {
                notesSaveStatus.textContent = "ALL CHANGES SAVED";
            }
        });
    }

    // Open Notes workspace

    function openNotes() {
        if (!notesPage || notesOpen) return;

        closeCalendar();

        notesOpen = true;

        notesPage.classList.add("notes-open");
        notesPage.setAttribute("aria-hidden", "false");

        renderNotes();
    }

    // Close Notes workspace

    function closeNotes() {
        if (!notesPage || !notesOpen) return;

        closeNoteEditor();

        notesOpen = false;

        notesPage.classList.remove("notes-open");
        notesPage.setAttribute("aria-hidden", "true");
    }

    // Open an individual note

    function openNoteEditor(noteId) {

        const note = notes.find(item => item.id === noteId);

        if (!note || !notesEditorOverlay) return;

        currentNoteId = noteId;

        notesTitle.value = note.title || "";
        notesContent.value = note.content || "";

        notesEditorOverlay.classList.add("active");
        notesEditorOverlay.setAttribute("aria-hidden", "false");

        notesTitle.focus();

        if (notesEditorStatus) {
            notesEditorStatus.textContent = "SAVED";
        }
    }

    // Close individual note editor

    function closeNoteEditor() {

        if (!notesEditorOverlay) return;


        notesEditorOverlay.classList.remove("active");
        notesEditorOverlay.setAttribute("aria-hidden", "true");

        currentNoteId = null;

        renderNotes();
    }

    // Create a new note

    function createNewNote() {

        const newNote = {
            id: generateNoteId(),
            title: "",
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        notes.unshift(newNote);

        saveAllNotes();
        renderNotes();

        openNoteEditor(newNote.id);
    }

    // Update current note

    function updateCurrentNote() {

        if (!currentNoteId || !notesLoaded) return;

        const note = notes.find(item => item.id === currentNoteId);

        if (!note) return;

        note.title = notesTitle.value;
        note.content = notesContent.value;
        note.updatedAt = Date.now();

        saveAllNotes();
    }

    // Delete current note

    function deleteCurrentNote() {

        if (!currentNoteId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

        notes = notes.filter(
            note => note.id !== currentNoteId
        );

        currentNoteId = null;

        saveAllNotes();
        closeNoteEditor();
        renderNotes();
    }

    // Event listeners

    if (notesEdgeTrigger) {
        notesEdgeTrigger.addEventListener("click", openNotes);
    }

    if (notesBack) {
        notesBack.addEventListener("click", closeNotes);
    }

    if (notesNew) {
        notesNew.addEventListener("click", createNewNote);
    }

    if (notesEmptyCreate) {
        notesEmptyCreate.addEventListener("click", createNewNote);
    }

    if (notesEditorBack) {
        notesEditorBack.addEventListener("click", closeNoteEditor);
    }

    if (notesDelete) {
        notesDelete.addEventListener("click", deleteCurrentNote);
    }

    if (notesTitle) {
        notesTitle.addEventListener("input", updateCurrentNote);
    }

    if (notesContent) {
        notesContent.addEventListener("input", updateCurrentNote);
    }

    // Close editor by clicking outside it

    if (notesEditorOverlay) {
        notesEditorOverlay.addEventListener("click", event => {
            if (event.target === notesEditorOverlay) {
                closeNoteEditor();
            }
        });
    }

    // Load saved notes

    loadNotes();

    // -----------------------------------------
    // MONTHLY CALENDAR
    // -----------------------------------------

    if (
        calendarPanel &&
        calendarOverlay &&
        calendarGrid &&
        calendarMonthYear
    ) {

        let calendarViewDate = new Date();
        let calendarSelectedDate = new Date();

        const holidayCache = {};

        function getCalendarDateKey(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

       

async function loadIndiaHolidays(year) {

    if (holidayCache[year]) {
        return holidayCache[year];
    }

    try {

        const response = await fetch(
            `https://api.holibase.org/v1/public-holidays/IN/${year}?lang=en`
        );

        if (!response.ok) {
            throw new Error(`Holiday API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.holidays)) {
            throw new Error("Invalid holiday response");
        }

        const nationalHolidays = data.holidays
            .filter(holiday =>
                holiday.scope === "national" &&
                holiday.category === "public"
            )
            .map(holiday => ({
                date: holiday.date,
                name: holiday.name,
                localName: holiday.local_name
            }));

        holidayCache[year] = nationalHolidays;

        console.log(
            `NEBULA: Loaded ${nationalHolidays.length} national holidays for ${year}`,
            nationalHolidays
        );

        return nationalHolidays;

    } catch (error) {

        console.error("NEBULA holiday loading error:", error);

        return [];
    }
}


        function openCalendar() {

            if (calendarOpen || notesOpen) return;

            calendarOpen = true;

            calendarPanel.classList.add("calendar-open");
            calendarOverlay.classList.add("calendar-overlay-open");

            calendarPanel.setAttribute("aria-hidden", "false");

            renderCalendar();
        }

        function closeCalendar() {

            if (!calendarOpen) return;

            calendarOpen = false;

            calendarPanel.classList.remove("calendar-open");
            calendarOverlay.classList.remove("calendar-overlay-open");

            calendarPanel.setAttribute("aria-hidden", "true");
        }

        function changeCalendarMonth(amount) {

            calendarViewDate = new Date(
                calendarViewDate.getFullYear(),
                calendarViewDate.getMonth() + amount,
                1
            );

            renderCalendar();
        }

        if (calendarPrevMonth) {
            calendarPrevMonth.addEventListener("click", () => {
                changeCalendarMonth(-1);
            });
        }

        if (calendarNextMonth) {
            calendarNextMonth.addEventListener("click", () => {
                changeCalendarMonth(1);
            });
        }

        function renderSelectedDate(holidays) {

            const key = getCalendarDateKey(calendarSelectedDate);

            selectedDateTitle.textContent =
                calendarSelectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

            if (holidays === null) {
                selectedDateDescription.textContent =
                    "Holiday information is currently unavailable.";
                return;
            }

            const holiday = holidays.find(item => item.date === key);

            if (holiday) {
                selectedDateDescription.textContent =
                    `🇮🇳 ${holiday.localName || holiday.name}`;
            } else {
                selectedDateDescription.textContent =
                    "No nationwide public holiday listed for this date.";
            }
        }

        function renderHolidayList(holidays) {

            calendarHolidayList.replaceChildren();

            if (holidays === null) {
                const message = document.createElement("p");
                message.className = "calendar-no-holidays";
                message.textContent = "Unable to load holiday information.";

                calendarHolidayList.appendChild(message);
                return;
            }

            const year = calendarViewDate.getFullYear();
            const month = calendarViewDate.getMonth();

            const monthHolidays = holidays
                .filter(holiday => {
                    const parts = holiday.date.split("-");

                    return (
                        Number(parts[0]) === year &&
                        Number(parts[1]) - 1 === month
                    );
                })
                .sort((a, b) => a.date.localeCompare(b.date));

            if (!monthHolidays.length) {
                const message = document.createElement("p");
                message.className = "calendar-no-holidays";
                message.textContent =
                    "No nationwide public holidays listed this month.";

                calendarHolidayList.appendChild(message);
                return;
            }

            monthHolidays.forEach(holiday => {

                const item = document.createElement("div");
                item.className = "calendar-holiday-item";

                const name = document.createElement("span");
                name.className = "calendar-holiday-name";
                name.textContent = holiday.localName || holiday.name;

                const holidayDate = document.createElement("span");
                holidayDate.className = "calendar-holiday-date";

                const dateParts = holiday.date.split("-").map(Number);

                holidayDate.textContent = new Date(
                    dateParts[0],
                    dateParts[1] - 1,
                    dateParts[2]
                ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                });

                item.appendChild(name);
                item.appendChild(holidayDate);

                calendarHolidayList.appendChild(item);
            });
        }

        async function renderCalendar() {

            const year = calendarViewDate.getFullYear();
            const month = calendarViewDate.getMonth();

            calendarMonthYear.textContent =
                calendarViewDate.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                });

            calendarGrid.replaceChildren();

            const firstDay = new Date(year, month, 1);
            const startingDay = (firstDay.getDay() + 6) % 7;

            const todayKey = getCalendarDateKey(new Date());

            const firstVisibleDate = new Date(
                year,
                month,
                1 - startingDay
            );

            const dates = [];

            for (let i = 0; i < 42; i++) {
                dates.push(
                    new Date(
                        firstVisibleDate.getFullYear(),
                        firstVisibleDate.getMonth(),
                        firstVisibleDate.getDate() + i
                    )
                );
            }

            const years = [...new Set(
                dates.map(date => date.getFullYear())
            )];

            const holidayResults = await Promise.all(
                years.map(year => loadIndiaHolidays(year))
            );

            const allHolidays = holidayResults.every(
                result => result !== null
            )
                ? holidayResults.flat()
                : null;

            if (
                year !== calendarViewDate.getFullYear() ||
                month !== calendarViewDate.getMonth()
            ) {
                return;
            }

            const holidayDates = new Set(
                (allHolidays || []).map(holiday => holiday.date)
            );

            dates.forEach(day => {

                const key = getCalendarDateKey(day);

                const dayButton = document.createElement("button");

                dayButton.type = "button";
                dayButton.className = "calendar-day";
                dayButton.textContent = day.getDate();

                dayButton.setAttribute(
                    "aria-label",
                    day.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })
                );

                if (day.getMonth() !== month) {
                    dayButton.classList.add("other-month");
                }

                if (key === todayKey) {
                    dayButton.classList.add("today");
                }

                if (key === getCalendarDateKey(calendarSelectedDate)) {
                    dayButton.classList.add("selected");
                }

                if (holidayDates.has(key)) {
                    dayButton.classList.add("holiday");
                }

                dayButton.addEventListener("click", () => {

                    calendarSelectedDate = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate()
                    );

                    if (day.getMonth() !== calendarViewDate.getMonth()) {
                        calendarViewDate = new Date(
                            day.getFullYear(),
                            day.getMonth(),
                            1
                        );
                    }

                    renderCalendar();
                });

                calendarGrid.appendChild(dayButton);
            });

            renderSelectedDate(
                allHolidays
                    ? allHolidays.filter(holiday =>
                        holiday.date.startsWith(
                            getCalendarDateKey(calendarSelectedDate).slice(0, 4)
                        )
                    )
                    : null
            );

            renderHolidayList(
                allHolidays
                    ? allHolidays.filter(holiday =>
                        holiday.date.startsWith(String(year))
                    )
                    : null
            );
        }

        if (calendarEdgeTrigger) {
            calendarEdgeTrigger.addEventListener("click", openCalendar);
        }

        if (calendarClose) {
            calendarClose.addEventListener("click", closeCalendar);
        }

        calendarOverlay.addEventListener("click", closeCalendar);

        calendarPanel.setAttribute("aria-hidden", "true");
    }


    // -----------------------------------------
    // UNIVERSAL EDGE SWIPE + MOUSE DRAG
    // -----------------------------------------

    let gestureStartX = 0;
    let gestureStartY = 0;
    let gestureStartEdge = null;
    let gesturePointerId = null;

    const EDGE_WIDTH = 110;
    const SWIPE_THRESHOLD = 65;
    const VERTICAL_TOLERANCE = 1.2;

    document.addEventListener("pointerdown", (event) => {

        if (!event.isPrimary) return;

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        gestureStartX = event.clientX;
        gestureStartY = event.clientY;
        gesturePointerId = event.pointerId;

        if (notesOpen) {
            gestureStartEdge = "notes";
        } else if (calendarOpen) {
            gestureStartEdge = "calendar";
        } else if (event.clientX <= EDGE_WIDTH) {
            gestureStartEdge = "left";
        } else if (event.clientX >= window.innerWidth - EDGE_WIDTH) {
            gestureStartEdge = "right";
        } else {
            gestureStartEdge = null;
        }

    }, { passive: true });

    document.addEventListener("pointerup", (event) => {

        if (gesturePointerId !== event.pointerId) return;

        const differenceX = event.clientX - gestureStartX;
        const differenceY = event.clientY - gestureStartY;

        const startEdge = gestureStartEdge;

        gestureStartEdge = null;
        gesturePointerId = null;

        if (!startEdge) return;

        if (Math.abs(differenceY) > Math.abs(differenceX) * VERTICAL_TOLERANCE) {
            return;
        }

        // Open Notes: swipe right from left edge

        if (
            startEdge === "left" &&
            differenceX > SWIPE_THRESHOLD
        ) {
            openNotes();
            return;
        }

        // Open Calendar: swipe left from right edge

        if (
            startEdge === "right" &&
            differenceX < -SWIPE_THRESHOLD
        ) {
            openCalendar();
            return;
        }

        // Close Notes: swipe left-to-right from the left edge

        if (
            startEdge === "notes" &&
            differenceX > SWIPE_THRESHOLD
        ) {
            closeNotes();
            return;
        }

        // Close Calendar: swipe right-to-left? 
        // Swipe right from anywhere while the calendar is open.

        if (
            startEdge === "calendar" &&
            differenceX > SWIPE_THRESHOLD
        ) {
            closeCalendar();
        }

    }, { passive: true });

    document.addEventListener("pointercancel", () => {
        gestureStartEdge = null;
        gesturePointerId = null;
    });

    // Escape closes whichever workspace is open

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") return;

        if (notesOpen) {
            closeNotes();
        } else if (calendarOpen) {
            closeCalendar();
        }

    });



    // 9. YOUTUBE MUSIC INTEGRATION

    const musicElements = {
        title: document.getElementById("musicTitle"),
        artist: document.getElementById("musicArtist"),
        status: document.getElementById("musicStatus"),
        artwork: document.getElementById("musicArtwork"),
        playPause: document.getElementById("musicPlayPause"),
        previous: document.getElementById("musicPrevious"),
        next: document.getElementById("musicNext"),
        progress: document.getElementById("musicProgress"),
        currentTime: document.getElementById("musicCurrentTime"),
        duration: document.getElementById("musicDuration")
    };

    let musicTabId = null;
    let musicSeeking = false;

    function formatMusicTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function findMusicTab(callback) {
        chrome.tabs.query(
            { url: "https://music.youtube.com/*" },
            (tabs) => {
                musicTabId = tabs.length ? tabs[0].id : null;
                callback(musicTabId);
            }
        );
    }

    function sendMusicMessage(message, callback) {
        findMusicTab((tabId) => {
            if (!tabId) {
                if (callback) callback(null);
                return;
            }

            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                    if (callback) callback(null);
                    return;
                }

                if (callback) callback(response);
            });
        });
    }

    function updateMusicInterface(state) {
        if (!state || !state.connected) {
            musicElements.status.textContent = "WAITING FOR MUSIC";
            musicElements.title.textContent = "No song playing";
            musicElements.artist.textContent = "Open YouTube Music to begin";
            musicElements.playPause.textContent = "▶";

            musicElements.currentTime.textContent = "0:00";
            musicElements.duration.textContent = "0:00";
            musicElements.progress.value = 0;
            musicElements.progress.max = 100;

            musicElements.artwork.replaceChildren(
                document.createTextNode("♫")
            );

            return;
        }

        musicElements.status.textContent =
            state.playing ? "NOW PLAYING" : "PAUSED";

        musicElements.title.textContent = state.title;
        musicElements.artist.textContent = state.artist;

        const nextTitle = document.getElementById("nextTitle");
        const nextArtist = document.getElementById("nextArtist");
        const nextArtwork = document.getElementById("nextArtwork");

        if (nextTitle) {
            nextTitle.textContent = state.nextTitle || "End of queue";
        }

        if (nextArtist) {
            nextArtist.textContent = state.nextArtist || "";
        }

        if (nextArtwork && state.nextArtwork) {
            const image = document.createElement("img");
            image.src = state.nextArtwork;
            image.alt = "Upcoming song artwork";
            nextArtwork.replaceChildren(image);
        }

        musicElements.playPause.textContent =
            state.playing ? "Ⅱ" : "▶";

        musicElements.currentTime.textContent =
            formatMusicTime(state.currentTime);

        musicElements.duration.textContent =
            formatMusicTime(state.duration);

        musicElements.progress.max = state.duration || 100;

        if (!musicSeeking) {
            musicElements.progress.value = state.currentTime || 0;
        }

        if (state.artwork) {
            const currentImage =
                musicElements.artwork.querySelector("img");

            if (!currentImage || currentImage.src !== state.artwork) {
                const image = document.createElement("img");
                image.src = state.artwork;
                image.alt = "Album artwork";

                musicElements.artwork.replaceChildren(image);
            }
        } else {
            musicElements.artwork.replaceChildren(
                document.createTextNode("♫")
            );
        }
    }

    // GET LIVE MUSIC INFORMATION

    function refreshMusicState() {
        sendMusicMessage(
            { type: "NEBULA_GET_STATE" },
            updateMusicInterface
        );
    }

    // PLAY / PAUSE

    musicElements.playPause.addEventListener("click", () => {
        sendMusicMessage({
            type: "NEBULA_CONTROL",
            action: "playPause"
        }, refreshMusicState);
    });

    // PREVIOUS TRACK

    musicElements.previous.addEventListener("click", () => {
        sendMusicMessage({
            type: "NEBULA_CONTROL",
            action: "previous"
        }, refreshMusicState);
    });

    // NEXT TRACK

    musicElements.next.addEventListener("click", () => {
        sendMusicMessage({
            type: "NEBULA_CONTROL",
            action: "next"
        }, refreshMusicState);
    });

    // PLAYBACK SEEKING

    musicElements.progress.addEventListener("input", () => {
        musicSeeking = true;

        musicElements.currentTime.textContent =
            formatMusicTime(Number(musicElements.progress.value));
    });

    musicElements.progress.addEventListener("change", () => {
        const seekTime = Number(musicElements.progress.value);

        sendMusicMessage({
            type: "NEBULA_CONTROL",
            action: "seek",
            value: seekTime
        }, () => {
            musicSeeking = false;
            refreshMusicState();
        });
    });

    // REFRESH TRACK INFORMATION EVERY 500 MILLISECONDS

    refreshMusicState();
    setInterval(refreshMusicState, 500);

});
