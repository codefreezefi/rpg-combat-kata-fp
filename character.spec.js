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

const isAlive = health => health > 0

const isCharacterAlive = char =>
  S.pipe([
    getCharacterProp('health'),
    isAlive
  ])(char)

const isCharacterDead = char => !isCharacterAlive(char)

const damageOfAttack = character => enemy => 1

const applyDamage = character => damage => ({
  ...character,
  health: Math.max(getCharacterHealth(character) - damage, 0)
})

const dealDamage = (attacker, attacked) => S.pipe([
  damageOfAttack(attacker),
  applyDamage(attacked)
])(attacked)

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
        isCharacterDead(char)
      ).toEqual(true)
      expect(
        isCharacterAlive(char)
      ).toEqual(false)
    })
    test('or alive', () => {
      const char = createCharacter()
      expect(
        isCharacterAlive(char)
      ).toEqual(true)
      expect(
        isCharacterDead(char)
      ).toEqual(false)
    })
  })
  it('can deal damage', () => {
    const char = createCharacter()
    const enemy = createCharacter()
    const damagedEnemy = dealDamage(char, enemy)
    expect(getCharacterHealth(damagedEnemy)).toBeLessThan(getCharacterHealth(enemy))
  })
  it.todo('can heal')
  test.todo('health becomes 0 if damage is greater than health')
  it.todo('dies when health is 0')
  it.todo('cannot be healed if it is dead')
  it.todo('cannot be healed over 1000')
})
