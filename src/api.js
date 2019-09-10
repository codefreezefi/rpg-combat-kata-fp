const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH,
  MELEE_FIGHTER,
  RANGED_FIGHTER
} = require('./core')
const S = require('sanctuary')
const $ = require('sanctuary-def')

// -- Internal Helpers --

const isClass = className => char => S.prop('class')(char) === className

const inList = list => item => S.pipe([
  S.find(S.equals(item)),
  S.ifElse(S.isJust)(() => true)(() => false)
])(list)

const getFactions = char => S.fromEither([])(S.pipeK([
  character => S.maybeToEither('Character cannot belong to factions')(S.get(S.is($.StrMap($.Boolean)))('factions')(character)),
  factions => S.Right(S.keys(factions))
])(S.Right(char)))

const isAlly = char1 => char2 => {
  const char1Factions = getFactions(char1)
  const char2Factions = getFactions(char2)
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
const canAttack = S.pipe([
  S.prop('canAttack'),
  S.equals(true)
])

/**
 * @param char Object
 * @returns boolean
 */
const canBeHealed = S.pipe([
  S.prop('canBeHealed'),
  S.equals(true)
])

// -- PUBLIC API --

// Queries

/**
 * @param char
 * @return int
 */
const getHealth = S.prop('health')

/**
 * @param char
 * @return int
 */
const getLevel = S.prop('level')

/**
 * @param char
 * @return boolean
 */
const isDead = char => !isAlive(char)

/**
 * @param char
 * @return boolean
 */
const isAlive = S.pipe([
  S.prop('health'),
  S.gt(0)
])

const update = u => o => ({
  ...o,
  ...u
})

// Commands

/**
 * @param attacker object
 * @param attacked object
 * @param damage integer
 * @param distance integer
 * @returns object
 */
const attack = ({ attacker, attacked, damage, distance }) => S.fromEither(attacked)(S.pipeK([
  () => !canAttack(attacker) ? S.Left('Attacker cannot attack') : S.Right(attacked),
  attacked => attacker === attacked ? S.Left('Character cannot attack self') : S.Right(attacked),
  () => S.Right(S.sub(getLevel(attacker))(getLevel(attacked))),
  levelDiff => S.Right(S.pipe([
    mod => S.ifElse(() => levelDiff >= 5)(() => mod * 0.5)(() => mod)(mod),
    mod => S.ifElse(() => levelDiff <= -5)(() => mod * 1.5)(() => mod)(mod),
    mod => S.ifElse(() => isMeleeFighter(attacker) && distance > 2)(() => 0)(() => mod)(mod),
    mod => S.ifElse(() => isRangedFighter(attacker) && distance > 20)(() => 0)(() => mod)(mod),
    mod => S.ifElse(() => isAlly(attacker)(attacked))(() => 0)(() => mod)(mod)
  ])(1)),
  damageModifier => S.Right((damage || 1) * damageModifier),
  realDamage => S.Right(S.pipe([
    getHealth,
    S.sub(realDamage),
    S.max(0)
  ])(attacked)),
  newHealth => S.Right(update({ health: newHealth })(attacked))
])(S.Right(attacked)))

/**
 * @param character object
 * @param healer object
 * @returns character object
 */
const heal = ({ character, healer }) => S.fromEither(character)(S.pipeK([
  character => !canBeHealed(character) ? S.Left('Character cannot be healed') : S.Right(character),
  character => (healer || character) === character || isAlly(character)(healer) ? S.Right(character) : S.Left('Character can only heal self or allies'),
  S.ifElse(() => S.and(isAlive(character))(S.pipe([
    S.prop('health'),
    S.lt(DEFAULT_AND_MAX_CHARACTER_HEALTH)
  ])(character)))(S.Right)(() => S.Left('Character cannot be healed')),
  character => S.Right(S.pipe([
    getHealth,
    S.add(1)
  ])(character)),
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
const isInFaction = (character, faction) => S.fromEither(false)(S.pipeK([
  character => S.Right(getFactions(character)),
  factionNames => S.ifElse(() => S.isNothing(S.find(S.equals(faction))(factionNames)))(() => S.Left('Not in faction'))(() => S.Right(true))(factionNames)
])(S.Right(character)))

module.exports = {
  getLevel,
  getHealth,
  isDead,
  isAlive,
  attack,
  heal,
  joinFaction,
  isInFaction,
  leaveFaction
}
