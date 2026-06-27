import { describe, it, expect, beforeEach, vi } from 'vitest'
import { roundRect, wrapText } from '../src/logic.js'

// Mock del contexto 2D de canvas (jsdom no implementa canvas completo)
function createCtxMock() {
  return {
    moveTo:              vi.fn(),
    lineTo:              vi.fn(),
    quadraticCurveTo:    vi.fn(),
    closePath:           vi.fn(),
    fillText:            vi.fn(),
    // measureText devuelve 8px por carácter para cálculos predecibles en tests
    measureText:         vi.fn((text) => ({ width: text.length * 8 })),
  }
}

// ── roundRect ─────────────────────────────────────────────────
describe('roundRect', () => {
  let ctx

  beforeEach(() => {
    ctx = createCtxMock()
  })

  it('llama a moveTo exactamente una vez', () => {
    roundRect(ctx, 0, 0, 100, 50, 10)
    expect(ctx.moveTo).toHaveBeenCalledTimes(1)
  })

  it('llama a lineTo exactamente 4 veces (un lado por arista)', () => {
    roundRect(ctx, 0, 0, 100, 50, 10)
    expect(ctx.lineTo).toHaveBeenCalledTimes(4)
  })

  it('llama a quadraticCurveTo exactamente 4 veces (una por esquina)', () => {
    roundRect(ctx, 0, 0, 100, 50, 10)
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4)
  })

  it('llama a closePath exactamente una vez al finalizar el path', () => {
    roundRect(ctx, 0, 0, 100, 50, 10)
    expect(ctx.closePath).toHaveBeenCalledTimes(1)
  })

  it('el primer moveTo comienza en (x + r, y)', () => {
    roundRect(ctx, 10, 20, 200, 80, 15)
    expect(ctx.moveTo).toHaveBeenCalledWith(10 + 15, 20)
  })

  it('funciona con radio 0 (rectángulo sin esquinas redondeadas)', () => {
    expect(() => roundRect(ctx, 0, 0, 100, 50, 0)).not.toThrow()
  })

  it('funciona con coordenadas negativas', () => {
    expect(() => roundRect(ctx, -50, -50, 100, 100, 5)).not.toThrow()
  })

  it('funciona con dimensiones muy pequeñas', () => {
    expect(() => roundRect(ctx, 0, 0, 2, 2, 1)).not.toThrow()
  })
})

// ── wrapText ──────────────────────────────────────────────────
describe('wrapText', () => {
  let ctx

  beforeEach(() => {
    ctx = createCtxMock()
  })

  // ── Texto vacío o nulo ────────────────────────────────────
  describe('texto vacío o nulo', () => {
    it('devuelve 0 para string vacío', () => {
      expect(wrapText(ctx, '', 0, 0, 200, 20, 3)).toBe(0)
    })

    it('devuelve 0 para null', () => {
      expect(wrapText(ctx, null, 0, 0, 200, 20, 3)).toBe(0)
    })

    it('devuelve 0 para undefined', () => {
      expect(wrapText(ctx, undefined, 0, 0, 200, 20, 3)).toBe(0)
    })

    it('no llama a fillText cuando el texto es vacío', () => {
      wrapText(ctx, '', 0, 0, 200, 20, 3)
      expect(ctx.fillText).not.toHaveBeenCalled()
    })
  })

  // ── Una sola línea ────────────────────────────────────────
  describe('texto que cabe en una línea', () => {
    it('devuelve 1 para una sola palabra que cabe', () => {
      // "Hola" = 4 chars × 8px = 32px; maxW = 200px → cabe en una línea
      expect(wrapText(ctx, 'Hola', 0, 0, 200, 20, 3)).toBe(1)
    })

    it('llama a fillText una sola vez', () => {
      wrapText(ctx, 'Hola', 0, 0, 200, 20, 3)
      expect(ctx.fillText).toHaveBeenCalledTimes(1)
    })

    it('fillText recibe el texto exacto y coordenadas correctas', () => {
      wrapText(ctx, 'Hola', 10, 20, 200, 25, 3)
      expect(ctx.fillText).toHaveBeenCalledWith('Hola', 10, 20)
    })

    it('tres palabras que caben juntas → 1 línea', () => {
      // "uno dos tres" = 13 chars × 8 = 104px; maxW = 200 → cabe en una línea
      expect(wrapText(ctx, 'uno dos tres', 0, 0, 200, 20, 5)).toBe(1)
    })
  })

  // ── Múltiples líneas ──────────────────────────────────────
  describe('texto que requiere salto de línea', () => {
    it('dos palabras donde la segunda no cabe → 2 líneas', () => {
      // maxW = 40px → solo caben 5 chars (5×8=40) por línea
      // "uno" (3×8=24) cabe. "uno dos " = 8×8=64 > 40 → salto
      const lines = wrapText(ctx, 'uno dos', 0, 0, 40, 20, 5)
      expect(lines).toBe(2)
    })

    it('llama a fillText el mismo número de veces que líneas', () => {
      wrapText(ctx, 'uno dos tres cuatro', 0, 0, 40, 20, 10)
      const calls = ctx.fillText.mock.calls.length
      // Verificamos que al menos llamó 2+ veces (hubo saltos)
      expect(calls).toBeGreaterThanOrEqual(2)
    })

    it('la segunda línea tiene un offset vertical igual a lineH', () => {
      // "uno" cabe; "dos" → segunda línea en y + lineH
      wrapText(ctx, 'uno dos', 0, 50, 40, 20, 5)
      const calls = ctx.fillText.mock.calls
      expect(calls[0][2]).toBe(50)        // primera línea: y = 50
      expect(calls[1][2]).toBe(50 + 20)   // segunda línea: y = 70
    })
  })

  // ── Truncado con ellipsis ─────────────────────────────────
  describe('truncado con "…" al superar maxLines', () => {
    it('trunca y añade "…" cuando el texto supera maxLines', () => {
      // maxW=40 → cada palabra ocupa su propia línea; maxLines=2
      wrapText(ctx, 'uno dos tres cuatro', 0, 0, 40, 20, 2)
      const texts = ctx.fillText.mock.calls.map(c => c[0])
      // La última llamada antes de retornar debe terminar en '…'
      expect(texts.some(t => t.endsWith('…'))).toBe(true)
    })

    it('devuelve exactamente maxLines cuando hay truncado', () => {
      const result = wrapText(ctx, 'uno dos tres cuatro cinco', 0, 0, 40, 20, 2)
      expect(result).toBe(2)
    })

    it('no añade "…" si el texto cabe exactamente en maxLines líneas', () => {
      // "uno" en línea 1, "dos" en línea 2 → cabe justo, sin truncar
      wrapText(ctx, 'uno dos', 0, 0, 40, 20, 2)
      const texts = ctx.fillText.mock.calls.map(c => c[0])
      expect(texts.some(t => t.endsWith('…'))).toBe(false)
    })
  })

  // ── Casos de borde ────────────────────────────────────────
  describe('casos de borde', () => {
    it('maxLines = 1 → solo dibuja la primera línea', () => {
      wrapText(ctx, 'palabra1 palabra2 palabra3', 0, 0, 40, 20, 1)
      expect(ctx.fillText).toHaveBeenCalledTimes(1)
    })

    it('una única palabra más larga que maxW → igual devuelve 1 (no rompe palabras)', () => {
      // "superlargapalabra" = 18 chars × 8 = 144px > 40px, pero es la primera (i=0)
      // La condición require i > 0 para hacer salto, así que NO hace salto
      const result = wrapText(ctx, 'superlargapalabra', 0, 0, 40, 20, 5)
      expect(result).toBe(1)
    })
  })
})
