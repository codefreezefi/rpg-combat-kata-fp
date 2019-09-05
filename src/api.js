const getCharacterProp = prop => char => S.prop(prop)(char)

const isAlive = health => health > 0

const isFullHealth = health => health === 1000

const isHealed = char =>
  S.pipe([
    getCharacterProp('health'),
    isFullHealth
  ])(char)

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

const isHealable = character => S.ifElse(
  () => S.and(isCharacterAlive(character))(!isHealed(character))
)(
  character => S.Just(character)
)(() => S.Nothing)(character)

const getCharacterHealth = getCharacterProp('health')

const getCharacterLevel = getCharacterProp('level')

const isCharacterDead = char => !isCharacterAlive(char)

const isCharacterAlive = char =>
  S.pipe([
    getCharacterProp('health'),
    isAlive
  ])(char)

const damageOfAttack = character => enemy => 1

const applyDamage = (character) => damage => ({
  ...character,
  health: calculateNewHealth(damage, getCharacterHealth(character))
})

const calculateNewHealth = (damage, characterHealth) => Math.min(1000, Math.max(characterHealth - damage, 0))

module.exports = {
  createCharacter,
  createDeadCharacter,
  creatCharacterWithHealth,
  getCharacterLevel,
  getCharacterHealth,
  isCharacterDead,
  isCharacterAlive,
  dealDamage,
  healCharacter
}
