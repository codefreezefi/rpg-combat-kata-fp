const {
  DEFAULT_AND_MAX_CHARACTER_HEALTH,
  START_LEVEL
} = require('./core')

const createCharacter = () => ({
  health: DEFAULT_AND_MAX_CHARACTER_HEALTH,
  level: START_LEVEL
})

const createDeadCharacter = () => creatCharacterWithHealth(0)
const creatCharacterWithHealth = health => ({
  ...createCharacter(),
  health
})

const creatCharacterWithLevel = level => ({
  ...createCharacter(),
  level
})

module.exports = {
  default: createCharacter,
  dead: createDeadCharacter,
  withHealth: creatCharacterWithHealth,
  withLevel: creatCharacterWithLevel
}
