/* globals expect, it, test, describe */

const S = require('sanctuary')

const createCharacter = () => ({
  health: 1000,
  level: 1
})

const createDeadCharacter = () => creatCharacterWithHealth(0)

const creatCharacterWithHealth = health => ({
  ...createCharacter(),
  health
})

const getCharacterProp = prop => char => S.prop(prop)(char)

const getCharacterHealth = getCharacterProp('health')

const getCharacterLevel = getCharacterProp('level')

const isAlive = health => health > 0
const isFullHealth = health => health === 1000

const isCharacterAlive = char =>
  S.pipe([
    getCharacterProp('health'),
    isAlive
  ])(char)

const isHealed = char =>
  S.pipe([
    getCharacterProp('health'),
    isFullHealth
  ])(char)

const isCharacterDead = char => !isCharacterAlive(char)

const damageOfAttack = character => enemy => 1

const applyDamage = (character) => damage => ({
  ...character,
  health: calculateNewHealth(damage, getCharacterHealth(character))
})

const calculateNewHealth = (damage, characterHealth) => Math.min(1000, Math.max(characterHealth - damage, 0))

const isHealable = character => S.ifElse(
  () => S.and(isCharacterAlive(character))(!isHealed(character))
)(
  character => S.Just(character)
)(() => S.Nothing)(character)

const dealDamage = (attacker, attacked) => S.pipe([
  damageOfAttack(attacker),
  applyDamage(attacked)
])(attacked)

const healCharacter = (character, amount) => S.pipe([
  isHealable,
  S.map(() => -amount),
  S.lift2(applyDamage)(S.Just(character)),
  S.fromMaybe(character)
])(character)

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
  describe('damage', () => {
    it('can deal damage', () => {
      const char = createCharacter()
      const enemy = createCharacter()
      const damagedEnemy = dealDamage(char, enemy)
      expect(getCharacterHealth(damagedEnemy)).toBeLessThan(getCharacterHealth(enemy))
    })
    test('health becomes 0 if damage is greater than health', () => {
      const char = createCharacter()
      const enemy = creatCharacterWithHealth(1)
      const deadEnemy = dealDamage(char, enemy)
      const deaderEnemy = dealDamage(char, deadEnemy)
      expect(getCharacterHealth(deadEnemy)).toEqual(0)
      expect(getCharacterHealth(deaderEnemy)).toEqual(0)
    })
    it('dies when health is 0', () => {
      const char = createCharacter()
      const enemy = creatCharacterWithHealth(1)
      const deadEnemy = dealDamage(char, enemy)
      expect(isCharacterDead(deadEnemy)).toEqual(true)
    })
  })

  describe('healing', () => {
    it('can heal', () => {
      const char = creatCharacterWithHealth(900)
      expect(getCharacterHealth(char)).toEqual(900)
      const healed = healCharacter(char, 100)
      expect(getCharacterHealth(healed)).toEqual(1000)
    })

    it('cannot be healed if it is dead', () => {
      const deadChar = createDeadCharacter()
      const stillDead = healCharacter(deadChar, 1)
      expect(isCharacterDead(stillDead)).toEqual(true)
    })

    it('cannot be healed over 1000', () => {
      const char = createCharacter()
      expect(getCharacterHealth(char)).toEqual(1000)
      const healed = healCharacter(char, 1)
      expect(getCharacterHealth(healed)).toEqual(1000)

      const char2 = creatCharacterWithHealth(999)
      expect(getCharacterHealth(healCharacter(char2, 100))).toEqual(1000)
    })
  })
})
