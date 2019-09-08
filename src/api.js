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
  () => attacker === attacked,
  attackerEqualsAttacked => attackerEqualsAttacked ? S.Nothing : S.Just(attacked),
  S.map(() => 1),
  maybeDamage => S.map(calculateNewHealth(getCharacterHealth(attacked)))(maybeDamage),
  maybeNewHealth => S.map(newHealth => ({
    ...attacked,
    health: newHealth
  }))(maybeNewHealth),
  maybeDamagedAttacked => S.fromMaybe(attacked)(maybeDamagedAttacked)
])(attacked)

const update = u => o => S.Right({
  ...o,
  ...u
})

/**
 * @param character object
 * @param healer object
 * @returns character object
 */
const healCharacter = (character, healer) => S.fromEither(character)(S.pipeK([
  character => (healer || character) === character ? S.Right(character) : S.Left('Character can only heal self'),
  character => isCharacterAlive(character) && !isHealed(character) ? S.Right(character) : S.Left('Character cannot be healed'),
  character => S.Right(calculateNewHealth(getCharacterHealth(character))(-1)),
  newHealth => update({ health: newHealth })(character)
])(S.Right(character)))

module.exports = {
  getCharacterLevel,
  getCharacterHealth,
  isCharacterDead,
  isCharacterAlive,
  dealDamage,
  healCharacter
}
