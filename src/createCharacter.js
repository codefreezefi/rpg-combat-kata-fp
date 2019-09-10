const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH,
  START_LEVEL,
  classes
} = require('./core')

const createCharacter = () => ({
  health: DEFAULT_AND_MAX_CHARACTER_HEALTH,
  level: START_LEVEL,
  class: classes[Math.round(Math.random() * (classes.length - 1))],
  factions: {},
  canAttack: true,
  canBeHealed: true
})

const createDeadCharacter = () => creatCharacterWithHealth(0)
const creatCharacterWithHealth = health => ({
  ...createCharacter(),
  health: Math.min(DEFAULT_AND_MAX_CHARACTER_HEALTH, health)
})

const creatCharacterWithLevel = level => ({
  ...createCharacter(),
  level
})

const creatCharacterWithClass = className => ({
  ...createCharacter(),
  class: className
})

module.exports = {
  default: createCharacter,
  dead: createDeadCharacter,
  withHealth: creatCharacterWithHealth,
  withLevel: creatCharacterWithLevel,
  withClass: creatCharacterWithClass
}
