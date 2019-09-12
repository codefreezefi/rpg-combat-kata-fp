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

const eitherFactions = S.map(S.maybeToEither('Character cannot belong to factions'))(S.get(S.is($.StrMap($.Boolean)))('factions'))

const getFactions = char => S.fromEither([])(S.pipeK([
  eitherFactions,
  S.map(S.Right)(S.keys)
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

// Attacking helpers

const canBeAttackedBy = attacker => S.ifElse(() => S.pipe([
  S.prop('canAttack'),
  S.equals(false)
])(attacker))(() => S.Left('Attacker cannot attack'))(S.Right)

const isNotAttackingSelf = attacker => S.ifElse(attacked => attacker === attacked)(() => S.Left('Character cannot attack self'))(S.Right)

const getLevelDiff = attacker => S.map(S.Right)(S.pipe([
  getLevel,
  S.sub(getLevel(attacker))
]))

const modifyIf = modify => cond => S.ifElse(cond)(modify)(S.mult(1))
const zeroIf = cond => modifyIf(S.mult(0))(cond)

const inRange = range => S.pipe([
  S.lte(range)
])

// Sanctuary API wrappers

const pipeKorElse = elseReturn => chainable => subject => S.fromEither(elseReturn)(S.pipeK(chainable)(S.Right(subject)))

const mapRight = S.map(S.Right)

const pipeRight = pipeAble => subject => mapRight(S.pipe(pipeAble))(subject)

// Commands

/**
 * @param attacker object
 * @param attacked object
 * @param damage integer
 * @param distance integer
 * @param damageModifier float
 * @returns object
 */
const attack = ({ attacker, attacked, damage, distance, damageModifier }) => pipeKorElse(attacker)([
  canBeAttackedBy(attacker),
  isNotAttackingSelf(attacker),
  getLevelDiff(attacker),
  levelDiff => pipeRight([
    modifyIf(S.mult(0.5))(() => S.gte(5)(levelDiff)),
    modifyIf(S.mult(1.5))(() => S.lte(-5)(levelDiff)),
    zeroIf(() => S.and(isMeleeFighter(attacker))(!inRange(2)(distance || 1))),
    zeroIf(() => S.and(isRangedFighter(attacker))(!inRange(20)(distance || 1))),
    zeroIf(() => isAlly(attacker)(attacked))
  ])(damageModifier || 1),
  mapRight(S.mult(damage || 1)),
  realDamage => pipeRight([
    getHealth,
    S.sub(realDamage),
    S.max(0)
  ])(attacked),
  mapRight(newHealth => update({ health: newHealth })(attacked))
])(attacked)

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
  S.map(S.Right)(S.pipe([
    getHealth,
    S.add(1)
  ])),
  S.map(S.Right)(newHealth => update({ health: newHealth })(character))
])(S.Right(character)))

/**
 * @param character object
 * @param faction string
 * @returns object
 */
const joinFaction = (character, faction) => S.fromEither(character)(S.pipeK([
  eitherFactions,
  S.map(S.Right)(S.insert(faction)(true)),
  S.map(S.Right)(newFactions => update({ factions: newFactions })(character))
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
  S.map(S.Right)(getFactions),
  S.ifElse(factionNames => S.isNothing(S.find(S.equals(faction))(factionNames)))(() => S.Left('Not in faction'))(() => S.Right(true))
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
