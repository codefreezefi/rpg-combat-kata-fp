/* globals expect, it, test, describe */

const { getCharacterHealth, getCharacterLevel, isCharacterDead, isCharacterAlive, dealDamage, healCharacter } = require('./src/api')
const createCharacter = require('./src/createCharacter')

describe('Character', () => {
  it('has health, starting at 1000', () => {
    const char = createCharacter.default()
    expect(
      getCharacterHealth(char)
    ).toEqual(1000)
  })
  it('has a level, starting at 1', () => {
    const char = createCharacter.default()
    expect(
      getCharacterLevel(char)
    ).toEqual(1)
  })
  describe('can be', () => {
    test('dead', () => {
      const char = createCharacter.dead()
      expect(
        isCharacterDead(char)
      ).toEqual(true)
      expect(
        isCharacterAlive(char)
      ).toEqual(false)
    })
    test('or alive', () => {
      const char = createCharacter.default()
      expect(
        isCharacterAlive(char)
      ).toEqual(true)
      expect(
        isCharacterDead(char)
      ).toEqual(false)
    })
  })
  describe('damage', () => {
    it('can deal damage', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.default()
      const damagedEnemy = dealDamage(char, enemy)
      expect(getCharacterHealth(damagedEnemy)).toBeLessThan(getCharacterHealth(enemy))
    })
    test('health becomes 0 if damage is greater than health', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = dealDamage(char, enemy)
      const deaderEnemy = dealDamage(char, deadEnemy)
      expect(getCharacterHealth(deadEnemy)).toEqual(0)
      expect(getCharacterHealth(deaderEnemy)).toEqual(0)
    })
    it('dies when health is 0', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = dealDamage(char, enemy)
      expect(isCharacterDead(deadEnemy)).toEqual(true)
    })
  })

  describe('healing', () => {
    it('can heal', () => {
      const char = createCharacter.withHealth(900)
      expect(getCharacterHealth(char)).toEqual(900)
      const healed = healCharacter(char, 100)
      expect(getCharacterHealth(healed)).toEqual(1000)
    })

    it('cannot be healed if it is dead', () => {
      const deadChar = createCharacter.dead()
      const stillDead = healCharacter(deadChar, 1)
      expect(isCharacterDead(stillDead)).toEqual(true)
    })

    it('cannot be healed over 1000', () => {
      const char = createCharacter.default()
      expect(getCharacterHealth(char)).toEqual(1000)
      const healed = healCharacter(char, 1)
      expect(getCharacterHealth(healed)).toEqual(1000)

      const char2 = createCharacter.withHealth(999)
      expect(getCharacterHealth(healCharacter(char2, 100))).toEqual(1000)
    })
  })
})
