/* ============================================================
   Vision Board Generator — script.js
   Vanilla JS ES6+ | Sin dependencias externas
   ============================================================ */

'use strict';

// ── Constantes ───────────────────────────────────────────────

const STORAGE_KEY = 'visionboard_2026_v2';

// Los 10 intereses disponibles
const ALL_INTERESTS = [
  { id: 'dinero',        icon: '💰', name: 'Dinero',        color: '#F5C842' },
  { id: 'profesional',   icon: '💼', name: 'Profesional',   color: '#4A90D9' },
  { id: 'deporte',       icon: '🏆', name: 'Deporte',       color: '#E87040' },
  { id: 'viaje',         icon: '✈️', name: 'Viaje',         color: '#40C4E8' },
  { id: 'salud',         icon: '💪', name: 'Salud',         color: '#4ABA72' },
  { id: 'amor',          icon: '❤️', name: 'Amor',          color: '#E84A8A' },
  { id: 'personal',      icon: '🌟', name: 'Personal',      color: '#9B59B6' },
  { id: 'espiritualidad',icon: '🧘', name: 'Espiritualidad',color: '#8E44AD' },
  { id: 'tecnologia',    icon: '💻', name: 'Tecnología',    color: '#2980B9' },
  { id: 'familia',       icon: '🏡', name: 'Familia',       color: '#E67E22' },
];

// Preguntas dinámicas por interés
const QUESTIONS_MAP = {
  dinero: {
    prompt: '¿Cuánto quieres ganar o ahorrar este año?',
    hint:   'Ej: 50k, Fondo de emergencia, Primer departamento',
    placeholder: 'Mi meta financiera...',
  },
  profesional: {
    prompt: '¿Qué logro profesional quieres alcanzar?',
    hint:   'Ej: Ascenso, Emprender, Certificación, Nuevo rol',
    placeholder: 'Mi meta profesional...',
  },
  deporte: {
    prompt: '¿Qué reto deportivo quieres completar?',
    hint:   'Ej: Maratón 5K, Crossfit, Nadar 1km, Yoga diario',
    placeholder: 'Mi reto deportivo...',
  },
  viaje: {
    prompt: '¿A qué lugar del mundo quieres ir este año?',
    hint:   'Ej: Japón, Patagonia, Nueva York, Playa del Carmen',
    placeholder: 'Mi destino soñado...',
  },
  salud: {
    prompt: '¿Qué hábito de salud quieres mantener cada día?',
    hint:   'Ej: Dormir 8h, Meditar, Comer sin azúcar, Caminar',
    placeholder: 'Mi hábito de salud...',
  },
  amor: {
    prompt: '¿Cómo quieres que sea tu vida amorosa este año?',
    hint:   'Ej: Conocer a alguien, Reconectar, Amor propio, Boda',
    placeholder: 'Mi intención amorosa...',
  },
  personal: {
    prompt: '¿Qué versión de ti quieres ser este año?',
    hint:   'Ej: Más seguro/a, Creativo/a, Disciplinado/a, Libre',
    placeholder: 'Mi versión ideal...',
  },
  espiritualidad: {
    prompt: '¿Qué práctica espiritual quieres cultivar?',
    hint:   'Ej: Meditación, Gratitud, Tarot, Oración, Journaling',
    placeholder: 'Mi práctica espiritual...',
  },
  tecnologia: {
    prompt: '¿Qué habilidad tecnológica quieres dominar?',
    hint:   'Ej: IA, Python, Diseño UX, No-code, Ciberseguridad',
    placeholder: 'Mi meta tech...',
  },
  familia: {
    prompt: '¿Qué momento especial quieres vivir con tu familia?',
    hint:   'Ej: Viaje juntos, Tradición nueva, Más cenas, Reunión',
    placeholder: 'Mi meta familiar...',
  },
};

// Paletas para el canvas según género
const CANVAS_PALETTES = {
  mujer: {
    bg1: '#FFF0F8', bg2: '#F5EEFF', bg3: '#EEF5FF',
    accent: '#B07FE8', accent2: '#E879A4',
    cardBg: 'rgba(255,255,255,0.90)',
    cardBorder: 'rgba(176,127,232,0.25)',
    textDark: '#1E1628', textLight: '#9E8EAC',
    decorA: '#E8C0F5', decorB: '#F5C0E0',
  },
  hombre: {
    bg1: '#EBF5FB', bg2: '#E8F5EE', bg3: '#F0F4F8',
    accent: '#1B4F72', accent2: '#1E8449',
    cardBg: 'rgba(255,255,255,0.92)',
    cardBorder: 'rgba(27,79,114,0.20)',
    textDark: '#0D1B2A', textLight: '#5D7A94',
    decorA: '#AED6F1', decorB: '#A9DFBF',
  },
};


// ── Estado de la aplicación ──────────────────────────────────

const state = {
  gender:    null,       // 'mujer' | 'hombre'
  interests: [],         // array de 5 interest IDs
  answers:   {},         // { [interestId]: string }
  step:      0,          // paso actual en el wizard
};


// ── Helpers de DOM ───────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const q = (sel) => document.querySelector(sel);


// ── Módulo: Storage ──────────────────────────────────────────

const Storage = {
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gender:    state.gender,
        interests: state.interests,
        answers:   state.answers,
      }));
    } catch (_) {}
  },
  load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (_) { return null; }
  },
  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  },
};


// ── Módulo: Tema ─────────────────────────────────────────────

function applyTheme(gender) {
  if (gender === 'hombre') {
    document.body.setAttribute('data-theme', 'masculine');
  } else {
    document.body.removeAttribute('data-theme');
  }
}


// ── Módulo: Pantallas ────────────────────────────────────────

function showScreen(targetId) {
  const current = q('.screen.active');
  const target  = $(targetId);

  if (current) {
    current.classList.add('exiting');
    setTimeout(() => current.classList.remove('active', 'exiting'), 400);
  }
  setTimeout(() => target.classList.add('active'), current ? 180 : 0);
}


// ── Módulo: Selector de Género ───────────────────────────────

function initGenderScreen() {
  document.querySelectorAll('.gender-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.gender-card').forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');

      state.gender = card.dataset.gender;
      applyTheme(state.gender);

      // Avanzar automáticamente después de un pequeño delay
      setTimeout(() => {
        showScreen('interests-screen');
        renderInterestsGrid();
      }, 280);
    });
  });
}


// ── Módulo: Selector de Intereses ────────────────────────────

function renderInterestsGrid() {
  const grid = $('interests-grid');
  grid.innerHTML = ALL_INTERESTS.map(interest => `
    <button
      class="interest-chip${state.interests.includes(interest.id) ? ' is-selected' : ''}"
      data-id="${interest.id}"
      aria-pressed="${state.interests.includes(interest.id)}"
      aria-label="${interest.name}"
    >
      <span class="interest-chip__icon">${interest.icon}</span>
      <span class="interest-chip__name">${interest.name}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.interest-chip').forEach(chip => {
    chip.addEventListener('click', () => toggleInterest(chip.dataset.id));
  });

  updateInterestsUI();
}

function toggleInterest(id) {
  const idx = state.interests.indexOf(id);
  if (idx > -1) {
    state.interests.splice(idx, 1);
  } else {
    if (state.interests.length >= 5) return;
    state.interests.push(id);
  }
  updateInterestsUI();

  // Re-render chips to reflect state
  document.querySelectorAll('.interest-chip').forEach(chip => {
    const isSelected = state.interests.includes(chip.dataset.id);
    const isDisabled = !isSelected && state.interests.length >= 5;
    chip.classList.toggle('is-selected', isSelected);
    chip.classList.toggle('is-disabled', isDisabled);
    chip.setAttribute('aria-pressed', String(isSelected));
    chip.disabled = isDisabled;
  });
}

function updateInterestsUI() {
  const count = state.interests.length;
  const countEl = $('interests-count');
  const counterEl = countEl.parentElement;
  const nextBtn = $('interests-next-btn');

  countEl.textContent = count;
  counterEl.classList.toggle('is-complete', count === 5);
  nextBtn.disabled = count !== 5;
}


// ── Módulo: Wizard ───────────────────────────────────────────

function getActiveQuestions() {
  // Devuelve las 5 preguntas en el orden de los intereses seleccionados
  return state.interests.map(id => {
    const interest = ALL_INTERESTS.find(i => i.id === id);
    const qData    = QUESTIONS_MAP[id];
    return { id, icon: interest.icon, name: interest.name, ...qData, maxLength: 35 };
  });
}

function initWizard() {
  state.step = 0;
  const questions = getActiveQuestions();
  renderDots(questions);
  renderQuestion(0, false, questions);
}

function renderDots(questions) {
  const container = $('progress-dots');
  container.innerHTML = questions.map((_, i) => {
    let cls = 'dot';
    if (i === state.step) cls += ' is-active';
    else if (i < state.step) cls += ' is-done';
    return `<div class="${cls}" aria-hidden="true"></div>`;
  }).join('');
}

function renderQuestion(index, animate = true, questions) {
  if (!questions) questions = getActiveQuestions();
  const qData   = questions[index];
  const card    = $('question-card');
  const input   = $('answer-input');
  const counter = $('char-counter');

  $('progress-fill').style.width = `${((index + 1) / questions.length) * 100}%`;

  const doRender = () => {
    $('question-icon').textContent   = qData.icon;
    $('question-label').textContent  = qData.name.toUpperCase();
    $('question-prompt').textContent = qData.prompt;
    $('question-hint').textContent   = 'Ej: ' + qData.hint.replace(/^Ej:\s*/, '');

    input.maxLength   = qData.maxLength;
    input.placeholder = qData.placeholder;
    input.value       = state.answers[qData.id] || '';

    const len = input.value.length;
    counter.textContent = `${len} / ${qData.maxLength}`;
    counter.classList.toggle('is-warn', len > qData.maxLength * 0.85);

    renderDots(questions);
    updateNav(questions);

    if (animate) {
      card.classList.remove('is-exiting');
      card.classList.add('is-entering');
      setTimeout(() => card.classList.remove('is-entering'), 400);
    }
    setTimeout(() => input.focus(), 50);
  };

  if (animate) {
    card.classList.add('is-exiting');
    setTimeout(() => { card.classList.remove('is-exiting'); doRender(); }, 280);
  } else {
    doRender();
  }
}

function updateNav(questions) {
  if (!questions) questions = getActiveQuestions();
  const isFirst = state.step === 0;
  const isLast  = state.step === questions.length - 1;
  const val     = (state.answers[questions[state.step].id] || '').trim();

  $('prev-btn').style.visibility = isFirst ? 'hidden' : 'visible';

  const nextBtn = $('next-btn');
  nextBtn.innerHTML = isLast
    ? `Generar mi Board <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5l1.9 5.8h6.1l-4.95 3.6 1.9 5.8L9 13.1l-4.95 3.6 1.9-5.8L1 6.3h6.1z" fill="currentColor"/></svg>`
    : `Siguiente <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  nextBtn.disabled = val.length === 0;
}

function handleNext() {
  const questions = getActiveQuestions();
  const qData     = questions[state.step];
  const val       = $('answer-input').value.trim();
  if (!val) return;

  state.answers[qData.id] = val;
  Storage.save();

  if (state.step < questions.length - 1) {
    state.step++;
    renderQuestion(state.step, true, questions);
  } else {
    showScreen('board-screen');
    setTimeout(generateBoard, 350);
  }
}

function handlePrev() {
  if (state.step > 0) {
    state.step--;
    renderQuestion(state.step, true, getActiveQuestions());
  }
}

function handleInputChange(e) {
  const questions = getActiveQuestions();
  const qData     = questions[state.step];
  const val       = e.target.value;
  const counter   = $('char-counter');

  state.answers[qData.id] = val;
  counter.textContent = `${val.length} / ${qData.maxLength}`;
  counter.classList.toggle('is-warn', val.length > qData.maxLength * 0.85);
  $('next-btn').disabled = val.trim().length === 0;
}


// ── Módulo: Canvas — helpers ─────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
  if (!text) return 0;
  const words = text.split(' ');
  let line = '', count = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      if (count === maxLines - 1 && i < words.length - 1) {
        ctx.fillText(line.trimEnd() + '…', x, y + count * lineH);
        return count + 1;
      }
      ctx.fillText(line.trimEnd(), x, y + count * lineH);
      line = words[i] + ' ';
      count++;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trimEnd(), x, y + count * lineH);
  return count + 1;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}


// ── Módulo: Canvas — dibujo del board ────────────────────────

function drawBoardBackground(ctx, W, H, pal) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    pal.bg1);
  grad.addColorStop(0.5,  '#FFFFFF');
  grad.addColorStop(1,    pal.bg3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Círculos decorativos de fondo
  const circles = [
    { x: 0.05, y: 0.15, r: 80 },
    { x: 0.95, y: 0.85, r: 100 },
    { x: 0.10, y: 0.90, r: 60 },
    { x: 0.92, y: 0.12, r: 70 },
    { x: 0.50, y: 0.05, r: 50 },
  ];
  circles.forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.arc(x * W, y * H, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(pal.accent)},0.06)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x * W, y * H, r + 20, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hexToRgb(pal.accent)},0.04)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function drawBoardHeader(ctx, W, pal) {
  const cx = W / 2;

  // Línea de acento arriba
  const lineGrad = ctx.createLinearGradient(W * 0.15, 0, W * 0.85, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, `rgba(${hexToRgb(pal.accent)},0.50)`);
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.15, 42);
  ctx.lineTo(W * 0.85, 42);
  ctx.stroke();

  // Píldora "MI VISION BOARD"
  const badgeText = 'MI VISION BOARD 2026';
  ctx.font = '700 13px -apple-system, system-ui, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 48;
  const badgeH = 32;
  const badgeY = 12;

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cx - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = `rgba(${hexToRgb(pal.accent)},0.10)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${hexToRgb(pal.accent)},0.25)`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.font = '700 13px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = pal.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, cx, badgeY + badgeH / 2);
}

// Dibuja una tarjeta de interés en el canvas
function drawInterestCard(ctx, interest, answer, x, y, w, h, pal) {
  const interestData = ALL_INTERESTS.find(i => i.id === interest);
  if (!interestData) return;

  ctx.save();

  // Sombra de la tarjeta
  ctx.shadowColor = `rgba(${hexToRgb(pal.accent)},0.10)`;
  ctx.shadowBlur  = 18;
  ctx.shadowOffsetY = 4;

  // Fondo tarjeta
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = pal.cardBg;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
  ctx.shadowOffsetY = 0;

  // Borde
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 18);
  ctx.strokeStyle = pal.cardBorder;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // Barra de color superior (acento del interés)
  const accentColor = interestData.color;
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + w - 18, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + 18);
  ctx.lineTo(x + w, y + 6);
  ctx.quadraticCurveTo(x + w, y, x + w - 18, y);
  ctx.lineTo(x + 18, y);
  ctx.quadraticCurveTo(x, y, x, y + 6);
  ctx.lineTo(x, y + 18);
  ctx.quadraticCurveTo(x, y, x + 18, y);

  // Franja superior de color
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + w - 18, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + 18);
  ctx.lineTo(x + w, y + 8);
  ctx.lineTo(x, y + 8);
  ctx.lineTo(x, y + 18);
  ctx.quadraticCurveTo(x, y, x + 18, y);
  ctx.closePath();
  ctx.fillStyle = `${accentColor}30`;
  ctx.fill();

  const pad = 20;
  const innerX = x + pad;
  const innerW = w - pad * 2;

  // Icono + nombre del interés
  ctx.font = `600 11px -apple-system, system-ui, sans-serif`;
  ctx.fillStyle = pal.textLight;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Emoji icon
  ctx.font = `${Math.min(h * 0.22, 28)}px serif`;
  ctx.fillText(interestData.icon, innerX, y + 18);

  const iconW = ctx.measureText(interestData.icon).width + 8;

  // Nombre del interés
  ctx.font = `700 11px -apple-system, system-ui, sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.textBaseline = 'top';
  ctx.fillText(interestData.name.toUpperCase(), innerX + iconW, y + 22);

  // Línea divisoria
  ctx.strokeStyle = `rgba(${hexToRgb(pal.accent)},0.08)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + pad, y + 50);
  ctx.lineTo(x + w - pad, y + 50);
  ctx.stroke();

  // Respuesta del usuario — texto principal grande
  const answerY = y + 60;
  const answerH = h - 70;

  // Calcular tamaño de fuente dinámico
  let fontSize = 22;
  ctx.font = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  while (ctx.measureText(answer || '').width > innerW && fontSize > 13) {
    fontSize--;
    ctx.font = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  }

  ctx.save();
  ctx.rect(x + pad, answerY, innerW, answerH);
  ctx.clip();

  ctx.font = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  ctx.fillStyle = pal.textDark;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, answer || '—', innerX, answerY + 4, innerW, fontSize * 1.35, 3);

  ctx.restore();

  // Sparkle decorativo en esquina inferior derecha de la tarjeta
  drawSparkle(ctx, x + w - 16, y + h - 16, 7, `${accentColor}80`);

  ctx.restore();
}

function drawSparkle(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.lineCap     = 'round';
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawBoardFooter(ctx, W, H, pal) {
  const cx = W / 2;
  const y  = H - 28;

  // Línea sutil
  const lineGrad = ctx.createLinearGradient(W * 0.25, y, W * 0.75, y);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, `rgba(${hexToRgb(pal.accent)},0.20)`);
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, y - 8);
  ctx.lineTo(W * 0.75, y - 8);
  ctx.stroke();

  ctx.font = '500 11px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = `rgba(${hexToRgb(pal.accent)},0.45)`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦  VISION BOARD 2026  ✦', cx, y);
}

// Dibuja ornamentos de bordes (esquinas botánicas)
function drawBoardOrnaments(ctx, W, H, pal) {
  ctx.save();
  const c1 = `rgba(${hexToRgb(pal.accent)},0.30)`;
  const c2 = `rgba(${hexToRgb(pal.accent2)},0.20)`;

  // Esquina inf-der
  ctx.strokeStyle = c1;
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(W - 12, H - 12);
  ctx.bezierCurveTo(W - 50, H - 80, W - 100, H - 130, W - 140, H - 170);
  ctx.stroke();

  const leaves = [
    { x: W-55, y: H-90,  rx: 20, ry: 9, rot: -50 },
    { x: W-95, y: H-130, rx: 16, ry: 7, rot:  30 },
    { x: W-130,y: H-165, rx: 13, ry: 6, rot: -40 },
  ];
  leaves.forEach(({ x, y, rx, ry, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = c2;
    ctx.fill();
    ctx.restore();
  });

  // Esquina sup-izq
  ctx.strokeStyle = `rgba(${hexToRgb(pal.accent)},0.15)`;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 56);
  ctx.bezierCurveTo(50, 110, 90, 150, 130, 185);
  ctx.stroke();

  ctx.restore();
}


// ── Módulo: Generador de Board ───────────────────────────────

function generateBoard() {
  const canvas = $('vision-canvas');
  const ctx    = canvas.getContext('2d');
  const W      = canvas.width;   // 1200
  const H      = canvas.height;  // 800

  const pal = CANVAS_PALETTES[state.gender] || CANVAS_PALETTES.mujer;

  ctx.clearRect(0, 0, W, H);

  // Fondo
  drawBoardBackground(ctx, W, H, pal);

  // Ornamentos esquinas
  drawBoardOrnaments(ctx, W, H, pal);

  // Header
  drawBoardHeader(ctx, W, pal);

  // ── Layout de 5 tarjetas: 1 ancha arriba + 2+2 abajo ──────
  // Área de tarjetas: y=58 a y=760
  const PAD    = 36;   // padding exterior
  const GAP    = 14;   // gap entre tarjetas
  const CARD_Y_TOP   = 58;
  const CARD_AREA_H  = H - CARD_Y_TOP - 40;

  // Row 1: 1 tarjeta ancha
  const ROW1_H = Math.floor(CARD_AREA_H * 0.36);
  const ROW2_H = Math.floor(CARD_AREA_H * 0.30);
  const ROW3_H = CARD_AREA_H - ROW1_H - ROW2_H - GAP * 2;

  const ROW1_Y = CARD_Y_TOP;
  const ROW2_Y = ROW1_Y + ROW1_H + GAP;
  const ROW3_Y = ROW2_Y + ROW2_H + GAP;

  const INNER_W = W - PAD * 2;
  const HALF_W  = Math.floor((INNER_W - GAP) / 2);

  const questions = getActiveQuestions();

  if (questions.length >= 1) {
    drawInterestCard(ctx, questions[0].id, state.answers[questions[0].id] || '', PAD, ROW1_Y, INNER_W, ROW1_H, pal);
  }
  if (questions.length >= 2) {
    drawInterestCard(ctx, questions[1].id, state.answers[questions[1].id] || '', PAD, ROW2_Y, HALF_W, ROW2_H, pal);
  }
  if (questions.length >= 3) {
    drawInterestCard(ctx, questions[2].id, state.answers[questions[2].id] || '', PAD + HALF_W + GAP, ROW2_Y, HALF_W, ROW2_H, pal);
  }
  if (questions.length >= 4) {
    drawInterestCard(ctx, questions[3].id, state.answers[questions[3].id] || '', PAD, ROW3_Y, HALF_W, ROW3_H, pal);
  }
  if (questions.length >= 5) {
    drawInterestCard(ctx, questions[4].id, state.answers[questions[4].id] || '', PAD + HALF_W + GAP, ROW3_Y, HALF_W, ROW3_H, pal);
  }

  // Footer
  drawBoardFooter(ctx, W, H, pal);
}


// ── Módulo: Descarga y Pantalla Completa ─────────────────────

function downloadBoard() {
  const canvas = $('vision-canvas');
  const link   = document.createElement('a');
  link.download = 'vision-board-2026.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

function openFullscreen() {
  const src     = $('vision-canvas');
  const dst     = $('fullscreen-canvas');
  const overlay = $('fullscreen-overlay');
  dst.width  = src.width;
  dst.height = src.height;
  dst.getContext('2d').drawImage(src, 0, 0);
  overlay.classList.add('is-open');
}

function closeFullscreen() {
  $('fullscreen-overlay').classList.remove('is-open');
}


// ── Inicialización ───────────────────────────────────────────

function resetState() {
  state.gender    = null;
  state.interests = [];
  state.answers   = {};
  state.step      = 0;
}

function init() {
  // Comprobar datos guardados
  const saved = Storage.load();
  if (saved && saved.answers && Object.values(saved.answers).some(v => v && v.trim())) {
    $('restore-btn').style.display = 'inline-flex';
  }

  // ── Pantalla de Género ──────────────────────────────────
  initGenderScreen();

  $('restore-btn').addEventListener('click', () => {
    const saved = Storage.load();
    if (!saved) return;
    Object.assign(state, {
      gender:    saved.gender    || 'mujer',
      interests: saved.interests || [],
      answers:   saved.answers   || {},
    });
    applyTheme(state.gender);
    showScreen('board-screen');
    setTimeout(generateBoard, 380);
  });

  // ── Pantalla de Intereses ───────────────────────────────
  $('back-to-gender-btn').addEventListener('click', () => {
    state.interests = [];
    showScreen('gender-screen');
  });

  $('interests-next-btn').addEventListener('click', () => {
    if (state.interests.length !== 5) return;
    // Limpiar respuestas previas de intereses ya no seleccionados
    const activeIds = new Set(state.interests);
    Object.keys(state.answers).forEach(k => {
      if (!activeIds.has(k)) delete state.answers[k];
    });
    showScreen('wizard-screen');
    setTimeout(initWizard, 220);
  });

  // ── Wizard ─────────────────────────────────────────────
  $('answer-input').addEventListener('input', handleInputChange);
  $('answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !$('next-btn').disabled) handleNext();
  });
  $('next-btn').addEventListener('click', handleNext);
  $('prev-btn').addEventListener('click', handlePrev);

  // ── Board ──────────────────────────────────────────────
  $('download-btn').addEventListener('click', downloadBoard);
  $('fullscreen-btn').addEventListener('click', openFullscreen);

  $('restart-btn').addEventListener('click', () => {
    if (!confirm('¿Crear un nuevo Vision Board? Se borrará el actual.')) return;
    Storage.clear();
    resetState();
    document.body.removeAttribute('data-theme');
    $('restore-btn').style.display = 'none';
    document.querySelectorAll('.gender-card').forEach(c => c.classList.remove('is-selected'));
    showScreen('gender-screen');
  });

  // ── Pantalla completa ──────────────────────────────────
  $('close-fullscreen').addEventListener('click', closeFullscreen);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFullscreen();
  });
}

document.addEventListener('DOMContentLoaded', init);
