const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH
} = require('./core')
const S = require('sanctuary')

// -- Internal Helpers --

const getCharacterProp = prop => char => S.prop(prop)(char)

const isFullHealth = health => health === DEFAULT_AND_MAX_CHARACTER_HEALTH

const isHealed = char =>
  S.pipe([
    getCharacterProp('health'),
    isFullHealth
  ])(char)

const isHealable = character => S.ifElse(
  () => S.and(isCharacterAlive(character))(!isHealed(character))
)(
  character => S.Just(character)
)(() => S.Nothing)(character)

const damageOfAttack = character => enemy => 1

const applyDamage = (character) => damage => ({
  ...character,
  health: calculateNewHealth(damage, getCharacterHealth(character))
})

const calculateNewHealth = (damage, characterHealth) => Math.min(DEFAULT_AND_MAX_CHARACTER_HEALTH, Math.max(characterHealth - damage, 0))

// -- PUBLIC API --

// Queries

/**
 * @param char
 * @return int
 */
const getCharacterHealth = getCharacterProp('health')

/**
 * @param char
 * @return int
 */
const getCharacterLevel = getCharacterProp('level')

/**
 * @param char
 * @return boolean
 */
const isCharacterDead = char => !isCharacterAlive(char)

/**
 * @param char
 * @return boolean
 */
const isCharacterAlive = char =>
  S.pipe([
    getCharacterProp('health'),
    health => health > 0
  ])(char)

// Commands

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

module.exports = {
  getCharacterLevel,
  getCharacterHealth,
  isCharacterDead,
  isCharacterAlive,
  dealDamage,
  healCharacter
}
