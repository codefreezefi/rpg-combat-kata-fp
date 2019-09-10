const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH,
  MELEE_FIGHTER,
  RANGED_FIGHTER
} = require('./core')
const S = require('sanctuary')
const $ = require('sanctuary-def')

// -- Internal Helpers --

const getCharacterProp = prop => char => S.prop(prop)(char)

const isFullHealth = health => health === DEFAULT_AND_MAX_CHARACTER_HEALTH

const isClass = className => char => S.prop('class')(char) === className

const inList = list => item => S.pipe([
  S.find(S.equals(item)),
  S.ifElse(S.isJust)(() => true)(() => false)
])(list)

const getCharacterFactions = char => S.fromEither([])(S.pipeK([
  character => S.maybeToEither('Character cannot belong to factions')(S.get(S.is($.StrMap($.Boolean)))('factions')(character)),
  factions => S.Right(S.keys(factions))
])(S.Right(char)))

const isAlly = char1 => char2 => {
  const char1Factions = getCharacterFactions(char1)
  const char2Factions = getCharacterFactions(char2)
  return S.pipe([
    S.any(inList(char2Factions))
  ])(char1Factions)
}

const isMeleeFighter = isClass(MELEE_FIGHTER)
const isRangedFighter = isClass(RANGED_FIGHTER)

/**
 * @param char Object
 * @returns boolean
 */
const isHealed = S.pipe([
  getCharacterProp('health'),
  isFullHealth
])

/**
 * @param char Object
 * @returns boolean
 */
const canAttack = S.pipe([
  getCharacterProp('canAttack'),
  S.equals(true)
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

const update = u => o => ({
  ...o,
  ...u
})

// Commands

/**
 * @param args object
 * @returns damaged attacker
 */
const dealDamage = ({ attacker, attacked, damage, distance }) => S.fromEither(attacked)(S.pipeK([
  () => !canAttack(attacker) ? S.Left('Attacker cannot attack') : S.Right(attacked),
  attacked => attacker === attacked ? S.Left('Character cannot attack self') : S.Right(attacked),
  () => S.Right(S.sub(getCharacterLevel(attacker))(getCharacterLevel(attacked))),
  levelDiff => S.Right(S.pipe([
    mod => S.ifElse(() => levelDiff >= 5)(() => mod * 0.5)(() => mod)(mod),
    mod => S.ifElse(() => levelDiff <= -5)(() => mod * 1.5)(() => mod)(mod),
    mod => S.ifElse(() => isMeleeFighter(attacker) && distance > 2)(() => 0)(() => mod)(mod),
    mod => S.ifElse(() => isRangedFighter(attacker) && distance > 20)(() => 0)(() => mod)(mod),
    mod => S.ifElse(() => isAlly(attacker)(attacked))(() => 0)(() => mod)(mod)
  ])(1)),
  damageModifier => S.Right((damage || 1) * damageModifier),
  realDamage => S.Right(calculateNewHealth(getCharacterHealth(attacked))(realDamage)),
  newHealth => S.Right(update({ health: newHealth })(attacked))
])(S.Right(attacked)))

/**
 * @param character object
 * @param healer object
 * @returns character object
 */
const healCharacter = (character, healer) => S.fromEither(character)(S.pipeK([
  character => (healer || character) === character || isAlly(character)(healer) ? S.Right(character) : S.Left('Character can only heal self or allies'),
  character => isCharacterAlive(character) && !isHealed(character) ? S.Right(character) : S.Left('Character cannot be healed'),
  character => S.Right(calculateNewHealth(getCharacterHealth(character))(-1)),
  newHealth => S.Right(update({ health: newHealth })(character))
])(S.Right(character)))

/**
 * @param character object
 * @param faction string
 * @returns object
 */
const joinFaction = (character, faction) => S.fromEither(character)(S.pipeK([
  character => S.maybeToEither('Character cannot belong to factions')(S.get(S.is($.StrMap($.Boolean)))('factions')(character)),
  factions => S.Right(S.insert(faction)(true)(factions)),
  newFactions => S.Right(update({ factions: newFactions })(character))
])(S.Right(character)))

/**
 * @param character object
 * @param faction string
 * @returns object
 */
const leaveFaction = (character, faction) => S.pipe([
  S.prop('factions'),
  S.remove(faction),
  newFactions => update({ factions: newFactions })(character)
])(character)

/**
 * @param character object
 * @param faction string
 * @returns boolean
 */
const charIsInFaction = (character, faction) => S.fromEither(false)(S.pipeK([
  character => S.maybeToEither('Character cannot belong to factions')(S.get(S.is($.StrMap($.Boolean)))('factions')(character)),
  factions => S.Right(S.keys(factions)),
  factionNames => S.ifElse(() => S.isNothing(S.find(S.equals(faction))(factionNames)))(() => S.Left('Not in faction'))(() => S.Right(true))(factionNames)
])(S.Right(character)))

module.exports = {
  getCharacterLevel,
  getCharacterHealth,
  isCharacterDead,
  isCharacterAlive,
  dealDamage,
  healCharacter,
  joinFaction,
  charIsInFaction,
  leaveFaction
}
