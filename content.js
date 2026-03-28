(() => {
  if (window.__doomscrollPunisherLoaded) {
    return;
  }

  window.__doomscrollPunisherLoaded = true;

  const FEEDBACK_COOLDOWN_MS = 1500;
  const OVERLAY_DURATION_MS = 60000;
  const AUDIO_START_SECONDS = 51;
  const RESNAPSHOT_DELAY_MS = 80;
  const SCAN_DEBOUNCE_MS = 150;
  const ROOT_LOCK_ATTRIBUTE = "data-doomscroll-punisher-root-locked";
  const KEYBOARD_SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    "Home",
    "End",
    " ",
  ]);
  const SHAME_DATA = window.__doomscrollPunisherShameData || {};

  const audioUrl = chrome.runtime.getURL(
    "assets/Underground Resistance - Electronic Warfare ( Vocal ).mp3"
  );
  const imageUrl = chrome.runtime.getURL("assets/UR.jpeg");
  const fallbackImageUrl = chrome.runtime.getURL("assets/underground-resistance.svg");
  const overlayId = "doomscroll-punisher-overlay";
  const styleId = "doomscroll-punisher-style";
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  const state = {
    lastFeedbackAt: 0,
    overlayTimer: 0,
    overlayCountdownTimer: 0,
    resnapshotTimer: 0,
    scanTimer: 0,
    lockedElements: new Map(),
    observer: null,
  };

  let audioElement = null;
  let audioContext = null;
  let audioBuffer = null;
  let audioBufferPromise = null;
  let activeBufferSource = null;

  function ensureStyle() {
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      html[${ROOT_LOCK_ATTRIBUTE}="true"],
      html[${ROOT_LOCK_ATTRIBUTE}="true"] body {
        overscroll-behavior: none !important;
      }

      #${overlayId} {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: clamp(18px, 4vw, 42px);
        background:
          radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.06), transparent 24%),
          radial-gradient(circle at 12% 88%, rgba(255, 255, 255, 0.04), transparent 28%),
          linear-gradient(180deg, rgba(6, 6, 8, 0.78), rgba(3, 3, 5, 0.94));
        backdrop-filter: blur(10px) saturate(0.1);
        opacity: 0;
        pointer-events: none;
        touch-action: none;
        transition: opacity 160ms ease;
        z-index: 2147483647;
      }

      #${overlayId}.is-visible {
        opacity: 1;
      }

      #${overlayId} .doomscroll-punisher-card {
        position: relative;
        width: min(1120px, calc(100vw - 16px));
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: clamp(26px, 4vw, 42px);
        background: #000000;
        box-shadow:
          0 22px 72px rgba(0, 0, 0, 0.44),
          inset 0 1px 0 rgba(255, 255, 255, 0.03);
        text-align: left;
        color: #e7e4ea;
        font-family: "Aptos", "Segoe UI Variable", "Segoe UI", sans-serif;
        overflow: hidden;
        animation: doomscroll-punisher-arrive 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      #${overlayId} .doomscroll-punisher-card,
      #${overlayId} .doomscroll-punisher-card * {
        pointer-events: none;
      }

      #${overlayId} .doomscroll-punisher-source-link {
        color: inherit;
        text-decoration-line: underline;
        text-decoration-style: solid;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.18em;
        pointer-events: auto !important;
        touch-action: auto;
        cursor: pointer;
      }

      #${overlayId} .doomscroll-punisher-source-link:hover,
      #${overlayId} .doomscroll-punisher-source-link:focus-visible {
        color: rgba(228, 220, 238, 0.84);
        outline: none;
      }

      #${overlayId} .doomscroll-punisher-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
        background: linear-gradient(180deg, #111111 0%, #7d7d7d 56%, #f0f0f0 100%);
      }

      #${overlayId} .doomscroll-punisher-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          repeating-linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.012) 0 1px,
            rgba(255, 255, 255, 0) 1px 3px
          );
        mix-blend-mode: screen;
        opacity: 0.35;
        pointer-events: none;
      }

      #${overlayId} .doomscroll-punisher-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 18px 24px;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      #${overlayId} .doomscroll-punisher-head-copy {
        min-width: 0;
      }

      #${overlayId} img {
        width: 138%;
        height: 138%;
        max-height: none;
        display: block;
        margin: 0 auto;
        object-fit: cover;
        object-position: center;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        filter: grayscale(1) contrast(1.2) brightness(1.06);
        transform: scale(2.2);
      }

      #${overlayId} .doomscroll-punisher-kicker {
        display: block;
        color: rgba(232, 224, 238, 0.76);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        font-family: "Consolas", "Lucida Console", "Courier New", monospace;
      }

      #${overlayId} .doomscroll-punisher-countdown {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        padding: 0;
        border-radius: 0;
        background: transparent;
        color: #e4e0e8;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-family: "Consolas", "Lucida Console", "Courier New", monospace;
      }

      #${overlayId} .doomscroll-punisher-body {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.95fr);
        gap: clamp(24px, 3vw, 40px);
        align-items: center;
        margin-top: 28px;
      }

      #${overlayId} .doomscroll-punisher-copy {
        min-width: 0;
      }

      #${overlayId} .doomscroll-punisher-intro {
        margin: 0 0 14px;
        color: rgba(225, 219, 232, 0.7);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-family: "Consolas", "Lucida Console", "Courier New", monospace;
      }

      #${overlayId} .doomscroll-punisher-text {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", serif;
        font-size: clamp(32px, 3.25vw, 52px);
        line-height: 1.04;
        letter-spacing: -0.03em;
        color: #e6e1e8;
        max-width: none;
        text-wrap: pretty;
      }

      #${overlayId} .doomscroll-punisher-source {
        display: block;
        margin-top: 18px;
        color: rgba(201, 193, 205, 0.54);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-family: "Consolas", "Lucida Console", "Courier New", monospace;
      }

      #${overlayId} .doomscroll-punisher-media {
        display: flex;
        justify-content: center;
        align-items: center;
        align-self: stretch;
        min-height: 100%;
      }

      #${overlayId} .doomscroll-punisher-media-panel {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: clamp(420px, 40vw, 560px);
        padding: 0;
        border-radius: 8px;
        overflow: hidden;
        background: #000000;
        border: 0;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.02),
          0 12px 34px rgba(0, 0, 0, 0.28);
        isolation: isolate;
      }

      #${overlayId} .doomscroll-punisher-media-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0)),
          repeating-linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.018) 0 1px,
            rgba(255, 255, 255, 0) 1px 3px
          );
        pointer-events: none;
      }

      #${overlayId} .doomscroll-punisher-media-panel::after {
        content: "";
        position: absolute;
        inset: 0;
        border: 0;
        pointer-events: none;
      }

      #${overlayId} .doomscroll-punisher-footer {
        margin-top: 22px;
      }

      #${overlayId} .doomscroll-punisher-rule {
        height: 1px;
        margin-bottom: 12px;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0));
      }

      #${overlayId} .doomscroll-punisher-progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
      }

      #${overlayId} .doomscroll-punisher-progress-label,
      #${overlayId} .doomscroll-punisher-progress-note {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-family: "Consolas", "Lucida Console", "Courier New", monospace;
      }

      #${overlayId} .doomscroll-punisher-progress-label {
        color: rgba(224, 217, 232, 0.74);
      }

      #${overlayId} .doomscroll-punisher-progress-note {
        color: rgba(192, 185, 200, 0.48);
        text-align: right;
      }

      #${overlayId} .doomscroll-punisher-progress {
        width: 100%;
        height: 28px;
        overflow: hidden;
        border-radius: 0;
        padding: 3px;
        background: #0f0f12;
        box-shadow:
          inset 0 0 0 1px rgba(220, 212, 230, 0.16),
          inset 0 -1px 0 rgba(255, 255, 255, 0.04),
          0 0 0 1px rgba(0, 0, 0, 0.45);
      }

      #${overlayId} .doomscroll-punisher-progress-bar {
        width: 100%;
        height: 100%;
        border-radius: 0;
        background: #7d5cff;
        box-shadow:
          inset 0 -1px 0 rgba(46, 28, 108, 0.62),
          inset 0 1px 0 rgba(208, 192, 255, 0.24);
        image-rendering: pixelated;
        transition: width 60s steps(120, end);
      }

      @media (max-width: 680px) {
        #${overlayId} .doomscroll-punisher-card {
          width: min(720px, calc(100vw - 14px));
          border-radius: 6px;
        }

        #${overlayId} .doomscroll-punisher-body {
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
        }

        #${overlayId} img {
          width: 146%;
          height: 146%;
        }

        #${overlayId} .doomscroll-punisher-media-panel {
          min-height: 280px;
        }

        #${overlayId} .doomscroll-punisher-progress-meta {
          flex-direction: column;
          align-items: flex-start;
        }

        #${overlayId} .doomscroll-punisher-progress-note {
          text-align: left;
        }
      }

      @media (max-width: 520px) {
        #${overlayId} .doomscroll-punisher-head {
          flex-direction: column;
          align-items: flex-start;
        }

        #${overlayId} .doomscroll-punisher-countdown {
          min-width: 0;
        }

        #${overlayId} .doomscroll-punisher-text {
          max-width: none;
        }
      }

      @keyframes doomscroll-punisher-arrive {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.985);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

    `;

    document.documentElement.appendChild(style);
  }

  function ensureOverlay() {
    ensureStyle();
    return document.getElementById(overlayId);
  }

  function ensureAudio() {
    if (audioElement) {
      return audioElement;
    }

    audioElement = document.createElement("audio");
    audioElement.preload = "auto";
    audioElement.src = audioUrl;
    audioElement.style.display = "none";
    document.documentElement.appendChild(audioElement);
    return audioElement;
  }

  function preloadAudioElement() {
    try {
      const audio = ensureAudio();
      if (audio.readyState < 2) {
        audio.load();
      }
    } catch (_error) {
      // Ignore preload failures and fall back to other audio paths.
    }
  }

  function preloadAudioBuffer() {
    if (!AudioContextCtor || audioBuffer || audioBufferPromise) {
      return audioBufferPromise;
    }

    audioContext = audioContext || new AudioContextCtor();
    audioBufferPromise = fetch(audioUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Audio fetch failed: ${response.status}`);
        }

        return response.arrayBuffer();
      })
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer.slice(0)))
      .then((decodedBuffer) => {
        audioBuffer = decodedBuffer;
        return decodedBuffer;
      })
      .catch(() => {
        audioBufferPromise = null;
        return null;
      });

    return audioBufferPromise;
  }

  function stopBufferSource() {
    if (!activeBufferSource) {
      return;
    }

    try {
      activeBufferSource.stop();
    } catch (_error) {
      // Ignore stop races; the source may have already ended.
    }

    activeBufferSource.disconnect();
    activeBufferSource = null;
  }

  function playFallbackTone() {
    if (!AudioContextCtor) {
      return;
    }

    try {
      audioContext = audioContext || new AudioContextCtor();
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const startAt = audioContext.currentTime;

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(900, startAt);
      oscillator.frequency.linearRampToValueAtTime(440, startAt + 0.32);

      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.12, startAt + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.35);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(startAt);
      oscillator.stop(startAt + 0.35);
    } catch (_error) {
      // Ignore audio failures so the visual warning still appears.
    }
  }

  function playSound() {
    const playAudioElement = () => {
      try {
        const audio = ensureAudio();
        if (audio.readyState < 1) {
          return false;
        }

        audio.pause();
        audio.currentTime =
          Number.isFinite(audio.duration) && audio.duration > AUDIO_START_SECONDS
            ? AUDIO_START_SECONDS
            : 0;

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            playFallbackTone();
          });
        }
        return true;
      } catch (_error) {
        playFallbackTone();
        return false;
      }
    };

    const playBuffer = async () => {
      if (!AudioContextCtor) {
        return false;
      }

      if (!audioBuffer) {
        return false;
      }

      audioContext = audioContext || new AudioContextCtor();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      stopBufferSource();

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      const startOffset =
        audioBuffer.duration > AUDIO_START_SECONDS
          ? AUDIO_START_SECONDS
          : 0;

      source.onended = () => {
        if (activeBufferSource === source) {
          activeBufferSource.disconnect();
          activeBufferSource = null;
        }
      };

      activeBufferSource = source;
      source.start(0, startOffset);
      return true;
    };

    if (audioBuffer) {
      playBuffer().catch(() => {
        if (!playAudioElement()) {
          playFallbackTone();
        }
      });
      return;
    }

    if (playAudioElement()) {
      return;
    }

    preloadAudioElement();
    preloadAudioBuffer();
    playFallbackTone();
  }

  function stopSound() {
    stopBufferSource();

    if (!audioElement) {
      return;
    }

    try {
      audioElement.pause();
      audioElement.currentTime = AUDIO_START_SECONDS;
    } catch (_error) {
      // Ignore teardown failures so the overlay can still clean up.
    }
  }

  function getShameEntry() {
    const hostname = window.location.hostname.replace(/^www\./i, "");
    const directKeys = Object.keys(SHAME_DATA).filter((key) => !key.startsWith("_"));
    const matchedKey = directKeys.find(
      (key) => hostname === key || hostname.endsWith(`.${key}`)
    );
    const entries =
      matchedKey && Array.isArray(SHAME_DATA[matchedKey])
        ? [...SHAME_DATA[matchedKey]]
        : [];

    if (matchedKey === "instagram.com" || matchedKey === "facebook.com") {
      const metaScope = SHAME_DATA._scope && Array.isArray(SHAME_DATA._scope.meta)
        ? SHAME_DATA._scope.meta
        : [];
      entries.push(...metaScope);
    }

    if (matchedKey === "linkedin.com") {
      const microsoftScope =
        SHAME_DATA._scope && Array.isArray(SHAME_DATA._scope.microsoft)
          ? SHAME_DATA._scope.microsoft
          : [];
      const gatesEntries =
        SHAME_DATA._people && Array.isArray(SHAME_DATA._people.bill_gates)
          ? SHAME_DATA._people.bill_gates
          : [];

      entries.push(...microsoftScope);
      entries.push(...gatesEntries);
    }

    if (!entries || entries.length === 0) {
      return {
        text: "You are being watched by an algorithm right now.",
        source: "",
      };
    }

    return entries[Math.floor(Math.random() * entries.length)];
  }

  function formatShameDate(value, displayValue) {
    if (displayValue) {
      return displayValue;
    }

    if (!value) {
      return "";
    }

    const parts = value.split("-");
    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) {
      return value;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getSourceMarkup(shameEntry) {
    const sourceText = [
      shameEntry.source,
      formatShameDate(shameEntry.date, shameEntry.displayDate),
    ]
      .filter(Boolean)
      .join(" / ");

    if (!sourceText) {
      return "";
    }

    const safeText = escapeHtml(sourceText);
    if (!shameEntry.sourceUrl) {
      return safeText;
    }

    return `
      <a
        class="doomscroll-punisher-source-link"
        href="${escapeHtml(shameEntry.sourceUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >${safeText}</a>
    `;
  }

  function showFeedback() {
    const now = performance.now();
    const existingOverlay = ensureOverlay();
    if (existingOverlay) {
      return;
    }

    if (now - state.lastFeedbackAt < FEEDBACK_COOLDOWN_MS) {
      return;
    }

    state.lastFeedbackAt = now;
    window.clearTimeout(state.overlayTimer);
    window.clearInterval(state.overlayCountdownTimer);

    const shameEntry = getShameEntry();
    const sourceMarkup = getSourceMarkup(shameEntry);

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.innerHTML = `
      <div class="doomscroll-punisher-card" role="alert" aria-live="assertive">
        <div class="doomscroll-punisher-head">
          <div class="doomscroll-punisher-head-copy">
            <span class="doomscroll-punisher-kicker">Scroll lock</span>
          </div>
          <span class="doomscroll-punisher-countdown"></span>
        </div>
        <div class="doomscroll-punisher-body">
          <div class="doomscroll-punisher-copy">
            <p class="doomscroll-punisher-intro">Resistance dispatch</p>
            <p class="doomscroll-punisher-text">${escapeHtml(shameEntry.text)}</p>
            <span class="doomscroll-punisher-source">${sourceMarkup}</span>
          </div>
          <div class="doomscroll-punisher-media">
            <div class="doomscroll-punisher-media-panel">
              <img alt="Doomscroll warning" src="${imageUrl}">
            </div>
          </div>
        </div>
        <div class="doomscroll-punisher-footer">
          <div class="doomscroll-punisher-rule"></div>
          <div class="doomscroll-punisher-progress-meta">
            <span class="doomscroll-punisher-progress-label">Signal hold</span>
            <span class="doomscroll-punisher-progress-note">Hold position until the window clears</span>
          </div>
          <div class="doomscroll-punisher-progress">
            <div class="doomscroll-punisher-progress-bar"></div>
          </div>
        </div>
      </div>
    `;

    const image = overlay.querySelector("img");
    image.addEventListener("error", () => {
      if (image.dataset.fallbackApplied === "true") {
        image.style.display = "none";
        return;
      }

      image.dataset.fallbackApplied = "true";
      image.src = fallbackImageUrl;
    });

    const sourceLink = overlay.querySelector(".doomscroll-punisher-source-link");
    if (sourceLink) {
      const consumePointerEvent = (event) => {
        event.stopPropagation();
      };

      sourceLink.addEventListener("pointerdown", consumePointerEvent);
      sourceLink.addEventListener("mousedown", consumePointerEvent);
      sourceLink.addEventListener("mouseup", consumePointerEvent);
      sourceLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(shameEntry.sourceUrl, "_blank", "noopener,noreferrer");
      });
    }

    const countdown = overlay.querySelector(".doomscroll-punisher-countdown");
    const progressBar = overlay.querySelector(".doomscroll-punisher-progress-bar");
    const startedAt = Date.now();

    function updateCountdown() {
      const elapsedMs = Date.now() - startedAt;
      const remainingSeconds = Math.max(
        0,
        Math.ceil((OVERLAY_DURATION_MS - elapsedMs) / 1000)
      );
      countdown.textContent = `${remainingSeconds}s remaining`;
    }

    updateCountdown();
    document.documentElement.appendChild(overlay);
    overlay.classList.add("is-visible");

    window.requestAnimationFrame(() => {
      progressBar.style.width = "0%";
    });

    state.overlayCountdownTimer = window.setInterval(() => {
      updateCountdown();
    }, 1000);

    state.overlayTimer = window.setTimeout(() => {
      window.clearInterval(state.overlayCountdownTimer);
      state.overlayCountdownTimer = 0;
      progressBar.style.transition = "none";
      progressBar.style.width = "100%";
      stopSound();
      overlay.remove();
    }, OVERLAY_DURATION_MS);

    playSound();
  }

  function swallowEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function isEditableTarget(target) {
    if (!target || !(target instanceof Element)) {
      return false;
    }

    return Boolean(target.closest("input, textarea, select, [contenteditable]"));
  }

  function isScrollKey(event) {
    return (
      KEYBOARD_SCROLL_KEYS.has(event.key) ||
      event.code === "Space" ||
      event.key === "Spacebar"
    );
  }

  function shouldLockElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (
      element === document.documentElement ||
      element === document.body ||
      element === document.scrollingElement
    ) {
      return true;
    }

    const style = window.getComputedStyle(element);
    const overflowY = `${style.overflowY} ${style.overflow}`;
    const overflowX = `${style.overflowX} ${style.overflow}`;
    const canScrollY =
      /(auto|scroll|overlay)/.test(overflowY) &&
      element.scrollHeight > element.clientHeight + 2;
    const canScrollX =
      /(auto|scroll|overlay)/.test(overflowX) &&
      element.scrollWidth > element.clientWidth + 2;

    return canScrollY || canScrollX;
  }

  function restoreSnapshot(element) {
    const snapshot = state.lockedElements.get(element);
    if (!snapshot) {
      return;
    }

    if (element.scrollTop !== snapshot.top) {
      element.scrollTop = snapshot.top;
    }

    if (element.scrollLeft !== snapshot.left) {
      element.scrollLeft = snapshot.left;
    }
  }

  function lockElement(element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (!state.lockedElements.has(element)) {
      state.lockedElements.set(element, {
        top: element.scrollTop,
        left: element.scrollLeft,
      });
    }

    element.style.setProperty("overflow", "hidden", "important");
    element.style.setProperty("overflow-x", "hidden", "important");
    element.style.setProperty("overflow-y", "hidden", "important");
    element.style.setProperty("overscroll-behavior", "none", "important");
    element.style.setProperty("scroll-behavior", "auto", "important");

    restoreSnapshot(element);
  }

  function lockTree(root) {
    if (!root) {
      return;
    }

    const candidates = [];
    if (root instanceof HTMLElement) {
      candidates.push(root);
    }

    if (root.querySelectorAll) {
      candidates.push(...root.querySelectorAll("*"));
    }

    for (const element of candidates) {
      if (shouldLockElement(element)) {
        lockElement(element);
      }
    }
  }

  function lockKnownScrollers() {
    document.documentElement.setAttribute(ROOT_LOCK_ATTRIBUTE, "true");
    lockElement(document.documentElement);

    if (document.body) {
      lockElement(document.body);
      lockTree(document.body);
    }

    const rootScroller = document.scrollingElement;
    if (rootScroller instanceof HTMLElement) {
      lockElement(rootScroller);
    }
  }

  function resnapshotLockedElements() {
    for (const [element, snapshot] of state.lockedElements.entries()) {
      snapshot.top = element.scrollTop;
      snapshot.left = element.scrollLeft;
      lockElement(element);
    }
  }

  function scheduleScan() {
    window.clearTimeout(state.scanTimer);
    state.scanTimer = window.setTimeout(() => {
      lockKnownScrollers();
    }, SCAN_DEBOUNCE_MS);
  }

  function scheduleResnapshot() {
    window.clearTimeout(state.resnapshotTimer);
    state.resnapshotTimer = window.setTimeout(() => {
      lockKnownScrollers();
      resnapshotLockedElements();
    }, RESNAPSHOT_DELAY_MS);
  }

  function handleBlockedWheel(event) {
    showFeedback();
    swallowEvent(event);
  }

  function handleBlockedTouchMove(event) {
    showFeedback();
    swallowEvent(event);
  }

  function handleBlockedKeydown(event) {
    if (event.defaultPrevented || isEditableTarget(event.target)) {
      return;
    }

    if (!isScrollKey(event)) {
      return;
    }

    showFeedback();
    swallowEvent(event);
  }

  function handleBlockedScroll(event) {
    const target =
      event.target === document
        ? document.scrollingElement || document.documentElement
        : event.target;

    if (target instanceof HTMLElement) {
      if (shouldLockElement(target)) {
        lockElement(target);
      }

      restoreSnapshot(target);
    }

    if (document.scrollingElement instanceof HTMLElement) {
      restoreSnapshot(document.scrollingElement);
    }

    if (document.body instanceof HTMLElement) {
      restoreSnapshot(document.body);
    }

    restoreSnapshot(document.documentElement);
    showFeedback();
    event.stopImmediatePropagation();
  }

  function wrapHistoryMethod(methodName) {
    const originalMethod = window.history[methodName];
    if (typeof originalMethod !== "function") {
      return;
    }

    window.history[methodName] = function patchedHistoryMethod(...args) {
      const result = originalMethod.apply(this, args);
      window.setTimeout(scheduleResnapshot, 0);
      return result;
    };
  }

  function startObserver() {
    if (state.observer) {
      return;
    }

    state.observer = new MutationObserver((mutations) => {
      let needsScan = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          needsScan = true;
          continue;
        }

        if (
          mutation.type === "attributes" &&
          mutation.target instanceof HTMLElement &&
          shouldLockElement(mutation.target)
        ) {
          lockElement(mutation.target);
        }
      }

      if (needsScan) {
        scheduleScan();
      }
    });

    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  }

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");

  preloadAudioElement();
  preloadAudioBuffer();

  window.addEventListener("wheel", handleBlockedWheel, {
    capture: true,
    passive: false,
  });
  window.addEventListener("mousewheel", handleBlockedWheel, {
    capture: true,
    passive: false,
  });
  window.addEventListener("touchmove", handleBlockedTouchMove, {
    capture: true,
    passive: false,
  });
  window.addEventListener("keydown", handleBlockedKeydown, true);
  window.addEventListener("popstate", scheduleResnapshot);
  window.addEventListener("hashchange", scheduleResnapshot);
  window.addEventListener("pagehide", stopSound);
  window.addEventListener("beforeunload", stopSound);
  document.addEventListener("scroll", handleBlockedScroll, true);

  lockKnownScrollers();
  startObserver();
  scheduleResnapshot();
})();
