/* globals expect, it, test, describe */

const { getCharacterHealth, getCharacterLevel, isCharacterDead, isCharacterAlive, dealDamage, healCharacter, joinFaction, charIsInFaction, leaveFaction } = require('./src/api')
const { MELEE_FIGHTER, RANGED_FIGHTER } = require('./src/core')
const createCharacter = require('./src/createCharacter')
const createProp = require('./src/createProp')

describe('Character', () => {
  it('has health, starting at 1000', () => {
    const char = createCharacter.default()
    expect(
      getCharacterHealth(char)
    ).toEqual(1000)
  })
  it('has a level, starting at 1', () => {
    const char = createCharacter.default()
    expect(
      getCharacterLevel(char)
    ).toEqual(1)
  })
  describe('can be', () => {
    test('dead', () => {
      const char = createCharacter.dead()
      expect(
        isCharacterDead(char)
      ).toEqual(true)
      expect(
        isCharacterAlive(char)
      ).toEqual(false)
    })
    test('or alive', () => {
      const char = createCharacter.default()
      expect(
        isCharacterAlive(char)
      ).toEqual(true)
      expect(
        isCharacterDead(char)
      ).toEqual(false)
    })
  })

  describe('may belong to factions and can', () => {
    test('join one faction', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      expect(charIsInFaction(charInLannister, 'Lannister')).toEqual(true)
      expect(charIsInFaction(charInLannister, 'Tyrell')).toEqual(false)
    })
    test('or join more factions', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charInLannisterAndTyrell = joinFaction(charInLannister, 'Tyrell')
      expect(charIsInFaction(charInLannisterAndTyrell, 'Lannister')).toEqual(true)
      expect(charIsInFaction(charInLannisterAndTyrell, 'Tyrell')).toEqual(true)
    })
    test('leave one faction', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charLeftLannister = leaveFaction(charInLannister, 'Lannister')
      expect(charIsInFaction(charLeftLannister, 'Lannister')).toEqual(false)
    })
    test('or leave more factions', () => {
      const char = createCharacter.default()
      const charInLannister = joinFaction(char, 'Lannister')
      const charInLannisterAndTyrell = joinFaction(charInLannister, 'Tyrell')
      const charLeftLannister = leaveFaction(charInLannisterAndTyrell, 'Lannister')
      const charLeftLannisterAndTyrell = leaveFaction(charLeftLannister, 'Tyrell')
      expect(charIsInFaction(charLeftLannisterAndTyrell, 'Lannister')).toEqual(false)
      expect(charIsInFaction(charLeftLannisterAndTyrell, 'Tyrell')).toEqual(false)
    })
  })

  describe('can deal damage', () => {
    test('to enemies', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.default()
      const damagedEnemy = dealDamage({ attacker: char, attacked: enemy })
      expect(getCharacterHealth(damagedEnemy)).toBeLessThan(getCharacterHealth(enemy))
    })
    test('but not self', () => {
      const char = createCharacter.default()
      const damagedChar = dealDamage({ attacker: char, attacked: char })
      expect(getCharacterHealth(damagedChar)).toEqual(getCharacterHealth(char))
    })
    test('but not to allies', () => {
      const char = joinFaction(createCharacter.default(), 'Lannister')
      const ally = joinFaction(createCharacter.default(), 'Lannister')
      const enemy = joinFaction(createCharacter.default(), 'Tyrell')
      const undamagedAlly = dealDamage({ attacker: char, attacked: ally })
      const damagedEnemy = dealDamage({ attacker: char, attacked: enemy })
      expect(getCharacterHealth(undamagedAlly)).toEqual(getCharacterHealth(ally))
      expect(getCharacterHealth(damagedEnemy)).toBeLessThan(getCharacterHealth(enemy))
    })
    test('health becomes 0 if damage is greater than health', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = dealDamage({ attacker: char, attacked: enemy })
      const deaderEnemy = dealDamage({ attacker: char, attacked: deadEnemy })
      expect(getCharacterHealth(deadEnemy)).toEqual(0)
      expect(getCharacterHealth(deaderEnemy)).toEqual(0)
    })
    it('dies when health is 0', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(1)
      const deadEnemy = dealDamage({ attacker: char, attacked: enemy })
      expect(isCharacterDead(deadEnemy)).toEqual(true)
    })
    describe('depending on level', () => {
      test('if target is 5 or more levels above, the damage applied will be reduced by 50%', () => {
        const char = createCharacter.default()
        const highLevelEnemy = createCharacter.withLevel(getCharacterLevel(char) + 5)
        const damagedEnemy = dealDamage({ attacker: char, attacked: highLevelEnemy, damage: 100 })
        expect(getCharacterHealth(damagedEnemy)).toEqual(950)
      })
      test('if target is 5 or more levels below, the damage applied will be boosted by 50%', () => {
        const char = createCharacter.withLevel(6)
        const lowLevelEnemy = createCharacter.default()
        const damagedEnemy = dealDamage({ attacker: char, attacked: lowLevelEnemy, damage: 100 })
        expect(getCharacterHealth(damagedEnemy)).toEqual(850)
      })
    })
    describe('if the target is in range', () => {
      test('if the player is a melee fighter, their range is 2 meters', () => {
        const meleeFighter = createCharacter.withClass(MELEE_FIGHTER)
        const enemy = createCharacter.default()
        const damagedEnemyInRange = dealDamage({ attacker: meleeFighter, attacked: enemy, distance: 2 })
        expect(getCharacterHealth(damagedEnemyInRange)).toBeLessThan(getCharacterHealth(enemy))
        const undamageEnemyOutOfRange = dealDamage({ attacker: meleeFighter, attacked: enemy, distance: 3 })
        expect(getCharacterHealth(undamageEnemyOutOfRange)).toEqual(getCharacterHealth(enemy))
      })
      test('if the player is a ranged fighter, their range is 20 meters', () => {
        const rangedFighter = createCharacter.withClass(RANGED_FIGHTER)
        const enemy = createCharacter.default()
        const damagedEnemyInRange = dealDamage({ attacker: rangedFighter, attacked: enemy, distance: 20 })
        expect(getCharacterHealth(damagedEnemyInRange)).toBeLessThan(getCharacterHealth(enemy))
        const undamageEnemyOutOfRange = dealDamage({ attacker: rangedFighter, attacked: enemy, distance: 21 })
        expect(getCharacterHealth(undamageEnemyOutOfRange)).toEqual(getCharacterHealth(enemy))
      })
    })
    describe('to other things that are not characters (props)', () => {
      it('can attack a prop', () => {
        const char = createCharacter.default()
        const house = createProp.withHealth(2000)
        const damagedHouse = dealDamage({ attacker: char, attacked: house })
        // expect(getCharacterHealth(damagedHouse)).toEqual(1999)
        expect(getCharacterHealth(damagedHouse)).toBeLessThan(getCharacterHealth(house))
      })
      test('if it has health', () => {
        const char = createCharacter.default()
        const destroyedHouse = createProp.destroyed()
        expect(getCharacterHealth(destroyedHouse)).toEqual(0)
        const stillDestroyedHouse = dealDamage({ attacker: char, attacked: destroyedHouse })
        expect(getCharacterHealth(stillDestroyedHouse)).toEqual(getCharacterHealth(destroyedHouse))
      })
    })
  })

  describe('can heal', () => {
    test('themselves', () => {
      const char = createCharacter.withHealth(900)
      expect(getCharacterHealth(char)).toEqual(900)
      const healed = healCharacter(char)
      expect(getCharacterHealth(healed)).toBeGreaterThan(900)
    })

    test('and allies', () => {
      const char = joinFaction(createCharacter.default(), 'Lannister')
      const ally = joinFaction(createCharacter.withHealth(900), 'Lannister')
      const healed = healCharacter(ally, char)
      expect(getCharacterHealth(healed)).toBeGreaterThan(900)
    })

    test('but not enemies', () => {
      const char = createCharacter.default()
      const enemy = createCharacter.withHealth(900)
      expect(getCharacterHealth(enemy)).toEqual(900)
      const healed = healCharacter(enemy, char)
      expect(getCharacterHealth(healed)).toEqual(900)
    })

    test('but not if it is dead', () => {
      const deadChar = createCharacter.dead()
      const stillDead = healCharacter(deadChar)
      expect(isCharacterDead(stillDead)).toEqual(true)
    })

    test('and not over 1000', () => {
      const char = createCharacter.default()
      expect(getCharacterHealth(char)).toEqual(1000)
      const healed = healCharacter(char)
      expect(getCharacterHealth(healed)).toEqual(1000)

      const char2 = createCharacter.withHealth(999)
      expect(getCharacterHealth(healCharacter(healCharacter(char2)))).toEqual(1000)
    })

    test('but not props', () => {
      const destroyedHouse = createProp.withHealth(100)
      expect(getCharacterHealth(destroyedHouse)).toEqual(100)
      const stillDestroyedHouse = healCharacter(destroyedHouse)
      expect(getCharacterHealth(stillDestroyedHouse)).toEqual(getCharacterHealth(destroyedHouse))
    })
  })
})

describe('Props', () => {
  it('cannot deal damage', () => {
    const prop = createProp.default()
    const character = createCharacter.default()
    expect(getCharacterHealth(dealDamage({
      attacker: prop,
      attacked: character
    }))).toEqual(getCharacterHealth(character))
  })
  it('cannot belong to factions', () => {
    const prop = createProp.default()
    const propInLannister = joinFaction(prop, 'Lannister')
    expect(charIsInFaction(propInLannister, 'Lannister')).toEqual(false)
    expect(charIsInFaction(propInLannister, 'Tyrell')).toEqual(false)
  })
  it('can have higher start health (e.g. a house with 2000 health)', () => {
    const char = createCharacter.withHealth(2000)
    expect(
      getCharacterHealth(char)
    ).toEqual(1000)
    const house = createProp.withHealth(2000)
    expect(
      getCharacterHealth(house)
    ).toEqual(2000)
  })
})
