/* Un rincón para Liam — interacciones */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Tema claro/oscuro con preferencia guardada.
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const themeLabel = $(".theme-label");
  function applyTheme(theme, save = true) {
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
    if (themeLabel) themeLabel.textContent = dark ? "Modo día" : "Modo noche";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", dark ? "Activar modo día" : "Activar modo noche");
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.title = dark ? "Cambiar a modo día" : "Cambiar a modo noche";
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#15111d" : "#fff0f5";
    if (save) {
      try { localStorage.setItem("liam-theme", dark ? "dark" : "light"); } catch (_) {}
    }
  }
  let initialTheme = document.documentElement.dataset.theme;
  try { initialTheme = localStorage.getItem("liam-theme") || initialTheme; } catch (_) {}
  applyTheme(initialTheme === "dark" ? "dark" : "light", false);
  themeToggle?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });


    // Pantalla de bienvenida y música de fondo.
  const welcomeScreen = $("#welcomeScreen");
  const enterButton = $("#enterButton");
  const backgroundMusic = $("#backgroundMusic");
  const backgroundMusicToggle = $("#backgroundMusicToggle");
  const backgroundMusicIcon = $("#backgroundMusicIcon");
  const backgroundMusicLabel = $("#backgroundMusicLabel");

  let backgroundMuted = false;
  let backgroundFadeTimer = null;
  const FADE_DURATION = 8;

  function updateBackgroundButton() {
    if (!backgroundMusicToggle) return;

    backgroundMusicToggle.setAttribute(
      "aria-pressed",
      String(backgroundMuted)
    );

    backgroundMusicToggle.setAttribute(
      "aria-label",
      backgroundMuted
        ? "Activar música de fondo"
        : "Silenciar música de fondo"
    );

    backgroundMusicToggle.title = backgroundMuted
      ? "Activar música de fondo"
      : "Silenciar música de fondo";

    if (backgroundMusicIcon) {
      backgroundMusicIcon.textContent = backgroundMuted ? "🔇" : "♫";
    }

    if (backgroundMusicLabel) {
      backgroundMusicLabel.textContent = backgroundMuted
        ? "Música silenciada"
        : "Música activada";
    }

    if (backgroundMusic) {
      backgroundMusic.muted = backgroundMuted;
    }
  }

  function stopBackgroundFade() {
    if (backgroundFadeTimer !== null) {
      window.clearInterval(backgroundFadeTimer);
      backgroundFadeTimer = null;
    }
  }

  function startBackgroundFade() {
    if (!backgroundMusic || backgroundMusic.paused) return;

    stopBackgroundFade();

    backgroundFadeTimer = window.setInterval(() => {
      if (!backgroundMusic || backgroundMusic.paused) {
        stopBackgroundFade();
        return;
      }

      const remaining =
        backgroundMusic.duration - backgroundMusic.currentTime;

      if (!Number.isFinite(remaining)) return;

      if (remaining <= FADE_DURATION) {
        backgroundMusic.volume = Math.max(
          0,
          Math.min(1, remaining / FADE_DURATION)
        );
      } else {
        backgroundMusic.volume = 1;
      }
    }, 200);
  }

  function playBackgroundMusic() {
    if (!backgroundMusic) return;

    // Si la canción ya terminó, vuelve a comenzar.
    if (
      Number.isFinite(backgroundMusic.duration) &&
      backgroundMusic.currentTime >= backgroundMusic.duration
    ) {
      backgroundMusic.currentTime = 0;
    }

    backgroundMusic.volume = 1;
    backgroundMusic.muted = backgroundMuted;

    const playback = backgroundMusic.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {
        const status = $("#audioStatus");
        if (status) {
          status.textContent =
            "Si la música no comienza, compruebe el archivo musica1.mp3 y pulse el botón de entrada otra vez.";
        }
      });
    }
  }

  enterButton?.addEventListener("click", () => {
    welcomeScreen?.classList.add("leaving");

    window.setTimeout(() => {
      if (welcomeScreen) welcomeScreen.hidden = true;
    }, 750);

    // La música comienza tras la interacción de entrada.
    playBackgroundMusic();
  });

  backgroundMusicToggle?.addEventListener("click", () => {
    backgroundMuted = !backgroundMuted;
    updateBackgroundButton();
  });

  backgroundMusic?.addEventListener("play", startBackgroundFade);

  backgroundMusic?.addEventListener("pause", stopBackgroundFade);

  backgroundMusic?.addEventListener("ended", () => {
    stopBackgroundFade();
    backgroundMusic.volume = 1;
  });

  backgroundMusic?.addEventListener("error", () => {
    const status = $("#audioStatus");
    if (status) {
      status.textContent =
        "No se encontró audios/musica1.mp3. Compruebe el nombre y la extensión del archivo.";
    }
  });

  updateBackgroundButton();

  // Menú móvil.
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");
  function closeMenu() {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menú");
  }
  menuToggle?.addEventListener("click", () => {
    const open = !nav?.classList.contains("open");
    nav?.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  $$("#nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    if (nav?.classList.contains("open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });

  // Barra de lectura.
  function updateReadingProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    const bar = $("#readingProgress");
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  updateReadingProgress();

  // Aparición de secciones y enlace activo.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else revealItems.forEach(item => item.classList.add("visible"));

  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$("#nav a").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Álbum horizontal, controles, puntos y swipe.
  const track = $("#albumTrack");
  const cards = $$(".album-card", track || document);
  const dotsContainer = $("#albumDots");
  const prevButton = $("#albumPrev");
  const nextButton = $("#albumNext");
  let albumIndex = 0;
  function visibleCards() {
    if (!track || !cards.length) return 1;
    if (window.matchMedia("(max-width: 560px)").matches) return 1;
    if (window.matchMedia("(max-width: 900px)").matches) return 2;
    return 3;
  }
  function maxAlbumIndex() { return Math.max(0, cards.length - visibleCards()); }
  function renderAlbum() {
    if (!track || !cards.length) return;
    albumIndex = Math.min(albumIndex, maxAlbumIndex());
    const card = cards[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-albumIndex * step}px)`;
    $$(".album-dot", dotsContainer || document).forEach((dot, index) => dot.classList.toggle("active", index === albumIndex));
    if (prevButton) prevButton.disabled = albumIndex === 0;
    if (nextButton) nextButton.disabled = albumIndex >= maxAlbumIndex();
  }
  if (dotsContainer && cards.length) {
    dotsContainer.innerHTML = "";
    cards.forEach((card, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "album-dot";
      dot.setAttribute("aria-label", `Mostrar foto ${index + 1}`);
      dot.addEventListener("click", () => { albumIndex = Math.min(index, maxAlbumIndex()); renderAlbum(); });
      dotsContainer.appendChild(dot);
    });
  }
  prevButton?.addEventListener("click", () => { albumIndex = Math.max(0, albumIndex - 1); renderAlbum(); });
  nextButton?.addEventListener("click", () => { albumIndex = Math.min(maxAlbumIndex(), albumIndex + 1); renderAlbum(); });
  window.addEventListener("resize", renderAlbum);
  let touchStartX = 0;
  track?.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  track?.addEventListener("touchend", event => {
    const delta = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 45) {
      albumIndex = delta < 0 ? Math.min(maxAlbumIndex(), albumIndex + 1) : Math.max(0, albumIndex - 1);
      renderAlbum();
    }
  }, { passive: true });
  renderAlbum();

  // Lightbox de fotografías.
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  let previousFocus = null;
  function openLightbox(card) {
    const img = $("img", card);
    if (!img || !lightbox || !lightboxImage || !lightboxCaption) return;
    previousFocus = document.activeElement;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = card.dataset.caption || img.alt;
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    $("#lightboxClose")?.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.src = "";
    document.body.classList.remove("no-scroll");
    previousFocus?.focus?.();
  }
  cards.forEach(card => card.addEventListener("click", () => openLightbox(card)));
  $("#lightboxClose")?.addEventListener("click", closeLightbox);
  $("#lightboxBackdrop")?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeLightbox(); });

  // Sobre animado.
  const envelopeButton = $("#envelopeButton");
  envelopeButton?.addEventListener("click", () => {
    const open = !envelopeButton.classList.contains("open");
    envelopeButton.classList.toggle("open", open);
    envelopeButton.setAttribute("aria-expanded", String(open));
    const hint = $("#envelopeHint");
    if (hint) hint.textContent = open ? "Toca el sobre otra vez para cerrarlo ♡" : "Toca el sobre para abrir la carta ♡";
  });

    // Reproductor del álbum y coordinación con la música de fondo.
  const audioPlayer = $("#audioPlayer");
  const trackSelect = $("#trackSelect");
  const audioStatus = $("#audioStatus");

  function selectTrack() {
    if (!audioPlayer || !trackSelect) return;

    audioPlayer.src = trackSelect.value;
    audioPlayer.load();

    if (audioStatus) {
      audioStatus.textContent =
        `Canción seleccionada: ${trackSelect.options[trackSelect.selectedIndex]?.text || trackSelect.value}`;
    }
  }

  function pauseBackgroundForAlbum() {
    if (backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  }

  function resumeBackgroundAfterAlbum() {
    // No iniciar la música si la portada todavía está abierta.
    const entered =
      !welcomeScreen ||
      welcomeScreen.hidden ||
      welcomeScreen.classList.contains("leaving");

    if (!entered || !backgroundMusic) return;

    playBackgroundMusic();
  }

  trackSelect?.addEventListener("change", selectTrack);

  if (audioPlayer && trackSelect) {
    audioPlayer.src = trackSelect.value;
    audioPlayer.load();

    audioPlayer.addEventListener("play", () => {
      // La canción del álbum tiene prioridad.
      pauseBackgroundForAlbum();
      document.body.classList.add("is-playing");
    });

    audioPlayer.addEventListener("playing", () => {
      pauseBackgroundForAlbum();
      document.body.classList.add("is-playing");
    });

    audioPlayer.addEventListener("pause", () => {
      document.body.classList.remove("is-playing");

      // Al pausar el álbum, vuelve la música de fondo.
      resumeBackgroundAfterAlbum();
    });

    audioPlayer.addEventListener("ended", () => {
      document.body.classList.remove("is-playing");
      resumeBackgroundAfterAlbum();
    });

    audioPlayer.addEventListener("error", () => {
      document.body.classList.remove("is-playing");

      if (audioStatus) {
        audioStatus.textContent =
          "No se encontró la canción seleccionada. Compruebe que el archivo exista en la carpeta audios.";
      }
    });

    audioPlayer.addEventListener("canplay", () => {
      if (audioStatus) {
        audioStatus.textContent =
          "Todo listo. Pulse reproducir para escuchar su canción. ♡";
      }
    });
  }
  // Contador de días como fan (fecha local para evitar desfases de zona horaria).
  const fanDate = $("#fanDate");
  const counterResult = $("#counterResult");
  const today = new Date();
  const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (fanDate) {
    fanDate.max = todayLocal;
    try {
      const savedDate = localStorage.getItem("liam-fan-date");
      if (savedDate && savedDate <= todayLocal) fanDate.value = savedDate;
    } catch (_) {}
  }
  function updateFanCounter() {
    if (!fanDate || !counterResult || !fanDate.value) {
      if (counterResult) counterResult.textContent = "Elige una fecha para contar tus recuerdos.";
      return;
    }
    const parts = fanDate.value.split("-").map(Number);
    const chosen = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (chosen > current) {
      counterResult.textContent = "Elige una fecha de hoy o anterior.";
      return;
    }
    const days = Math.floor((current - chosen) / 86400000);
    counterResult.textContent = `¡${days.toLocaleString("es")} días llenos de música y recuerdos! ♡`;
    try { localStorage.setItem("liam-fan-date", fanDate.value); } catch (_) {}
  }
  fanDate?.addEventListener("change", updateFanCounter);
  if (fanDate?.value) updateFanCounter();

  // Quiz One Direction.
  const quizQuestions = [
    { q: "¿En qué año se formó One Direction?", options: ["2010", "2012", "2008", "2015"], answer: "2010", fact: "One Direction se formó en 2010 durante The X Factor." },
    { q: "¿En qué ciudad nació Liam Payne?", options: ["Londres", "Wolverhampton", "Liverpool", "Manchester"], answer: "Wolverhampton", fact: "Liam nació en Wolverhampton, Inglaterra." },
    { q: "¿Cuál de estas canciones es de One Direction?", options: ["Night Changes", "Shape of You", "Sorry", "Stay"], answer: "Night Changes", fact: "Night Changes apareció en el álbum Four." },
    { q: "¿Cómo se llamó el álbum debut de One Direction?", options: ["Made in the A.M.", "Take Me Home", "Up All Night", "Four"], answer: "Up All Night", fact: "Up All Night fue el álbum debut del grupo." },
    { q: "¿Con quién colaboró Liam en Strip That Down?", options: ["Quavo", "Drake", "Ed Sheeran", "Zayn"], answer: "Quavo", fact: "Strip That Down, el sencillo solista de Liam, contó con Quavo." }
  ];
  const quizProgress = $("#quizProgress"), quizQuestion = $("#quizQuestion"), quizOptions = $("#quizOptions");
  const quizFeedback = $("#quizFeedback"), quizNext = $("#quizNext"), quizResult = $("#quizResult"), quizRestart = $("#quizRestart");
  const quizProgressBar = $("#quizProgressBar");
  let questionIndex = 0, score = 0, answered = false;
  function renderQuestion() {
    const item = quizQuestions[questionIndex];
    if (!item || !quizOptions || !quizProgress || !quizQuestion || !quizFeedback || !quizNext || !quizProgressBar || !quizResult || !quizRestart) return;
    answered = false;
    quizProgress.textContent = `Pregunta ${questionIndex + 1} de ${quizQuestions.length}`;
    quizQuestion.textContent = item.q;
    quizProgressBar.style.width = `${((questionIndex + 1) / quizQuestions.length) * 100}%`;
    quizOptions.innerHTML = "";
    item.options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "quiz-option"; button.textContent = option;
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const correct = option === item.answer;
        if (correct) score++;
        $$(".quiz-option", quizOptions).forEach(btn => {
          btn.disabled = true;
          if (btn.textContent === item.answer) btn.classList.add("correct");
          else if (btn === button) btn.classList.add("incorrect");
        });
        quizFeedback.textContent = `${correct ? "¡Correcto! ♡" : "Casi, la respuesta era " + item.answer + "."} ${item.fact}`;
        quizNext.disabled = false;
      });
      quizOptions.appendChild(button);
    });
    quizFeedback.textContent = "";
    quizNext.disabled = true;
    quizNext.hidden = false;
    quizResult.hidden = true;
    quizRestart.hidden = true;
  }
  quizNext?.addEventListener("click", () => {
    if (!answered || !quizNext || !quizProgress || !quizQuestion || !quizOptions || !quizFeedback || !quizResult || !quizRestart) return;
    questionIndex++;
    if (questionIndex < quizQuestions.length) renderQuestion();
    else {
      quizProgress.textContent = "Quiz completado";
      quizQuestion.textContent = "¡Gracias por jugar!";
      quizOptions.innerHTML = "";
      quizFeedback.textContent = "";
      quizNext.hidden = true;
      quizResult.hidden = false;
      const message = score === 5 ? "¡Directioner legendaria!" : score >= 3 ? "¡Una fan de corazón!" : "¡Siempre se puede aprender algo nuevo!";
      quizResult.replaceChildren();
      const scoreStrong = document.createElement("strong");
      scoreStrong.textContent = `${score}/${quizQuestions.length}`;
      const resultParagraph = document.createElement("p");
      resultParagraph.textContent = `${message} ♡`;
      quizResult.append(scoreStrong, resultParagraph);
      quizRestart.hidden = false;
    }
  });
  quizRestart?.addEventListener("click", () => { questionIndex = 0; score = 0; renderQuestion(); });
  if (quizQuestion && quizOptions) renderQuestion();

  // Juegos extra dedicados principalmente a Liam.
  const songRounds = [
    { clue: "Pista: el primer sencillo solista de Liam, con ritmo y una colaboración de Quavo.", answer: "Strip That Down", options: ["Strip That Down", "Bedroom Floor", "Night Changes", "Story of My Life"], fact: "¡Sí! Strip That Down abrió una etapa solista para Liam." },
    { clue: "Pista: canción solista de Liam cuyo título habla de un lugar privado para dormir.", answer: "Bedroom Floor", options: ["For You", "Bedroom Floor", "Live While We're Young", "Drag Me Down"], fact: "¡Correcto! Bedroom Floor es uno de sus sencillos solistas." },
    { clue: "Pista: tema de One Direction que habla de cómo cambian las cosas por la noche.", answer: "Night Changes", options: ["Night Changes", "Familiar", "Polaroid", "Kiss You"], fact: "¡Eso es! Night Changes pertenece al álbum Four." },
    { clue: "Pista: colaboración de Liam con Rita Ora para la banda sonora de Fifty Shades Freed.", answer: "For You", options: ["For You", "Live Forever", "Little Things", "Midnight Memories"], fact: "¡Exacto! For You une las voces de Liam y Rita Ora." },
    { clue: "Pista: sencillo solista de Liam con un título que invita a vivir para siempre.", answer: "Live Forever", options: ["Live Forever", "Best Song Ever", "Steal My Girl", "Familiar"], fact: "¡Bien! Live Forever es una canción de la etapa solista de Liam." }
  ];
  let songRound = 0;
  const songClue = $("#songClue"), songOptions = $("#songOptions"), songFeedback = $("#songFeedback"), songNext = $("#songNext");
  function renderSongRound() {
    const item = songRounds[songRound]; if (!songOptions || !songClue || !songFeedback) return;
    songClue.textContent = item.clue; songFeedback.textContent = ""; songOptions.innerHTML = "";
    [...item.options].sort(() => Math.random() - .5).forEach(option => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = option;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        [...songOptions.children].forEach(x => { x.disabled = true; if (x.textContent === item.answer) x.classList.add("correct"); });
        if (option !== item.answer) b.classList.add("incorrect");
        songFeedback.textContent = option === item.answer ? item.fact : `Casi ♡ La respuesta era “${item.answer}”. ${item.fact}`;
      }); songOptions.appendChild(b);
    });
  }
  songNext?.addEventListener("click", () => { songRound = (songRound + 1) % songRounds.length; renderSongRound(); });
  renderSongRound();

  // Memoria: parejas de iconos inspirados en Liam y 1D.
  const memoryGrid = $("#memoryGrid"), memoryFeedback = $("#memoryFeedback");
  const memorySymbols = ["🎤", "💗", "🎧", "⭐", "🎶", "🌙"];
  let memoryFirst = null, memoryLock = false, memoryMoves = 0, memoryPairs = 0, memoryTimer = null;
  function setupMemory() {
    if (!memoryGrid) return; if (memoryTimer) window.clearTimeout(memoryTimer);
    memoryFirst = null; memoryLock = false; memoryMoves = 0; memoryPairs = 0;
    if (memoryFeedback) memoryFeedback.textContent = "Parejas encontradas: 0 de 6 · Movimientos: 0";
    memoryGrid.innerHTML = "";
    [...memorySymbols, ...memorySymbols].sort(() => Math.random() - .5).forEach((symbol, index) => {
      const tile = document.createElement("button"); tile.type = "button"; tile.className = "memory-tile"; tile.textContent = "♡"; tile.dataset.symbol = symbol; tile.setAttribute("aria-label", `Carta ${index + 1}, oculta`);
      tile.addEventListener("click", () => {
        if (memoryLock || tile.classList.contains("matched") || tile === memoryFirst || tile.classList.contains("revealed")) return;
        tile.textContent = symbol; tile.classList.add("revealed"); tile.setAttribute("aria-label", symbol);
        if (!memoryFirst) { memoryFirst = tile; return; }
        memoryMoves++;
        if (memoryFirst.dataset.symbol === symbol) {
          memoryFirst.classList.add("matched"); tile.classList.add("matched"); memoryFirst.disabled = true; tile.disabled = true; memoryFirst = null; memoryPairs++;
          if (memoryFeedback) memoryFeedback.textContent = memoryPairs === 6 ? `¡Lo lograste en ${memoryMoves} movimientos! Liam estaría orgulloso. 💗` : `Parejas encontradas: ${memoryPairs} de 6 · Movimientos: ${memoryMoves}`;
        } else {
          memoryLock = true; const previous = memoryFirst; memoryFirst = null;
          memoryTimer = window.setTimeout(() => { [previous, tile].forEach(t => { t.textContent = "♡"; t.classList.remove("revealed"); t.setAttribute("aria-label", "Carta oculta"); }); memoryLock = false; }, 750);
          if (memoryFeedback) memoryFeedback.textContent = `Sigue buscando ♡ · Movimientos: ${memoryMoves}`;
        }
      }); memoryGrid.appendChild(tile);
    });
  }
  $("#memoryRestart")?.addEventListener("click", setupMemory); setupMemory();

  // Test de personalidad musical, sin respuestas incorrectas.
  const vibeResults = { "1": "Tu era es el Liam de los comienzos: dulce, brillante y con una sonrisa que ilumina todo. ✨", "2": "Tu era es el Liam solista: segura, poderosa y lista para robarse el escenario. 🎤", "3": "Tu era es el Liam más íntimo: sensible, auténtica y llena de sentimientos bonitos. 🌙" };
  $$("#vibeChoices button").forEach(button => button.addEventListener("click", () => {
    $$("#vibeChoices button").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    const result = $("#vibeFeedback"); if (result) result.textContent = vibeResults[button.dataset.vibe] || "Tu vibe es única, como tú. ♡";
  }));

  // Retos aleatorios para fans.
  const challenges = [
    "Pon una canción de Liam y dedica el estribillo a alguien que quieras. 💗",
    "Elige tu top 3 de canciones solistas de Liam y defiende tu número uno.",
    "Escucha una canción de One Direction y busca el momento en que más destaca la voz de Liam.",
    "Escribe tres palabras que describan lo que la música de Liam te hace sentir.",
    "Arma una mini playlist de cinco canciones: tres de Liam y dos de One Direction.",
    "Comparte tu foto favorita de Liam y ponle un título de película romántica. 🎬",
    "Canta el coro de tu canción favorita de 1D como si estuvieras en un concierto.",
    "Escribe una frase bonita para Liam como si fuera una nota de fan.",
    "Elige entre Strip That Down, For You y Bedroom Floor: ¿cuál va con tu mood de hoy y por qué?"
  ];
  const challengeText = $("#challengeText");
  $("#challengeButton")?.addEventListener("click", () => {
    if (!challengeText) return; let next = challenges[Math.floor(Math.random() * challenges.length)];
    if (challenges.length > 1 && next === challengeText.dataset.last) next = challenges[(challenges.indexOf(next) + 1) % challenges.length];
    challengeText.dataset.last = next; challengeText.textContent = next;
  });

  // Sorpresa con palabra secreta. Cambia SECRET_WORD para personalizarla.
  const SECRET_WORD = "greverly";
  const secretForm = $("#secretForm");
  const secretPassword = $("#secretPassword");
  const secretFeedback = $("#secretFeedback");
  const surpriseMessage = $("#surpriseMessage");
  secretForm?.addEventListener("submit", event => {
    event.preventDefault();
    const attempt = (secretPassword?.value || "").trim().toLocaleLowerCase("es");
    if (attempt === SECRET_WORD.toLocaleLowerCase("es")) {
      if (secretFeedback) secretFeedback.textContent = "¡Palabra correcta! 💗";
      if (surpriseMessage) surpriseMessage.hidden = false;
      if (secretPassword) secretPassword.value = "";
      const submitButton = secretForm.querySelector('button[type="submit"], button');
      if (submitButton) submitButton.disabled = true;
    } else {
      if (secretFeedback) secretFeedback.textContent = "Esa no es la palabra… intenta otra vez ♡ si no sabe cual es la clave pideme una pista";
      if (surpriseMessage) surpriseMessage.hidden = true;
      secretPassword?.focus();
    }
  });

  // Corazones y destellos al tocar la pantalla. Respeta controles y movimiento reducido.
  const effectLayer = $("#effectLayer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastEffect = 0;
  document.addEventListener("pointerdown", event => {
    if (reduceMotion || event.pointerType === "mouse" || !effectLayer) return;
    if (event.target.closest("button, a, input, select, textarea, audio, label, .lightbox")) return;
    const now = Date.now();
    if (now - lastEffect < 120) return;
    lastEffect = now;
    const particle = document.createElement("span");
    particle.className = "tap-effect";
    particle.textContent = Math.random() > .28 ? "♡" : "✦";
    particle.style.left = `${event.clientX}px`;
    particle.style.top = `${event.clientY}px`;
    effectLayer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }, { passive: true });
})();
