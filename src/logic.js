// Lógica pura extraída de script.js para ser testeable de forma aislada

export const STORAGE_KEY = 'visionboard_2026';

export const QUESTIONS = [
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

export const INTENTION_PALETTES = {
  enfoque:     { a: '#7C9EF5', b: '#A8C4FF', c: '#E8F0FF', accent: '#4A72D4' },
  aventura:    { a: '#F5A07C', b: '#FFD0A8', c: '#FFF5EE', accent: '#D47A4A' },
  crecimiento: { a: '#7CF5A0', b: '#A8FFD0', c: '#EEFFF5', accent: '#4AD47A' },
  equilibrio:  { a: '#C47CF5', b: '#E0A8FF', c: '#F8EEFF', accent: '#9A4AD4' },
  default:     { a: '#B07FE8', b: '#F0A0CC', c: '#FFF0F8', accent: '#8855CC' },
};

export const PLACE_PATTERNS = {
  beach:    ['playa', 'mar', 'ocean', 'arena', 'agua', 'costa', 'caribe'],
  mountain: ['montaña', 'sierra', 'bosque', 'trekking', 'cerro', 'alpinismo', 'hiking'],
  city:     ['ciudad', 'paris', 'tokyo', 'new york', 'manhattan', 'roma', 'barcelona', 'madrid'],
};

export const HABIT_ICONS = {
  leer:       'star',
  libro:      'star',
  meditar:    'moon',
  meditación: 'moon',
  correr:     'circle',
  deporte:    'circle',
  ejercicio:  'circle',
  yoga:       'moon',
  escribir:   'diamond',
  journal:    'diamond',
  default:    'leaf',
};

// Bug #2 fix: String(str || '') maneja inputs no-string (números, null, undefined).
// Bug #1 fix: normalizar también las keywords del diccionario al comparar.
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function getIntentionPalette(intention) {
  const key = normalize(intention);
  for (const [name, palette] of Object.entries(INTENTION_PALETTES)) {
    if (name !== 'default' && key.includes(normalize(name))) return palette;
  }
  return INTENTION_PALETTES.default;
}

export function getPlacePattern(place) {
  const key = normalize(place);
  for (const [pattern, keywords] of Object.entries(PLACE_PATTERNS)) {
    if (keywords.some(kw => key.includes(normalize(kw)))) return pattern;
  }
  return 'default';
}

export function getHabitIcon(habit) {
  const key = normalize(habit);
  for (const [kw, icon] of Object.entries(HABIT_ICONS)) {
    if (kw !== 'default' && key.includes(normalize(kw))) return icon;
  }
  return HABIT_ICONS.default;
}

export const Storage = {
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

export function roundRect(ctx, x, y, w, h, r) {
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

export function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
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

export function createInitialState() {
  return {
    step: 0,
    answers: { intention: '', skill: '', habit: '', place: '', energy: '' },
  };
}
