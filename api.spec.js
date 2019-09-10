/* globals expect, it, test, describe */

const { getHealth, getLevel, isDead, isAlive, attack, heal, joinFaction, isInFaction, leaveFaction } = require('./src/api')
const { MELEE_FIGHTER, RANGED_FIGHTER } = require('./src/core')
const createCharacter = require('./src/createCharacter')
const createProp = require('./src/createProp')

describe('Character', () => {
  it('has health, starting at 1000', () => {
    const char = createCharacter.default()
    expect(
      getHealth(char)
    ).toEqual(1000)
  })
  it('has a level, starting at 1', () => {
    const char = createCharacter.default()
    expect(
      getLevel(char)
    ).toEqual(1)
  })
  describe('can be', () => {
    test('dead', () => {
      const char = createCharacter.dead()
      expect(
        isDead(char)
      ).toEqual(true)
      expect(
        isAlive(char)
      ).toEqual(false)
    })
    test('or alive', () => {
      const char = createCharacter.default()
      expect(
        isAlive(char)
      ).toEqual(true)
      expect(
        isDead(char)
      ).toEqual(false)
    })
  })

  describe('may belong to factions and can', () => {
    test('join one faction', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      expect(isInFaction(charInLannister, 'Lannister')).toEqual(true)
      expect(isInFaction(charInLannister, 'Tyrell')).toEqual(false)
    })
    test('or join more factions', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charInLannisterAndTyrell = joinFaction(charInLannister, 'Tyrell')
      expect(isInFaction(charInLannisterAndTyrell, 'Lannister')).toEqual(true)
      expect(isInFaction(charInLannisterAndTyrell, 'Tyrell')).toEqual(true)
    })
    test('leave one faction', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charLeftLannister = leaveFaction(charInLannister, 'Lannister')
      expect(isInFaction(charLeftLannister, 'Lannister')).toEqual(false)
    })
    test('or leave more factions', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charInLannisterAndTyrell = joinFaction(charInLannister, 'Tyrell')
      const charLeftLannister = leaveFaction(charInLannisterAndTyrell, 'Lannister')
      const charLeftLannisterAndTyrell = leaveFaction(charLeftLannister, 'Tyrell')
      expect(isInFaction(charLeftLannisterAndTyrell, 'Lannister')).toEqual(false)
      expect(isInFaction(charLeftLannisterAndTyrell, 'Tyrell')).toEqual(false)
    })
  })

  describe('can deal damage', () => {
    test('to enemies', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.default()
      const damagedEnemy = attack({ attacker: char, attacked: enemy })
      expect(getHealth(damagedEnemy)).toEqual(999)
    })
    test('but not self', () => {
      const char = createCharacter.default()
      const damagedChar = attack({ attacker: char, attacked: char })
      expect(getHealth(damagedChar)).toEqual(getHealth(char))
    })
    test('but not to allies', () => {
      const char = joinFaction(createCharacter.default(), 'Lannister')
      const ally = joinFaction(createCharacter.default(), 'Lannister')
      const enemy = joinFaction(createCharacter.default(), 'Tyrell')
      const undamagedAlly = attack({ attacker: char, attacked: ally })
      const damagedEnemy = attack({ attacker: char, attacked: enemy })
      expect(getHealth(undamagedAlly)).toEqual(1000)
      expect(getHealth(damagedEnemy)).toEqual(999)
    })
    test('health becomes 0 if damage is greater than health', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = attack({ attacker: char, attacked: enemy })
      const deaderEnemy = attack({ attacker: char, attacked: deadEnemy })
      expect(getHealth(deadEnemy)).toEqual(0)
      expect(getHealth(deaderEnemy)).toEqual(0)
    })
    it('dies when health is 0', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = attack({ attacker: char, attacked: enemy })
      expect(isDead(deadEnemy)).toEqual(true)
    })
    describe('depending on level', () => {
      test('if target is 5 or more levels above, the damage applied will be reduced by 50%', () => {
        const char = createCharacter.default()
        const highLevelEnemy = createCharacter.withLevel(getLevel(char) + 5)
        const damagedEnemy = attack({ attacker: char, attacked: highLevelEnemy, damage: 100 })
        expect(getHealth(damagedEnemy)).toEqual(950)
      })
      test('if target is 5 or more levels below, the damage applied will be boosted by 50%', () => {
        const char = createCharacter.withLevel(6)
        const lowLevelEnemy = createCharacter.default()
        const damagedEnemy = attack({ attacker: char, attacked: lowLevelEnemy, damage: 100 })
        expect(getHealth(damagedEnemy)).toEqual(850)
      })
    })
    describe('if the target is in range', () => {
      test('if the player is a melee fighter, their range is 2 meters', () => {
        const meleeFighter = createCharacter.withClass(MELEE_FIGHTER)
        const enemy = createCharacter.default()
        const damagedEnemyInRange = attack({ attacker: meleeFighter, attacked: enemy, distance: 2 })
        expect(getHealth(damagedEnemyInRange)).toEqual(999)
        const undamageEnemyOutOfRange = attack({ attacker: meleeFighter, attacked: enemy, distance: 3 })
        expect(getHealth(undamageEnemyOutOfRange)).toEqual(1000)
      })
      test('if the player is a ranged fighter, their range is 20 meters', () => {
        const rangedFighter = createCharacter.withClass(RANGED_FIGHTER)
        const enemy = createCharacter.default()
        const damagedEnemyInRange = attack({ attacker: rangedFighter, attacked: enemy, distance: 20 })
        expect(getHealth(damagedEnemyInRange)).toEqual(999)
        const undamageEnemyOutOfRange = attack({ attacker: rangedFighter, attacked: enemy, distance: 21 })
        expect(getHealth(undamageEnemyOutOfRange)).toEqual(1000)
      })
    })
    describe('to other things that are not characters (props)', () => {
      it('can attack a prop', () => {
        const char = createCharacter.default()
        const house = createProp.withHealth(2000)
        const damagedHouse = attack({ attacker: char, attacked: house })
        expect(getHealth(damagedHouse)).toEqual(1999)
      })
      test('if it has health', () => {
        const char = createCharacter.default()
        const destroyedHouse = createProp.destroyed()
        expect(getHealth(destroyedHouse)).toEqual(0)
        const stillDestroyedHouse = attack({ attacker: char, attacked: destroyedHouse })
        expect(getHealth(stillDestroyedHouse)).toEqual(getHealth(destroyedHouse))
      })
    })
  })

  describe('can heal', () => {
    test('themselves', () => {
      const char = createCharacter.withHealth(900)
      expect(getHealth(char)).toEqual(900)
      const healed = heal({ character: char })
      expect(getHealth(healed)).toEqual(901)
    })

    test('and allies', () => {
      const char = joinFaction(createCharacter.default(), 'Lannister')
      const ally = joinFaction(createCharacter.withHealth(900), 'Lannister')
      const healed = heal({ character: ally, healer: char })
      expect(getHealth(healed)).toEqual(901)
    })

    test('but not enemies', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(900)
      expect(getHealth(enemy)).toEqual(900)
      const healed = heal({ healer: char, character: enemy })
      expect(getHealth(healed)).toEqual(900)
    })

    test('but not if it is dead', () => {
      const deadChar = createCharacter.dead()
      const stillDead = heal({ character: deadChar })
      expect(isDead(stillDead)).toEqual(true)
    })

    test('and not over 1000', () => {
      const char = createCharacter.default()
      expect(getHealth(char)).toEqual(1000)
      const healed = heal({ character: char })
      expect(getHealth(healed)).toEqual(1000)

      const char2 = createCharacter.withHealth(999)
      expect(getHealth(heal({ character: heal({ character: char2 }) }))).toEqual(1000)
    })

    test('but not props', () => {
      const destroyedHouse = createProp.withHealth(100)
      expect(getHealth(destroyedHouse)).toEqual(100)
      const stillDestroyedHouse = heal({ character: destroyedHouse })
      expect(getHealth(stillDestroyedHouse)).toEqual(getHealth(destroyedHouse))
    })
  })
})

describe('Props', () => {
  it('cannot deal damage', () => {
    const prop = createProp.default()
    const character = createCharacter.default()
    expect(getHealth(attack({
      attacker: prop,
      attacked: character
    }))).toEqual(getHealth(character))
  })
  it('cannot belong to factions', () => {
    const prop = createProp.default()
    const propInLannister = joinFaction(prop, 'Lannister')
    expect(isInFaction(propInLannister, 'Lannister')).toEqual(false)
    expect(isInFaction(propInLannister, 'Tyrell')).toEqual(false)
  })
  it('can have higher start health (e.g. a house with 2000 health)', () => {
    const char = createCharacter.withHealth(2000)
    expect(
      getHealth(char)
    ).toEqual(1000)
    const house = createProp.withHealth(2000)
    expect(
      getHealth(house)
    ).toEqual(2000)
  })
})
