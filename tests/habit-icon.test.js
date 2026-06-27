import { describe, it, expect } from 'vitest'
import { getHabitIcon } from '../src/logic.js'

describe('getHabitIcon', () => {

  // ── Icono "star" ──────────────────────────────────────────
  describe('icono star (lectura)', () => {
    it('"leer" → star', () => {
      expect(getHabitIcon('leer')).toBe('star')
    })

    it('"libro" → star', () => {
      expect(getHabitIcon('libro')).toBe('star')
    })

    it('"leer 30 minutos" → star (keyword en frase)', () => {
      expect(getHabitIcon('leer 30 minutos')).toBe('star')
    })

    it('"mi libro favorito" → star (keyword en frase)', () => {
      expect(getHabitIcon('mi libro favorito')).toBe('star')
    })
  })

  // ── Icono "moon" ──────────────────────────────────────────
  describe('icono moon (meditación / yoga)', () => {
    it('"meditar" → moon', () => {
      expect(getHabitIcon('meditar')).toBe('moon')
    })

    it('"yoga" → moon', () => {
      expect(getHabitIcon('yoga')).toBe('moon')
    })

    it('"meditación" (con tilde) → moon', () => {
      expect(getHabitIcon('meditación')).toBe('moon')
    })

    it('"Meditación diaria" → moon', () => {
      expect(getHabitIcon('Meditación diaria')).toBe('moon')
    })

    it('"meditacion" (sin tilde) → moon (keyword normalizado también matchea)', () => {
      expect(getHabitIcon('meditacion')).toBe('moon')
    })
  })

  // ── Icono "circle" ────────────────────────────────────────
  describe('icono circle (ejercicio / deporte)', () => {
    it('"correr" → circle', () => {
      expect(getHabitIcon('correr')).toBe('circle')
    })

    it('"deporte" → circle', () => {
      expect(getHabitIcon('deporte')).toBe('circle')
    })

    it('"ejercicio" → circle', () => {
      expect(getHabitIcon('ejercicio')).toBe('circle')
    })

    it('"correr 5km diarios" → circle', () => {
      expect(getHabitIcon('correr 5km diarios')).toBe('circle')
    })
  })

  // ── Icono "diamond" ───────────────────────────────────────
  describe('icono diamond (escritura / journaling)', () => {
    it('"escribir" → diamond', () => {
      expect(getHabitIcon('escribir')).toBe('diamond')
    })

    it('"journal" → diamond', () => {
      expect(getHabitIcon('journal')).toBe('diamond')
    })

    it('"journaling diario" → diamond', () => {
      expect(getHabitIcon('journaling diario')).toBe('diamond')
    })

    it('"escribir en mi diario" → diamond', () => {
      expect(getHabitIcon('escribir en mi diario')).toBe('diamond')
    })
  })

  // ── Icono default "leaf" ───────────────────────────────────
  describe('icono leaf (hábito no reconocido → default)', () => {
    it('hábito desconocido → leaf', () => {
      expect(getHabitIcon('cocinar')).toBe('leaf')
    })

    it('cadena vacía → leaf', () => {
      expect(getHabitIcon('')).toBe('leaf')
    })

    it('null → leaf', () => {
      expect(getHabitIcon(null)).toBe('leaf')
    })

    it('undefined → leaf', () => {
      expect(getHabitIcon(undefined)).toBe('leaf')
    })
  })

  // ── Insensibilidad a mayúsculas ───────────────────────────
  describe('insensibilidad a mayúsculas', () => {
    it('"LEER" → star', () => {
      expect(getHabitIcon('LEER')).toBe('star')
    })

    it('"Yoga" → moon', () => {
      expect(getHabitIcon('Yoga')).toBe('moon')
    })

    it('"CORRER" → circle', () => {
      expect(getHabitIcon('CORRER')).toBe('circle')
    })

    it('"Escribir" → diamond', () => {
      expect(getHabitIcon('Escribir')).toBe('diamond')
    })
  })
})
