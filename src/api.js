const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH
} = require('./core')
const S = require('sanctuary')

// -- Internal Helpers --

const getCharacterProp = prop => char => S.prop(prop)(char)

const isAlive = health => health > 0

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

const getCharacterHealth = getCharacterProp('health')

const getCharacterLevel = getCharacterProp('level')

const isCharacterDead = char => !isCharacterAlive(char)

const isCharacterAlive = char =>
  S.pipe([
    getCharacterProp('health'),
    isAlive
  ])(char)

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
