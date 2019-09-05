const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH
} = require('./core')
const S = require('sanctuary')

// -- Internal Helpers --

const getCharacterProp = prop => char => S.prop(prop)(char)

const isFullHealth = health => health === DEFAULT_AND_MAX_CHARACTER_HEALTH

/**
 * @param char Object
 * @returns boolean
 */
const isHealed = S.pipe([
  getCharacterProp('health'),
  isFullHealth
])

const calculateNewHealth = characterHealth => damage => Math.min(DEFAULT_AND_MAX_CHARACTER_HEALTH, Math.max(characterHealth - damage, 0))

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

/**
 * @param attacker
 * @param attacked
 * @returns damaged attacker
 */
const dealDamage = (attacker, attacked) => S.pipe([
  () => 1,
  calculateNewHealth(getCharacterHealth(attacked)),
  newHealth => ({
    ...attacked,
    health: newHealth
  })
])(attacked)

/**
 * @param character object
 * @returns character object
 */
const healCharacter = character => S.pipe([
  character => isCharacterAlive(character) && !isHealed(character),
  isHealable => isHealable ? S.Just(character) : S.Nothing,
  S.map(character => calculateNewHealth(getCharacterHealth(character))(-1)),
  maybeHealth => S.map(newHealth => ({
    ...character,
    health: newHealth
  }))(maybeHealth),
  maybeHealedCharacter => S.fromMaybe(character)(maybeHealedCharacter)
])(character)

module.exports = {
  getCharacterLevel,
  getCharacterHealth,
  isCharacterDead,
  isCharacterAlive,
  dealDamage,
  healCharacter
}
