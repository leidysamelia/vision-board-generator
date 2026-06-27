import { describe, it, expect } from 'vitest'
import { getPlacePattern } from '../src/logic.js'

describe('getPlacePattern', () => {

  // ── Patrón beach ──────────────────────────────────────────
  describe('patrón "beach" (playa / mar / océano)', () => {
    it('"playa" → beach', () => {
      expect(getPlacePattern('playa')).toBe('beach')
    })

    it('"mar" → beach', () => {
      expect(getPlacePattern('mar')).toBe('beach')
    })

    it('"arena" → beach', () => {
      expect(getPlacePattern('arena')).toBe('beach')
    })

    it('"caribe" → beach', () => {
      expect(getPlacePattern('caribe')).toBe('beach')
    })

    it('"costa rica" → beach (contiene "costa")', () => {
      expect(getPlacePattern('costa rica')).toBe('beach')
    })

    it('"ir a la playa en agosto" → beach', () => {
      expect(getPlacePattern('ir a la playa en agosto')).toBe('beach')
    })

    // "ocean" es el keyword exacto (sin tilde), "océano" normalizado también lo contiene
    it('"ocean" → beach', () => {
      expect(getPlacePattern('ocean')).toBe('beach')
    })

    it('"océano" normalizado contiene "ocean" → beach', () => {
      // "océano" → normalize → "oceano" → "oceano".includes("ocean") → true
      expect(getPlacePattern('océano')).toBe('beach')
    })
  })

  // ── Patrón mountain ───────────────────────────────────────
  describe('patrón "mountain" (sierra / bosque / trekking)', () => {
    it('"sierra" → mountain', () => {
      expect(getPlacePattern('sierra')).toBe('mountain')
    })

    it('"bosque" → mountain', () => {
      expect(getPlacePattern('bosque')).toBe('mountain')
    })

    it('"trekking" → mountain', () => {
      expect(getPlacePattern('trekking')).toBe('mountain')
    })

    it('"hiking" → mountain', () => {
      expect(getPlacePattern('hiking')).toBe('mountain')
    })

    it('"cerro" → mountain', () => {
      expect(getPlacePattern('cerro')).toBe('mountain')
    })

    it('"alpinismo" → mountain', () => {
      expect(getPlacePattern('alpinismo')).toBe('mountain')
    })

    it('"montaña" (con ñ) → mountain', () => {
      expect(getPlacePattern('montaña')).toBe('mountain')
    })

    it('"La montaña más alta" → mountain', () => {
      expect(getPlacePattern('La montaña más alta')).toBe('mountain')
    })
  })

  // ── Patrón city ───────────────────────────────────────────
  describe('patrón "city" (ciudad / capitales)', () => {
    it('"ciudad" → city', () => {
      expect(getPlacePattern('ciudad')).toBe('city')
    })

    it('"paris" → city', () => {
      expect(getPlacePattern('paris')).toBe('city')
    })

    it('"tokyo" → city', () => {
      expect(getPlacePattern('tokyo')).toBe('city')
    })

    it('"madrid" → city', () => {
      expect(getPlacePattern('madrid')).toBe('city')
    })

    it('"new york" → city', () => {
      expect(getPlacePattern('new york')).toBe('city')
    })

    it('"manhattan" → city', () => {
      expect(getPlacePattern('manhattan')).toBe('city')
    })

    it('"roma" → city', () => {
      expect(getPlacePattern('roma')).toBe('city')
    })

    it('"barcelona" → city', () => {
      expect(getPlacePattern('barcelona')).toBe('city')
    })

    it('"París" (con tilde) → city (normalizado a "paris")', () => {
      expect(getPlacePattern('París')).toBe('city')
    })
  })

  // ── Fallback default ──────────────────────────────────────
  describe('fallback a "default"', () => {
    it('lugar desconocido → default', () => {
      expect(getPlacePattern('espacio exterior')).toBe('default')
    })

    it('cadena vacía → default', () => {
      expect(getPlacePattern('')).toBe('default')
    })

    it('null → default', () => {
      expect(getPlacePattern(null)).toBe('default')
    })

    it('undefined → default', () => {
      expect(getPlacePattern(undefined)).toBe('default')
    })
  })

  // ── Insensibilidad a mayúsculas ───────────────────────────
  describe('insensibilidad a mayúsculas', () => {
    it('"PLAYA" → beach', () => {
      expect(getPlacePattern('PLAYA')).toBe('beach')
    })

    it('"TOKYO" → city', () => {
      expect(getPlacePattern('TOKYO')).toBe('city')
    })

    it('"Trekking" → mountain', () => {
      expect(getPlacePattern('Trekking')).toBe('mountain')
    })
  })
})
