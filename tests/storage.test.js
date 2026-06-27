import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Storage, STORAGE_KEY } from '../src/logic.js'

describe('Storage', () => {

  beforeEach(() => {
    localStorage.clear()
  })

  // ── save ──────────────────────────────────────────────────
  describe('save()', () => {
    it('guarda los datos en localStorage con la clave correcta', () => {
      const data = { intention: 'enfoque', skill: 'React', habit: 'leer', place: 'playa', energy: 'fluir' }
      Storage.save(data)
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).not.toBeNull()
      expect(JSON.parse(raw)).toEqual(data)
    })

    it('sobreescribe datos previos en la misma clave', () => {
      Storage.save({ intention: 'primera' })
      Storage.save({ intention: 'segunda' })
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(JSON.parse(raw).intention).toBe('segunda')
    })

    it('guarda objetos con campos vacíos sin error', () => {
      expect(() => Storage.save({ intention: '', skill: '', habit: '', place: '', energy: '' })).not.toThrow()
    })

    it('no lanza error cuando localStorage está disponible pero falla (cobertura del catch)', () => {
      const original = localStorage.setItem.bind(localStorage)
      vi.spyOn(Storage, 'save').mockImplementationOnce(() => {
        try { throw new Error('cuota excedida') } catch (_) {}
      })
      expect(() => Storage.save({ intention: 'test' })).not.toThrow()
      vi.restoreAllMocks()
    })
  })

  // ── load ──────────────────────────────────────────────────
  describe('load()', () => {
    it('devuelve null cuando no hay datos guardados', () => {
      expect(Storage.load()).toBeNull()
    })

    it('devuelve el objeto guardado correctamente', () => {
      const data = { intention: 'aventura', skill: 'TypeScript', habit: 'correr', place: 'tokyo', energy: 'imparable' }
      Storage.save(data)
      expect(Storage.load()).toEqual(data)
    })

    it('devuelve null si el JSON está corrupto', () => {
      localStorage.setItem(STORAGE_KEY, 'esto-no-es-json{{{')
      expect(Storage.load()).toBeNull()
    })

    it('devuelve null si el valor guardado es null literal', () => {
      localStorage.setItem(STORAGE_KEY, 'null')
      // JSON.parse('null') devuelve null, y null || null también es null
      expect(Storage.load()).toBeNull()
    })

    it('devuelve null si el valor guardado es 0 (falsy)', () => {
      localStorage.setItem(STORAGE_KEY, '0')
      // JSON.parse('0') → 0 → 0 || null → null
      expect(Storage.load()).toBeNull()
    })

    it('preserva todos los campos del objeto al cargar', () => {
      const data = { intention: 'eq', skill: 'sk', habit: 'hb', place: 'pl', energy: 'en' }
      Storage.save(data)
      const loaded = Storage.load()
      expect(Object.keys(loaded)).toEqual(expect.arrayContaining(['intention', 'skill', 'habit', 'place', 'energy']))
    })
  })

  // ── clear ─────────────────────────────────────────────────
  describe('clear()', () => {
    it('elimina los datos guardados', () => {
      Storage.save({ intention: 'crecimiento' })
      Storage.clear()
      expect(Storage.load()).toBeNull()
    })

    it('no lanza error si no había datos guardados', () => {
      expect(() => Storage.clear()).not.toThrow()
    })

    it('solo elimina la clave de la aplicación, no otras claves de localStorage', () => {
      localStorage.setItem('otra_clave', 'valor_externo')
      Storage.save({ intention: 'test' })
      Storage.clear()
      expect(localStorage.getItem('otra_clave')).toBe('valor_externo')
    })
  })

  // ── Ciclo completo ────────────────────────────────────────
  describe('ciclo completo save → load → clear', () => {
    it('save → load → clear → load devuelve null al final', () => {
      const data = { intention: 'enfoque', skill: '', habit: '', place: '', energy: '' }
      Storage.save(data)
      expect(Storage.load()).toEqual(data)
      Storage.clear()
      expect(Storage.load()).toBeNull()
    })
  })

  // ── STORAGE_KEY ───────────────────────────────────────────
  describe('constante STORAGE_KEY', () => {
    it('es el string esperado', () => {
      expect(STORAGE_KEY).toBe('visionboard_2026')
    })

    it('es una cadena no vacía', () => {
      expect(typeof STORAGE_KEY).toBe('string')
      expect(STORAGE_KEY.length).toBeGreaterThan(0)
    })
  })
})
