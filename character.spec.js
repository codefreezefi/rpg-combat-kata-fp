/* globals expect, it, test, describe */

const S = require('sanctuary')

const createCharacter = () => ({
  health: 1000,
  level: 1
})

const createDeadCharacter = () => ({
  ...createCharacter(),
  health: 0
})

const getCharacterProp = prop => char => S.prop(prop)(char)

const getCharacterHealth = getCharacterProp('health')

const getCharacterLevel = getCharacterProp('level')

const isHealthy = health => health > 0

const isAlive = char =>
  S.map(
    isHealthy
  )(
    getCharacterProp('health')
  )(char)

const isDead = char => !isAlive(char)

describe('Character', () => {
  it('has health, starting at 1000', () => {
    const char = createCharacter()
    expect(
      getCharacterHealth(char)
    ).toEqual(1000)
  })
  it('has a level, starting at 1', () => {
    const char = createCharacter()
    expect(
      getCharacterLevel(char)
    ).toEqual(1)
  })
  describe('can be', () => {
    test('dead', () => {
      const char = createDeadCharacter()
      expect(
        isDead(char)
      ).toEqual(true)
      expect(
        isAlive(char)
      ).toEqual(false)
    })
    test('or alive', () => {
      const char = createCharacter()
      expect(
        isAlive(char)
      ).toEqual(true)
      expect(
        isDead(char)
      ).toEqual(false)
    })
  })
  it.todo('can deal damage')
  it.todo('can heal')
  test.todo('health becomes 0 if damage is greater than health')
  it.todo('dies when health is 0')
  it.todo('cannot be healed if it is dead')
  it.todo('cannot be healed over 1000')
})
