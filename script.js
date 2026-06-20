/* ============================================================
   Vision Board Generator — script.js
   Vanilla JS ES6+ | Sin dependencias externas
   ============================================================ */

'use strict';

// ── Constantes ───────────────────────────────────────────────

const STORAGE_KEY = 'visionboard_2026';

const QUESTIONS = [
  {
    id: 'intention',
    icon: '🌈',
    label: 'Tu Intención del Año',
    prompt: '¿Cuál es tu intención principal para este año?',
    hint: 'Ej: Enfoque · Aventura · Crecimiento · Equilibrio',
    maxLength: 20,
  },
  {
    id: 'skill',
    icon: '🎯',
    label: 'Meta o Habilidad',
    prompt: '¿Qué habilidad o meta técnica quieres dominar?',
    hint: 'Ej: React avanzado · Inglés fluido · Softbol',
    maxLength: 40,
  },
  {
    id: 'habit',
    icon: '🌀',
    label: 'Tu Hábito Diario',
    prompt: '¿Qué hábito quieres integrar en tu día a día?',
    hint: 'Ej: Leer · Meditación · Correr · Journaling',
    maxLength: 30,
  },
  {
    id: 'place',
    icon: '🗺️',
    label: 'Lugar o Experiencia',
    prompt: '¿Qué lugar o experiencia quieres vivir este año?',
    hint: 'Ej: Montaña · Playa · Tokyo · Un concierto',
    maxLength: 40,
  },
  {
    id: 'energy',
    icon: '⚡',
    label: 'Tu Energía Actual',
    prompt: '¿Qué palabra define tu energía actual?',
    hint: 'Ej: Fluir · Enfocada · Imparable · Brillar',
    maxLength: 20,
  },
];

// Paletas según intención (keywords → paleta de canvas)
const INTENTION_PALETTES = {
  enfoque:     { a: '#7C9EF5', b: '#A8C4FF', c: '#E8F0FF', accent: '#4A72D4' },
  aventura:    { a: '#F5A07C', b: '#FFD0A8', c: '#FFF5EE', accent: '#D47A4A' },
  crecimiento: { a: '#7CF5A0', b: '#A8FFD0', c: '#EEFFF5', accent: '#4AD47A' },
  equilibrio:  { a: '#C47CF5', b: '#E0A8FF', c: '#F8EEFF', accent: '#9A4AD4' },
  default:     { a: '#B07FE8', b: '#F0A0CC', c: '#FFF0F8', accent: '#8855CC' },
};

// Patrones de fondo según lugar
const PLACE_PATTERNS = {
  beach:    ['playa', 'mar', 'ocean', 'arena', 'agua', 'costa', 'caribe'],
  mountain: ['montaña', 'sierra', 'bosque', 'trekking', 'cerro', 'alpinismo', 'hiking'],
  city:     ['ciudad', 'paris', 'tokyo', 'new york', 'manhattan', 'roma', 'barcelona', 'madrid'],
};

// Iconos para hábitos
const HABIT_ICONS = {
  leer:      'star',
  libro:     'star',
  meditar:   'moon',
  meditación:'moon',
  correr:    'circle',
  deporte:   'circle',
  ejercicio: 'circle',
  yoga:      'moon',
  escribir:  'diamond',
  journal:   'diamond',
  default:   'leaf',
};


// ── Estado de la aplicación ──────────────────────────────────

const state = {
  step: 0,
  answers: { intention: '', skill: '', habit: '', place: '', energy: '' },
};


// ── Helpers de DOM ───────────────────────────────────────────

const $ = (id) => document.getElementById(id);
const q = (sel) => document.querySelector(sel);


// ── Módulo: Storage ──────────────────────────────────────────

const Storage = {
  save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  },
  load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (_) { return null; }
  },
  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  },
};


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


// ── Módulo: Wizard ───────────────────────────────────────────

function initWizard() {
  state.step = 0;
  renderDots();
  renderQuestion(0, false);
}

function renderDots() {
  const container = $('progress-dots');
  container.innerHTML = QUESTIONS.map((_, i) => {
    let cls = 'dot';
    if (i === state.step) cls += ' is-active';
    else if (i < state.step) cls += ' is-done';
    return `<div class="${cls}" aria-hidden="true"></div>`;
  }).join('');
}

function renderQuestion(index, animate = true) {
  const q_data  = QUESTIONS[index];
  const card    = $('question-card');
  const input   = $('answer-input');
  const counter = $('char-counter');

  // Barra de progreso
  $('progress-fill').style.width = `${((index + 1) / QUESTIONS.length) * 100}%`;

  const doRender = () => {
    $('question-icon').textContent   = q_data.icon;
    $('question-label').textContent  = q_data.label;
    $('question-prompt').textContent = q_data.prompt;
    $('question-hint').textContent   = q_data.hint;

    input.maxLength    = q_data.maxLength;
    input.placeholder  = q_data.hint.split('·')[0].replace('Ej:', '').trim() + '...';
    input.value        = state.answers[q_data.id] || '';

    const len = input.value.length;
    counter.textContent = `${len} / ${q_data.maxLength}`;
    counter.classList.toggle('is-warn', len > q_data.maxLength * 0.85);

    renderDots();
    updateNav();

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

function updateNav() {
  const isFirst = state.step === 0;
  const isLast  = state.step === QUESTIONS.length - 1;
  const val     = (state.answers[QUESTIONS[state.step].id] || '').trim();

  $('prev-btn').style.visibility = isFirst ? 'hidden' : 'visible';

  const nextBtn = $('next-btn');
  nextBtn.innerHTML = isLast
    ? `Generar mi Board <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5l1.9 5.8h6.1l-4.95 3.6 1.9 5.8L9 13.1l-4.95 3.6 1.9-5.8L1 6.3h6.1z" fill="currentColor"/></svg>`
    : `Siguiente <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  nextBtn.disabled = val.length === 0;
}

function handleNext() {
  const q_data = QUESTIONS[state.step];
  const val    = $('answer-input').value.trim();
  if (!val) return;

  state.answers[q_data.id] = val;
  Storage.save(state.answers);

  if (state.step < QUESTIONS.length - 1) {
    state.step++;
    renderQuestion(state.step);
  } else {
    showScreen('board-screen');
    setTimeout(generateBoard, 350);
  }
}

function handlePrev() {
  if (state.step > 0) {
    state.step--;
    renderQuestion(state.step);
  }
}

function handleInputChange(e) {
  const q_data  = QUESTIONS[state.step];
  const val     = e.target.value;
  const counter = $('char-counter');

  state.answers[q_data.id] = val;

  counter.textContent = `${val.length} / ${q_data.maxLength}`;
  counter.classList.toggle('is-warn', val.length > q_data.maxLength * 0.85);

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
  let line  = '';
  let count = 0;

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

function getIntentionPalette(intention) {
  const key = (intention || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [name, palette] of Object.entries(INTENTION_PALETTES)) {
    if (name !== 'default' && key.includes(name)) return palette;
  }
  return INTENTION_PALETTES.default;
}

function getPlacePattern(place) {
  const key = (place || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [pattern, keywords] of Object.entries(PLACE_PATTERNS)) {
    if (keywords.some(kw => key.includes(kw))) return pattern;
  }
  return 'default';
}

function getHabitIcon(habit) {
  const key = (habit || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [kw, icon] of Object.entries(HABIT_ICONS)) {
    if (kw !== 'default' && key.includes(kw)) return icon;
  }
  return HABIT_ICONS.default;
}


// ── Módulo: Canvas — capas de dibujo ────────────────────────

/* Capa 1: Fondo con gradiente según intención */
function drawBackground(ctx, W, H, palette) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    palette.c);
  grad.addColorStop(0.5,  '#FFFFFF');
  grad.addColorStop(1,    palette.c);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

/* Capa 2: Patrón de fondo según lugar */
function drawBackgroundPattern(ctx, W, H, pattern, palette) {
  ctx.save();

  if (pattern === 'beach') {
    // Ondas horizontales
    ctx.strokeStyle = palette.a + '28';
    ctx.lineWidth = 2;
    for (let y = H * 0.55; y < H + 40; y += 36) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const yy = y + Math.sin((x / W) * Math.PI * 6) * 10;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

  } else if (pattern === 'mountain') {
    // Silueta de montañas en la parte inferior
    ctx.fillStyle = palette.a + '18';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.70);
    ctx.lineTo(W * 0.12, H * 0.52);
    ctx.lineTo(W * 0.22, H * 0.62);
    ctx.lineTo(W * 0.38, H * 0.42);
    ctx.lineTo(W * 0.52, H * 0.58);
    ctx.lineTo(W * 0.65, H * 0.38);
    ctx.lineTo(W * 0.78, H * 0.55);
    ctx.lineTo(W * 0.90, H * 0.46);
    ctx.lineTo(W, H * 0.60);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    // Segunda capa más oscura
    ctx.fillStyle = palette.a + '12';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.78);
    ctx.lineTo(W * 0.18, H * 0.62);
    ctx.lineTo(W * 0.35, H * 0.70);
    ctx.lineTo(W * 0.50, H * 0.58);
    ctx.lineTo(W * 0.70, H * 0.68);
    ctx.lineTo(W * 0.85, H * 0.60);
    ctx.lineTo(W, H * 0.72);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

  } else if (pattern === 'city') {
    // Cuadrícula de puntos
    ctx.fillStyle = palette.a + '22';
    const step = 42;
    for (let x = step; x < W; x += step) {
      for (let y = step; y < H; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Default: círculos dispersos pequeños
    const positions = [
      [0.08, 0.12], [0.92, 0.10], [0.05, 0.88], [0.95, 0.85],
      [0.50, 0.06], [0.50, 0.96], [0.18, 0.50], [0.82, 0.50],
      [0.30, 0.25], [0.70, 0.75], [0.25, 0.75], [0.75, 0.25],
    ];
    positions.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px * W, py * H, 18, 0, Math.PI * 2);
      ctx.fillStyle = palette.a + '18';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px * W, py * H, 32, 0, Math.PI * 2);
      ctx.strokeStyle = palette.a + '10';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  ctx.restore();
}

/* Capa 3: Ilustraciones botánicas / decorativas en esquinas */
function drawBotanicals(ctx, W, H, palette) {
  ctx.save();

  const c1 = palette.a + 'A0';  // ramas
  const c2 = palette.b + '80';  // hojas claras
  const c3 = palette.a + '50';  // elementos secundarios

  // ── Esquina inferior derecha: rama con hojas ──────────────
  ctx.strokeStyle = c1;
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';

  // Tallo principal (curva)
  ctx.beginPath();
  ctx.moveTo(W - 20,  H - 20);
  ctx.bezierCurveTo(W - 80, H - 100, W - 140, H - 160, W - 180, H - 220);
  ctx.stroke();

  // Hojas sobre la rama (elipses rotadas)
  const brLeaves = [
    { x: W - 70,  y: H - 110, rx: 28, ry: 13, rot: -50 },
    { x: W - 110, y: H - 155, rx: 24, ry: 11, rot:  30 },
    { x: W - 148, y: H - 195, rx: 22, ry: 10, rot: -40 },
    { x: W - 175, y: H - 235, rx: 18, ry:  8, rot:  20 },
  ];
  brLeaves.forEach(({ x, y, rx, ry, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = c2;
    ctx.fill();
    ctx.strokeStyle = c1;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  });

  // ── Esquina superior izquierda: ramas espejo ──────────────
  ctx.strokeStyle = c3;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(20,  20);
  ctx.bezierCurveTo(70, 90, 130, 140, 170, 200);
  ctx.stroke();

  const tlLeaves = [
    { x: 60,  y: 75,  rx: 22, ry: 10, rot:  40 },
    { x: 100, y: 120, rx: 20, ry: 9,  rot: -30 },
    { x: 140, y: 165, rx: 18, ry: 8,  rot:  25 },
  ];
  tlLeaves.forEach(({ x, y, rx, ry, rot }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.b + '55';
    ctx.fill();
    ctx.restore();
  });

  // ── Esquina inferior izquierda: arco decorativo ───────────
  ctx.beginPath();
  ctx.arc(0, H, 160, -Math.PI * 0.45, -Math.PI * 0.02);
  ctx.strokeStyle = palette.a + '20';
  ctx.lineWidth   = 60;
  ctx.stroke();

  // ── Esquina superior derecha: arco decorativo ────────────
  ctx.beginPath();
  ctx.arc(W, 0, 140, Math.PI * 0.55, Math.PI * 0.98);
  ctx.strokeStyle = palette.b + '18';
  ctx.lineWidth   = 50;
  ctx.stroke();

  // ── Destellos / sparkles dispersos ───────────────────────
  const sparkles = [
    { x: W * 0.12, y: H * 0.35 },
    { x: W * 0.88, y: H * 0.40 },
    { x: W * 0.15, y: H * 0.65 },
    { x: W * 0.85, y: H * 0.22 },
    { x: W * 0.50, y: H * 0.08 },
    { x: W * 0.50, y: H * 0.93 },
  ];
  sparkles.forEach(({ x, y }) => {
    drawSparkle(ctx, x, y, 10, palette.accent + '90');
  });

  // ── Círculos flotantes grandes (muy transparentes) ────────
  const bigCircles = [
    { x: W * 0.08, y: H * 0.25, r: 70 },
    { x: W * 0.92, y: H * 0.70, r: 90 },
    { x: W * 0.18, y: H * 0.78, r: 55 },
    { x: W * 0.82, y: H * 0.18, r: 65 },
  ];
  bigCircles.forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = palette.a + '14';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r + 18, 0, Math.PI * 2);
    ctx.strokeStyle = palette.a + '0A';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  });

  ctx.restore();
}

/* Dibuja un sparkle de 4 puntas */
function drawSparkle(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.8;
  ctx.lineCap     = 'round';
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
    ctx.stroke();
  }
  // Punto central
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/* Capa 4a: Halo/glow detrás del texto central */
function drawCentralGlow(ctx, W, H, palette) {
  const cx = W / 2;
  const cy = H * 0.46;
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260);
  glow.addColorStop(0,   palette.a + '30');
  glow.addColorStop(0.5, palette.a + '14');
  glow.addColorStop(1,   'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

/* Capa 4b: Píldora de intención (arriba del texto central) */
function drawIntentionPill(ctx, W, palette, intention) {
  const text     = (intention || 'MI INTENCIÓN').toUpperCase();
  const cx       = W / 2;
  const pillY    = H_CANVAS * 0.18;
  const pillH    = 42;
  const labelFont = '600 11px -apple-system, system-ui, sans-serif';
  const wordFont  = `700 ${Math.min(26, Math.max(16, 400 / text.length))}px -apple-system, system-ui, sans-serif`;

  // Medir la píldora
  ctx.font = wordFont;
  const wordW = ctx.measureText(text).width;
  const pillW = Math.max(wordW + 80, 200);

  // Fondo de la píldora
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cx - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle   = 'rgba(255,255,255,0.72)';
  ctx.shadowColor = palette.a + '40';
  ctx.shadowBlur  = 18;
  ctx.fill();
  ctx.restore();

  // Etiqueta "INTENCIÓN DEL AÑO"
  ctx.save();
  ctx.font      = labelFont;
  ctx.fillStyle = palette.accent + 'AA';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INTENCIÓN DEL AÑO', cx, pillY - 9);
  ctx.restore();

  // La palabra
  ctx.save();
  ctx.font         = wordFont;
  ctx.fillStyle    = palette.accent;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, pillY + 9);
  ctx.restore();
}

/* Capa 4c: Texto central — la habilidad/meta */
function drawCentralSkill(ctx, W, palette, skill) {
  const text = skill || 'Mi Meta 2026';
  const cx   = W / 2;
  const cy   = H_CANVAS * 0.47;

  // Calcular tamaño de fuente dinámico
  let fontSize = 78;
  ctx.font = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  while (ctx.measureText(text).width > W * 0.78 && fontSize > 32) {
    fontSize -= 2;
    ctx.font = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  }

  // Sombra suave
  ctx.save();
  ctx.font          = `800 ${fontSize}px -apple-system, system-ui, sans-serif`;
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.shadowColor   = palette.accent + '40';
  ctx.shadowBlur    = 28;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle     = palette.accent;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

/* Capa 4d: Iconos de hábito orbitando el texto central */
function drawHabitOrbit(ctx, W, palette, habit) {
  const iconType = getHabitIcon(habit);
  const cx       = W / 2;
  const cy       = H_CANVAS * 0.47;
  const orbitR   = 185;
  const count    = 6;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x     = cx + Math.cos(angle) * orbitR;
    const y     = cy + Math.sin(angle) * orbitR;

    ctx.save();
    ctx.globalAlpha = 0.55;
    drawCanvasIcon(ctx, iconType, x, y, 18, palette.accent);
    ctx.restore();
  }
}

/* Dibuja un icono de canvas por tipo y coordenadas */
function drawCanvasIcon(ctx, type, x, y, size, color) {
  ctx.save();
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  switch (type) {
    case 'star':   drawStarIcon(ctx, x, y, size);    break;
    case 'moon':   drawMoonIcon(ctx, x, y, size);    break;
    case 'circle': drawCircleIcon(ctx, x, y, size);  break;
    case 'diamond':drawDiamondIcon(ctx, x, y, size); break;
    case 'leaf':
    default:       drawLeafIcon(ctx, x, y, size);    break;
  }

  ctx.restore();
}

function drawStarIcon(ctx, cx, cy, size) {
  const outer = size * 0.5;
  const inner = size * 0.22;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
            : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawMoonIcon(ctx, cx, cy, size) {
  const r = size * 0.48;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Muerde la luna para crear la media luna
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.55, cy - r * 0.15, r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCircleIcon(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiamondIcon(ctx, cx, cy, size) {
  const s = size * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.rect(-s * 0.65, -s * 0.65, s * 1.3, s * 1.3);
  ctx.fill();
  ctx.restore();
}

function drawLeafIcon(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* Capa 5: Lugar/experiencia — etiqueta elegante */
function drawPlaceLabel(ctx, W, H, palette, place) {
  if (!place) return;
  const cx  = W / 2;
  const y   = H * 0.76;
  const text = place;

  ctx.save();
  // Línea decorativa
  const lineW = 80;
  ctx.strokeStyle = palette.a + '70';
  ctx.lineWidth   = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - lineW - 10, y);
  ctx.lineTo(cx - 10, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 10, y);
  ctx.lineTo(cx + lineW + 10, y);
  ctx.stroke();

  ctx.font         = 'italic 500 15px Georgia, "Times New Roman", serif';
  ctx.fillStyle    = palette.accent + 'CC';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✈  ${text}`, cx, y);
  ctx.restore();
}

/* Capa 5b: Energía — frase de cierre en la parte inferior */
function drawEnergyFooter(ctx, W, H, palette, energy) {
  const cx   = W / 2;
  const text = energy ? `✦ ${energy.toUpperCase()} ✦` : '✦ VISION BOARD 2026 ✦';

  // Píldora de fondo
  ctx.save();
  ctx.font = '700 18px -apple-system, system-ui, sans-serif';
  const tw  = ctx.measureText(text).width;
  const pw  = tw + 64;
  const ph  = 40;
  const py  = H - 54;

  ctx.beginPath();
  roundRect(ctx, cx - pw / 2, py - ph / 2, pw, ph, ph / 2);
  ctx.fillStyle   = palette.a + '30';
  ctx.fill();
  ctx.strokeStyle = palette.a + '60';
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font         = '700 18px -apple-system, system-ui, sans-serif';
  ctx.fillStyle    = palette.accent + 'DD';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, H - 54);
  ctx.restore();
}

/* Capa 6: Línea divisoria y año pequeño */
function drawDivider(ctx, W, H, palette) {
  const y = H - 90;

  ctx.save();
  const grad = ctx.createLinearGradient(W * 0.2, y, W * 0.8, y);
  grad.addColorStop(0,   'transparent');
  grad.addColorStop(0.5, palette.a + '50');
  grad.addColorStop(1,   'transparent');
  ctx.strokeStyle = grad;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, y);
  ctx.lineTo(W * 0.8, y);
  ctx.stroke();
  ctx.restore();
}


// ── Módulo: Generador de Board ───────────────────────────────

let H_CANVAS = 800; // accesible en helpers que necesitan cy

function generateBoard() {
  const canvas  = $('vision-canvas');
  const ctx     = canvas.getContext('2d');
  const W       = canvas.width;
  const H       = canvas.height;
  H_CANVAS      = H;

  const { intention, skill, habit, place, energy } = state.answers;
  const palette  = getIntentionPalette(intention);
  const pattern  = getPlacePattern(place);

  // Limpiar
  ctx.clearRect(0, 0, W, H);

  // Dibujar capas en orden
  drawBackground(ctx, W, H, palette);
  drawBackgroundPattern(ctx, W, H, pattern, palette);
  drawBotanicals(ctx, W, H, palette);
  drawCentralGlow(ctx, W, H, palette);
  drawIntentionPill(ctx, W, palette, intention);
  drawCentralSkill(ctx, W, palette, skill);
  drawHabitOrbit(ctx, W, palette, habit);
  drawPlaceLabel(ctx, W, H, palette, place);
  drawDivider(ctx, W, H, palette);
  drawEnergyFooter(ctx, W, H, palette, energy);
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
  const src   = $('vision-canvas');
  const dst   = $('fullscreen-canvas');
  const overlay = $('fullscreen-overlay');

  dst.width  = src.width;
  dst.height = src.height;
  dst.getContext('2d').drawImage(src, 0, 0);

  overlay.classList.add('is-open');
  overlay.focus();
}

function closeFullscreen() {
  $('fullscreen-overlay').classList.remove('is-open');
}


// ── Inicialización ───────────────────────────────────────────

function init() {
  // Comprobar datos guardados
  const saved = Storage.load();
  if (saved && Object.values(saved).some(v => v && v.trim())) {
    $('restore-btn').style.display = 'inline-flex';
  }

  // ── Pantalla de bienvenida ──────────────────────────────
  $('start-btn').addEventListener('click', () => {
    Object.assign(state.answers, { intention: '', skill: '', habit: '', place: '', energy: '' });
    showScreen('wizard-screen');
    setTimeout(initWizard, 220);
  });

  $('restore-btn').addEventListener('click', () => {
    const saved = Storage.load();
    if (!saved) return;
    Object.assign(state.answers, saved);
    showScreen('board-screen');
    setTimeout(generateBoard, 380);
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
    Object.assign(state.answers, { intention: '', skill: '', habit: '', place: '', energy: '' });
    $('restore-btn').style.display = 'none';
    showScreen('welcome-screen');
  });

  // ── Pantalla completa ──────────────────────────────────
  $('close-fullscreen').addEventListener('click', closeFullscreen);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFullscreen();
  });
}

document.addEventListener('DOMContentLoaded', init);
