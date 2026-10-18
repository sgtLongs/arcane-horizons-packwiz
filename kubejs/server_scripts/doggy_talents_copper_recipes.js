ServerEvents.recipes(event => {
    event.remove({ id: 'doggytalents:dog_bath' })
    event.shaped('doggytalents:dog_bath', [
        'CCC',
        'CWC',
        'CCC'
    ], {
        C: 'minecraft:copper_ingot',
        W: 'minecraft:water_bucket'
    }).id('doggytalents:dog_bath')

    event.remove({ id: 'doggytalents:food_bowl' })
    event.shaped('doggytalents:food_bowl', [
        'CCC',
        'CBC',
        'CCC'
    ], {
        B: 'minecraft:bowl',
        C: 'minecraft:copper_ingot'
    }).id('doggytalents:food_bowl')

    event.remove({ id: 'doggytalents:whistle' })
    event.shaped('doggytalents:whistle', [
        'CRC',
        'CC '
    ], {
        C: 'minecraft:copper_ingot',
        R: 'minecraft:redstone'
    }).id('doggytalents:whistle')
})
