const {
  DEFAULT_PROP_HEALTH,
  START_LEVEL
} = require('./core')

const createProp = () => ({
  health: DEFAULT_PROP_HEALTH,
  level: START_LEVEL,
  canAttack: false,
  canBeHealed: false
})

const createDestroyedProp = () => creatPropWithHealth(0)
const creatPropWithHealth = health => ({
  ...createProp(),
  health
})

module.exports = {
  default: createProp,
  destroyed: createDestroyedProp,
  withHealth: creatPropWithHealth
}
