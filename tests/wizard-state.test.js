import { describe, it, expect } from 'vitest'
import { QUESTIONS, createInitialState } from '../src/logic.js'

describe('QUESTIONS (estructura del wizard)', () => {

  it('tiene exactamente 5 preguntas', () => {
    expect(QUESTIONS).toHaveLength(5)
  })

  it('los ids de las preguntas son únicos', () => {
    const ids = QUESTIONS.map(q => q.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(QUESTIONS.length)
  })

  it('los ids siguen el orden esperado: intention, skill, habit, place, energy', () => {
    const ids = QUESTIONS.map(q => q.id)
    expect(ids).toEqual(['intention', 'skill', 'habit', 'place', 'energy'])
  })

  it('cada pregunta tiene las propiedades requeridas', () => {
    QUESTIONS.forEach((q, i) => {
      expect(q, `pregunta ${i + 1}`).toHaveProperty('id')
      expect(q, `pregunta ${i + 1}`).toHaveProperty('icon')
      expect(q, `pregunta ${i + 1}`).toHaveProperty('label')
      expect(q, `pregunta ${i + 1}`).toHaveProperty('prompt')
      expect(q, `pregunta ${i + 1}`).toHaveProperty('hint')
      expect(q, `pregunta ${i + 1}`).toHaveProperty('maxLength')
    })
  })

  it('maxLength es un número positivo en todas las preguntas', () => {
    QUESTIONS.forEach(q => {
      expect(typeof q.maxLength).toBe('number')
      expect(q.maxLength).toBeGreaterThan(0)
    })
  })

  it('ninguna pregunta tiene campos vacíos', () => {
    QUESTIONS.forEach(q => {
      expect(q.id.trim()).not.toBe('')
      expect(q.label.trim()).not.toBe('')
      expect(q.prompt.trim()).not.toBe('')
      expect(q.hint.trim()).not.toBe('')
    })
  })

  it('los prompts terminan con "?"', () => {
    QUESTIONS.forEach(q => {
      expect(q.prompt.trim()).toMatch(/\?$/)
    })
  })
})

describe('createInitialState()', () => {

  it('devuelve step = 0', () => {
    expect(createInitialState().step).toBe(0)
  })

  it('devuelve answers con todos los campos en cadena vacía', () => {
    const { answers } = createInitialState()
    expect(answers).toEqual({
      intention: '',
      skill:     '',
      habit:     '',
      place:     '',
      energy:    '',
    })
  })

  it('cada llamada devuelve un objeto distinto (no comparten referencia)', () => {
    const s1 = createInitialState()
    const s2 = createInitialState()
    s1.answers.intention = 'modificado'
    expect(s2.answers.intention).toBe('')
  })

  it('los ids de QUESTIONS coinciden con las claves de answers', () => {
    const { answers } = createInitialState()
    const answerKeys = Object.keys(answers)
    const questionIds = QUESTIONS.map(q => q.id)
    expect(answerKeys).toEqual(expect.arrayContaining(questionIds))
    expect(questionIds).toEqual(expect.arrayContaining(answerKeys))
  })

  describe('simulación de flujo del wizard', () => {
    it('avanzar el step hasta el límite funciona correctamente', () => {
      const state = createInitialState()
      expect(state.step).toBe(0)

      for (let i = 0; i < QUESTIONS.length - 1; i++) {
        state.step++
      }

      expect(state.step).toBe(QUESTIONS.length - 1)
    })

    it('guardar respuestas en answers mantiene independencia entre campos', () => {
      const state = createInitialState()
      state.answers.intention = 'enfoque'
      state.answers.skill     = 'React'

      expect(state.answers.intention).toBe('enfoque')
      expect(state.answers.skill).toBe('React')
      expect(state.answers.habit).toBe('')
      expect(state.answers.place).toBe('')
      expect(state.answers.energy).toBe('')
    })

    it('todas las respuestas vacías → el board no debería generarse (no hay datos)', () => {
      const { answers } = createInitialState()
      const hasData = Object.values(answers).some(v => v.trim() !== '')
      expect(hasData).toBe(false)
    })

    it('al menos una respuesta rellena → se considera que hay datos para restaurar', () => {
      const state = createInitialState()
      state.answers.intention = 'crecimiento'
      const hasData = Object.values(state.answers).some(v => v.trim() !== '')
      expect(hasData).toBe(true)
    })
  })
})
