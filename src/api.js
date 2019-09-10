const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH,
  MELEE_FIGHTER,
  RANGED_FIGHTER
} = require('./core')
const S = require('sanctuary')
const $ = require('sanctuary-def')

// -- Internal Helpers --

const isClass = className => S.pipe([
  S.prop('class'),
  S.equals(className)
])

const inList = list => item => S.pipe([
  S.find(S.equals(item)),
  S.isJust
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
  S.ifElse(() => S.pipe([
    S.prop('canAttack'),
    S.equals(false)
  ])(attacker))(() => S.Left('Attacker cannot attack'))(S.Right),
  S.ifElse(() => attacker === attacked)(() => S.Left('Character cannot attack self'))(S.Right),
  S.map(S.Right)(S.pipe([
    getLevel,
    S.sub(getLevel(attacker))
  ])),
  levelDiff => S.map(S.Right)(S.pipe([
    S.ifElse(() => S.gte(5)(levelDiff))(S.mult(0.5))(S.mult(1)),
    S.ifElse(() => S.lte(-5)(levelDiff))(S.mult(1.5))(S.mult(1)),
    S.ifElse(() => S.and(isMeleeFighter(attacker))(S.gt(2)(distance || 1)))(S.mult(0))(S.mult(1)),
    S.ifElse(() => S.and(isRangedFighter(attacker))(S.gt(20)(distance || 1)))(S.mult(0))(S.mult(1)),
    S.ifElse(() => isAlly(attacker)(attacked))(S.mult(0))(S.mult(1))
  ]))(1),
  S.map(S.Right)(S.mult(damage || 1)),
  realDamage => S.Right(S.pipe([
    getHealth,
    S.sub(realDamage),
    S.max(0)
  ])(attacked)),
  S.map(S.Right)(newHealth => update({ health: newHealth })(attacked))
])(S.Right(attacked)))

/**
 * @param character object
 * @param healer object
 * @returns character object
 */
const heal = ({ character, healer }) => S.fromEither(character)(S.pipeK([
  S.ifElse(S.pipe([
    S.prop('canBeHealed'),
    S.equals(false)
  ]))(() => S.Left('Character cannot be healed'))(S.Right),
  S.ifElse(() => S.or((healer || character) === character)(isAlly(character)(healer)))(
    S.Right
  )(() => S.Left('Character can only heal self or allies')),
  S.ifElse(() => S.and(isAlive(character))(S.pipe([
    S.prop('health'),
    S.lt(DEFAULT_AND_MAX_CHARACTER_HEALTH)
  ])(character)))(S.Right)(() => S.Left('Character cannot be healed')),
  character => S.Right(S.pipe([
    getHealth,
    S.add(1)
  ])(character)),
  S.map(S.Right)(newHealth => update({ health: newHealth })(character))
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
