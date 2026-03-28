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
  const SHAME_DATA = {
    "linkedin.com": [
      {
        id: "li_01",
        text: "LinkedIn was fined \u20ac310M by Ireland's data regulator over targeted advertising practices that lacked a valid legal basis under GDPR.",
        source: "Reuters / Irish DPC",
        date: "2024-10-24",
        type: "privacy-fine",
        scope: "linkedin"
      },
      {
        id: "li_02",
        text: "LinkedIn says some member data, including profile details and public posts, can be used to train generative AI models in certain regions; private messages are excluded.",
        source: "LinkedIn Help",
        date: "2025-11-03",
        type: "ai-data-use",
        scope: "linkedin"
      },
      {
        id: "li_03",
        text: "LinkedIn says some regions can also have additional LinkedIn data shared with Microsoft for more personalized ads, with an opt-out in settings.",
        source: "LinkedIn Help",
        date: "2025-11-03",
        type: "cross-company-data-sharing",
        scope: "linkedin"
      },
      {
        id: "li_04",
        text: "LinkedIn agreed to a $6.625M settlement with advertisers who said it inflated video-ad metrics and overcharged them.",
        source: "Reuters",
        date: "2024-07-26",
        type: "ad-metrics-settlement",
        scope: "linkedin"
      },
      {
        id: "li_05",
        text: "LinkedIn settled an antitrust suit by agreeing to stop enforcing certain API contract terms that plaintiffs said blocked potential rivals and reduced competition.",
        source: "Reuters",
        date: "2025-07-14",
        type: "antitrust-settlement",
        scope: "linkedin"
      },
      {
        id: "li_06",
        text: "LinkedIn said profile data posted for sale online had been scraped from LinkedIn and other sites; it said this was not a breach, but scraped LinkedIn data was involved.",
        source: "Reuters / LinkedIn",
        date: "2021-04-09",
        type: "scraping",
        scope: "linkedin"
      },
      {
        id: "li_07",
        text: "LinkedIn agreed to a $13M settlement over its 'Add Connections' feature after users said it sent repeated invitations to contacts without clear consent.",
        source: "Time / Reuters",
        date: "2015-10-06",
        type: "spam-settlement",
        scope: "linkedin"
      }
    ],

    "facebook.com": [
      {
        id: "fb_01",
        text: "The FTC imposed a record $5B penalty on Facebook for violating a 2012 privacy order and misleading users about their control over personal information.",
        source: "FTC",
        date: "2019-07-24",
        type: "privacy-fine",
        scope: "facebook"
      },
      {
        id: "fb_02",
        text: "Facebook said the Cambridge Analytica scandal affected up to 87 million users.",
        source: "Reuters",
        date: "2018-04-05",
        type: "privacy-scandal",
        scope: "facebook"
      },
      {
        id: "fb_03",
        text: "Facebook agreed to pay $650M to settle Illinois biometric privacy claims over facial recognition and photo-tagging.",
        source: "Reuters",
        date: "2022-01-26",
        type: "biometric-settlement",
        scope: "facebook"
      },
      {
        id: "fb_04",
        text: "EU regulators fined Meta \u20ac91M after some Facebook user passwords were stored in plaintext on internal systems.",
        source: "Reuters",
        date: "2024-09-27",
        type: "security-fine",
        scope: "facebook"
      },
      {
        id: "fb_05",
        text: "EU regulators fined Meta \u20ac251M over a 2018 Facebook security breach that exposed data from 29 million accounts.",
        source: "Reuters",
        date: "2024-12-17",
        type: "breach-fine",
        scope: "facebook"
      },
      {
        id: "fb_06",
        text: "A federal judge let claims proceed that Meta Pixel on hospital and healthcare sites captured and transmitted sensitive patient information to Meta/Facebook.",
        source: "Reuters",
        date: "2023-09-08",
        type: "medical-privacy-litigation",
        scope: "facebook"
      },
      {
        id: "fb_07",
        text: "The Markup reported hospital websites using Meta Pixel were sending Facebook information about appointments, prescriptions, and medical conditions.",
        source: "The Markup",
        date: "2022-06-16",
        type: "medical-privacy-reporting",
        scope: "facebook"
      },
      {
        id: "fb_08",
        text: "Facebook allowed advertisers to target anti-Semitic audience categories such as 'Jew haters' before removing them after public scrutiny.",
        source: "ProPublica",
        date: "2017-09-14",
        type: "ad-targeting-abuse",
        scope: "facebook"
      }
    ],

    "instagram.com": [
      {
        id: "ig_01",
        text: "A New Mexico jury found Meta violated state consumer-protection law over safety claims about Facebook, Instagram and WhatsApp, and awarded $375M in civil penalties.",
        source: "Reuters",
        date: "2026-03-24",
        type: "consumer-protection-verdict",
        scope: "instagram"
      },
      {
        id: "ig_02",
        text: "A Los Angeles jury found Meta negligent in designing Instagram and found it failed to adequately warn users about the platform's dangers in a youth social-media addiction case.",
        source: "Reuters",
        date: "2026-03-25",
        type: "negligence-verdict",
        scope: "instagram"
      },
      {
        id: "ig_03",
        text: "Leaked internal research showed Meta knew Instagram harmed the mental health of some teens.",
        source: "Reuters",
        date: "2021-09-30",
        type: "internal-research",
        scope: "instagram"
      },
      {
        id: "ig_04",
        text: "Internal Meta research reviewed by Reuters found teens who often felt bad about their bodies after using Instagram saw far more eating-disorder-adjacent content than other teens.",
        source: "Reuters",
        date: "2025-10-20",
        type: "internal-research",
        scope: "instagram"
      },
      {
        id: "ig_05",
        text: "The EU fined Meta \u20ac200M over its 'pay or consent' model covering Facebook and Instagram under the Digital Markets Act.",
        source: "Reuters",
        date: "2025-04-23",
        type: "competition-fine",
        scope: "instagram"
      }
    ],

    "_scope": {
      "meta": [
        {
          id: "meta_01",
          text: "The FTC appealed the dismissal of its antitrust case seeking to unwind Meta's Instagram and WhatsApp acquisitions.",
          source: "Reuters",
          date: "2026-01-20",
          type: "antitrust-case",
          scope: "meta"
        },
        {
          id: "meta_02",
          text: "EU regulators hit Meta with a record \u20ac1.2B fine over transfers of European user data to the United States.",
          source: "Reuters",
          date: "2023-05-22",
          type: "privacy-fine",
          scope: "meta"
        },
        {
          id: "meta_03",
          text: "Australia's privacy watchdog settled with Meta for A$50M over the old Facebook quiz-app data scandal.",
          source: "Reuters",
          date: "2024-12-17",
          type: "privacy-settlement",
          scope: "meta"
        },
        {
          id: "meta_04",
          text: "Meta let rival AI chatbots onto WhatsApp in Italy after an antitrust order, while the authority kept investigating.",
          source: "Reuters",
          date: "2026-03-05",
          type: "antitrust-investigation",
          scope: "meta"
        }
      ],

      "microsoft": [
        {
          id: "ms_01",
          text: "The U.S. government's landmark antitrust case accused Microsoft of illegally maintaining its operating-system monopoly and tying Internet Explorer to Windows.",
          source: "U.S. DOJ",
          date: "1998-05-18",
          type: "antitrust-history",
          scope: "microsoft"
        },
        {
          id: "ms_02",
          text: "EU regulators formally charged Microsoft with abusive bundling of Teams with Office.",
          source: "Reuters",
          date: "2024-06-25",
          type: "antitrust-charge",
          scope: "microsoft"
        },
        {
          id: "ms_03",
          text: "Microsoft avoided an EU antitrust fine by offering lower prices for Office without Teams and interoperability concessions.",
          source: "Reuters",
          date: "2025-09-12",
          type: "antitrust-remedy",
          scope: "microsoft"
        },
        {
          id: "ms_04",
          text: "The UK competition authority said the dominance of Amazon and Microsoft in cloud computing was harming competition.",
          source: "Reuters",
          date: "2025-07-31",
          type: "competition-concern",
          scope: "microsoft"
        },
        {
          id: "ms_05",
          text: "Reuters reported the FTC was ramping up scrutiny of Microsoft's AI, cloud, and bundling practices.",
          source: "Reuters",
          date: "2026-02-13",
          type: "regulatory-scrutiny",
          scope: "microsoft"
        }
      ]
    },

    "_people": {
      "bill_gates": [
        {
          id: "gates_01",
          text: "Reuters reported Bill Gates met Jeffrey Epstein multiple times after Epstein's prison term to discuss philanthropy; Gates later called the relationship a huge mistake.",
          source: "Reuters",
          date: "2026-02-25",
          type: "association",
          scope: "person"
        },
        {
          id: "gates_02",
          text: "The Gates Foundation said it never employed Epstein and made no financial payments to him.",
          source: "Reuters",
          date: "2026-02-11",
          type: "clarification",
          scope: "person"
        }
      ]
    }
  };

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
          radial-gradient(circle at 50% 14%, rgba(124, 92, 255, 0.12), transparent 24%),
          radial-gradient(circle at 12% 88%, rgba(68, 127, 255, 0.12), transparent 28%),
          radial-gradient(circle at 88% 18%, rgba(181, 120, 255, 0.08), transparent 24%),
          linear-gradient(180deg, rgba(7, 8, 16, 0.72), rgba(4, 5, 12, 0.92));
        backdrop-filter: blur(22px) saturate(0.78);
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
        width: min(920px, calc(100vw - 28px));
        border: 1px solid rgba(158, 168, 255, 0.14);
        border-radius: 34px;
        padding: clamp(28px, 4vw, 44px);
        background:
          linear-gradient(180deg, rgba(14, 15, 28, 0.985), rgba(8, 9, 20, 0.985));
        box-shadow:
          0 34px 120px rgba(0, 0, 0, 0.46),
          inset 0 1px 0 rgba(255, 255, 255, 0.04);
        text-align: left;
        color: #f3f2ff;
        font-family: "Aptos", "Segoe UI Variable", "Segoe UI", sans-serif;
        overflow: hidden;
        animation: doomscroll-punisher-arrive 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      #${overlayId} .doomscroll-punisher-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 8px;
        background: linear-gradient(180deg, #111322 0%, #5747d6 46%, #6ab0ff 100%);
      }

      #${overlayId} .doomscroll-punisher-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 28px;
      }

      #${overlayId} .doomscroll-punisher-head-copy {
        min-width: 0;
      }

      #${overlayId} img {
        width: min(460px, 100%);
        height: auto;
        max-height: 340px;
        display: block;
        margin: 0 auto;
        object-fit: contain;
        border-radius: 24px;
        background: transparent;
        box-shadow: none;
      }

      #${overlayId} .doomscroll-punisher-kicker {
        display: block;
        color: #8eb5ff;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      #${overlayId} .doomscroll-punisher-countdown {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 122px;
        padding: 11px 18px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: #edf2ff;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow:
          inset 0 0 0 1px rgba(160, 172, 255, 0.12),
          0 8px 20px rgba(2, 5, 18, 0.28);
      }

      #${overlayId} .doomscroll-punisher-body {
        display: flex;
        flex-direction: column;
        gap: 34px;
        margin-top: 30px;
      }

      #${overlayId} .doomscroll-punisher-copy {
        min-width: 0;
      }

      #${overlayId} .doomscroll-punisher-intro {
        margin: 0 0 18px;
        color: #8eb5ff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      #${overlayId} .doomscroll-punisher-text {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", serif;
        font-size: clamp(28px, 3.1vw, 40px);
        line-height: 1.12;
        letter-spacing: -0.03em;
        color: #f6f5ff;
        max-width: 16ch;
      }

      #${overlayId} .doomscroll-punisher-source {
        display: block;
        margin-top: 22px;
        color: rgba(212, 218, 255, 0.66);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      #${overlayId} .doomscroll-punisher-media {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2px 0 4px;
      }

      #${overlayId} .doomscroll-punisher-media-panel {
        width: min(100%, 620px);
        padding: clamp(26px, 3vw, 38px);
        border-radius: 34px;
        background:
          radial-gradient(circle at 50% 20%, rgba(122, 94, 255, 0.14), transparent 42%),
          linear-gradient(180deg, rgba(18, 19, 34, 0.98), rgba(10, 11, 22, 0.98));
        border: 1px solid rgba(165, 177, 255, 0.08);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.03),
          0 22px 58px rgba(0, 0, 0, 0.32);
      }

      #${overlayId} .doomscroll-punisher-footer {
        margin-top: 30px;
      }

      #${overlayId} .doomscroll-punisher-rule {
        height: 1px;
        margin-bottom: 16px;
        background: linear-gradient(90deg, rgba(168, 178, 255, 0.16), rgba(168, 178, 255, 0));
      }

      #${overlayId} .doomscroll-punisher-progress-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
      }

      #${overlayId} .doomscroll-punisher-progress-label,
      #${overlayId} .doomscroll-punisher-progress-note {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      #${overlayId} .doomscroll-punisher-progress-label {
        color: #8eb5ff;
      }

      #${overlayId} .doomscroll-punisher-progress-note {
        color: rgba(210, 216, 255, 0.58);
        text-align: right;
      }

      #${overlayId} .doomscroll-punisher-progress {
        width: 100%;
        height: 7px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
      }

      #${overlayId} .doomscroll-punisher-progress-bar {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #78a6ff 0%, #786dff 52%, #ba72ff 100%);
        box-shadow: 0 0 24px rgba(112, 109, 255, 0.28);
        transition: width 60s linear;
      }

      @media (max-width: 680px) {
        #${overlayId} .doomscroll-punisher-card {
          width: min(620px, calc(100vw - 20px));
          border-radius: 28px;
        }

        #${overlayId} img {
          width: min(300px, 100%);
          max-height: 260px;
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
    try {
      const audio = ensureAudio();
      audio.pause();

      const startPlayback = () => {
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
      };

      if (audio.readyState >= 1) {
        startPlayback();
      } else {
        audio.addEventListener("loadedmetadata", startPlayback, { once: true });
        audio.load();
      }
    } catch (_error) {
      playFallbackTone();
    }
  }

  function getShameEntry() {
    const hostname = window.location.hostname.replace(/^www\./i, "");
    const matchedKey = Object.keys(SHAME_DATA).find(
      (key) => hostname === key || hostname.endsWith(`.${key}`)
    );
    const entries = matchedKey ? [...SHAME_DATA[matchedKey]] : [];

    if (matchedKey === "instagram.com" || matchedKey === "facebook.com") {
      entries.push(...SHAME_DATA._scope.meta);
    }

    if (matchedKey === "linkedin.com") {
      entries.push(...SHAME_DATA._scope.microsoft);
      entries.push(...SHAME_DATA._people.bill_gates);
    }

    if (!entries || entries.length === 0) {
      return {
        text: "You are being watched by an algorithm right now.",
        source: "",
      };
    }

    return entries[Math.floor(Math.random() * entries.length)];
  }

  function formatShameDate(value) {
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

  function showFeedback() {
    const now = performance.now();
    if (now - state.lastFeedbackAt < FEEDBACK_COOLDOWN_MS) {
      return;
    }

    state.lastFeedbackAt = now;

    const existingOverlay = ensureOverlay();
    window.clearTimeout(state.overlayTimer);
    window.clearInterval(state.overlayCountdownTimer);

    if (existingOverlay) {
      const existingProgressBar = existingOverlay.querySelector(
        ".doomscroll-punisher-progress-bar"
      );
      if (existingProgressBar) {
        existingProgressBar.style.transition = "none";
        existingProgressBar.style.width = "100%";
      }

      existingOverlay.remove();
    }

    const shameEntry = getShameEntry();
    const sourceText = [shameEntry.source, formatShameDate(shameEntry.date)]
      .filter(Boolean)
      .join(" / ");

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
            <p class="doomscroll-punisher-intro">Before you keep going</p>
            <p class="doomscroll-punisher-text">${shameEntry.text}</p>
            <span class="doomscroll-punisher-source">${sourceText}</span>
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
            <span class="doomscroll-punisher-progress-label">Reflection window</span>
            <span class="doomscroll-punisher-progress-note">Read it before you try again</span>
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

    const countdown = overlay.querySelector(".doomscroll-punisher-countdown");
    const progressBar = overlay.querySelector(".doomscroll-punisher-progress-bar");
    const startedAt = Date.now();

    function updateCountdown() {
      const elapsedMs = Date.now() - startedAt;
      const remainingSeconds = Math.max(
        0,
        Math.ceil((OVERLAY_DURATION_MS - elapsedMs) / 1000)
      );
      countdown.textContent = `${remainingSeconds}s left`;
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
    element.style.setProperty("touch-action", "none", "important");

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
  document.addEventListener("scroll", handleBlockedScroll, true);

  lockKnownScrollers();
  startObserver();
  scheduleResnapshot();
})();
