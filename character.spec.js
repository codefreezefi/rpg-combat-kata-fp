/* globals expect, it, test, describe */

const S = require('sanctuary')

const createCharacter = () => ({
  health: 1000
})

const getCharacterHealth = (char) => {
  return S.prop('health')(char)
}

describe('Character', () => {
  it('has health, starting at 1000', () => {
    const char = createCharacter()
    expect(
      getCharacterHealth(char)
    ).toEqual(1000)
  })
  it.todo('has a level, starting at 1')
  it.todo('can be dead or alive')
  it.todo('can deal damage')
  it.todo('can heal')
  test.todo('health becomes 0 if damage is greater than health')
  it.todo('dies when health is 0')
  it.todo('cannot be healed if it is dead')
  it.todo('cannot be healed over 1000')
})
