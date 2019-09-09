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

const update = u => o => S.Right({
  ...o,
  ...u
})

// Commands

/**
 * @param args object
 * @returns damaged attacker
 */
const dealDamage = ({ attacker, attacked, damage, distance }) => S.fromEither(attacked)(S.pipeK([
  attacked => attacker === attacked ? S.Left('Character cannot attack self') : S.Right(attacked),
  () => S.Right(S.sub(getCharacterLevel(attacker))(getCharacterLevel(attacked))),
  levelDiff => S.Right(S.pipe([
    mod => S.ifElse(() => levelDiff >= 5)(() => mod * 0.5)(() => mod)(mod),
    mod => S.ifElse(() => levelDiff <= -5)(() => mod * 1.5)(() => mod)(mod)
  ])(1)),
  damageModifier => S.Right((damage || 1) * damageModifier),
  realDamage => S.Right(calculateNewHealth(getCharacterHealth(attacked))(realDamage)),
  newHealth => update({ health: newHealth })(attacked)
])(S.Right(attacked)))

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
