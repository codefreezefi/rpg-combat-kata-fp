# RPG Combat Kata FP

The [RPG Combat Kata](https://de.slideshare.net/DanielOjedaLoisel/rpg-combat-kata) implemented using [Sanctuary.js](https://sanctuary.js.org/).

The principles for this implementation were:

- functional, point free programming
- point free programming
- immutable API
- keeping the business rules readable in one place

## How to run the tests

    git clone https://github.com/codefreezefi/rpg-combat-kata-fp
    npm ci
    npm test

```
  Character
    ✓ has health, starting at 1000 (5ms)
    ✓ has a level, starting at 1 (3ms)
    can be
      ✓ dead (12ms)
      ✓ or alive (6ms)
    may belong to factions and can
      ✓ join one faction (84ms)
      ✓ or join more factions (122ms)
      ✓ leave one faction (42ms)
      ✓ or leave more factions (86ms)
    can deal damage
      ✓ to enemies (90ms)
      ✓ but not self (20ms)
      ✓ but not to allies (208ms)
      ✓ health becomes 0 if damage is greater than health (146ms)
      ✓ dies when health is 0 (74ms)
      depending on level
        ✓ if target is 5 or more levels above, the damage applied will be reduced by 50% (74ms)
        ✓ if target is 5 or more levels below, the damage applied will be boosted by 50% (71ms)
      if the target is in range
        ✓ if the player is a melee fighter, their range is 2 meters (147ms)
        ✓ if the player is a ranged fighter, their range is 20 meters (145ms)
      to other things that are not characters (props)
        ✓ can attack a prop (69ms)
        ✓ if it has health (72ms)
    can heal
      ✓ themselves (55ms)
      ✓ and allies (89ms)
      ✓ but not enemies (38ms)
      ✓ but not if it is dead (43ms)
      ✓ and not over 1000 (142ms)
      ✓ but not props (15ms)
  Props
    ✓ cannot deal damage (16ms)
    ✓ cannot belong to factions (38ms)
    ✓ can have higher start health (e.g. a house with 2000 health) (3ms)
```
