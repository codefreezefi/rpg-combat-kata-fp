const {
  DEFAULT_AND_MAX_PROP_HEALTH
} = require('./core')

const createProp = () => ({
  health: DEFAULT_AND_MAX_PROP_HEALTH,
  canAttack: false
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
