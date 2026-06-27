import { describe, it, expect } from 'vitest'
import {
  getIntentionPalette,
  INTENTION_PALETTES,
} from '../src/logic.js'

const DEFAULT = INTENTION_PALETTES.default

describe('getIntentionPalette', () => {

  // ── Estructura del resultado ───────────────────────────────
  describe('estructura de la paleta devuelta', () => {
    it('siempre devuelve un objeto con las propiedades a, b, c y accent', () => {
      const palette = getIntentionPalette('enfoque')
      expect(palette).toHaveProperty('a')
      expect(palette).toHaveProperty('b')
      expect(palette).toHaveProperty('c')
      expect(palette).toHaveProperty('accent')
    })

    it('los valores de color son strings hexadecimales válidos (#RRGGBB)', () => {
      const palette = getIntentionPalette('aventura')
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      expect(palette.a).toMatch(hexRegex)
      expect(palette.b).toMatch(hexRegex)
      expect(palette.c).toMatch(hexRegex)
      expect(palette.accent).toMatch(hexRegex)
    })
  })

  // ── Coincidencias exactas ──────────────────────────────────
  describe('palabras clave exactas', () => {
    it('devuelve paleta enfoque para "enfoque"', () => {
      expect(getIntentionPalette('enfoque')).toEqual(INTENTION_PALETTES.enfoque)
    })

    it('devuelve paleta aventura para "aventura"', () => {
      expect(getIntentionPalette('aventura')).toEqual(INTENTION_PALETTES.aventura)
    })

    it('devuelve paleta crecimiento para "crecimiento"', () => {
      expect(getIntentionPalette('crecimiento')).toEqual(INTENTION_PALETTES.crecimiento)
    })

    it('devuelve paleta equilibrio para "equilibrio"', () => {
      expect(getIntentionPalette('equilibrio')).toEqual(INTENTION_PALETTES.equilibrio)
    })
  })

  // ── Mayúsculas y minúsculas ────────────────────────────────
  describe('insensibilidad a mayúsculas', () => {
    it('"ENFOQUE" → paleta enfoque', () => {
      expect(getIntentionPalette('ENFOQUE')).toEqual(INTENTION_PALETTES.enfoque)
    })

    it('"Aventura" → paleta aventura', () => {
      expect(getIntentionPalette('Aventura')).toEqual(INTENTION_PALETTES.aventura)
    })

    it('"CRECIMIENTO" → paleta crecimiento', () => {
      expect(getIntentionPalette('CRECIMIENTO')).toEqual(INTENTION_PALETTES.crecimiento)
    })
  })

  // ── Normalización de tildes ────────────────────────────────
  describe('normalización de caracteres acentuados', () => {
    // Los keywords del diccionario no tienen tildes (enfoque, aventura…)
    // pero el input del usuario puede tenerlas → se normalizan correctamente.
    it('"Énfoque" (con tilde) → paleta enfoque', () => {
      expect(getIntentionPalette('Énfoque')).toEqual(INTENTION_PALETTES.enfoque)
    })

    it('"áventura" (con tilde) → paleta aventura', () => {
      expect(getIntentionPalette('áventura')).toEqual(INTENTION_PALETTES.aventura)
    })
  })

  // ── Palabras clave dentro de frases ───────────────────────
  describe('keyword como parte de una frase', () => {
    it('"quiero enfoque este año" → paleta enfoque', () => {
      expect(getIntentionPalette('quiero enfoque este año')).toEqual(INTENTION_PALETTES.enfoque)
    })

    it('"más crecimiento personal" → paleta crecimiento', () => {
      expect(getIntentionPalette('más crecimiento personal')).toEqual(INTENTION_PALETTES.crecimiento)
    })
  })

  // ── Valores sin coincidencia → default ────────────────────
  describe('fallback a paleta por defecto', () => {
    it('devuelve default para una palabra desconocida', () => {
      expect(getIntentionPalette('abundancia')).toEqual(DEFAULT)
    })

    it('devuelve default para cadena vacía', () => {
      expect(getIntentionPalette('')).toEqual(DEFAULT)
    })

    it('devuelve default para null', () => {
      expect(getIntentionPalette(null)).toEqual(DEFAULT)
    })

    it('devuelve default para undefined', () => {
      expect(getIntentionPalette(undefined)).toEqual(DEFAULT)
    })

    it('devuelve default para número (no lanza TypeError)', () => {
      expect(getIntentionPalette(42)).toEqual(DEFAULT)
    })
  })
})
