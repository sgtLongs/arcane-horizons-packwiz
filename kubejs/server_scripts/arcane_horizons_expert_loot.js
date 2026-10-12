// Arcane Horizons Expert Metallurgy v0.3.1
// Finished metal loot cannot skip the metallurgy eras.

LootJS.modifiers(event => {
    const chest = event.addTableModifier(LootType.CHEST)

    chest.replaceLoot('minecraft:iron_ingot', 'minecraft:raw_iron', true)
    chest.replaceLoot('minecraft:gold_ingot', 'minecraft:raw_gold', true)

    ;[
        'minecraft:iron_sword','minecraft:iron_pickaxe','minecraft:iron_axe','minecraft:iron_shovel',
        'minecraft:iron_hoe','minecraft:iron_helmet','minecraft:iron_chestplate',
        'minecraft:iron_leggings','minecraft:iron_boots','minecraft:iron_horse_armor'
    ].forEach(item => chest.replaceLoot(item, 'minecraft:raw_iron', false))

    ;[
        'minecraft:golden_sword','minecraft:golden_pickaxe','minecraft:golden_axe','minecraft:golden_shovel',
        'minecraft:golden_hoe','minecraft:golden_helmet','minecraft:golden_chestplate',
        'minecraft:golden_leggings','minecraft:golden_boots','minecraft:golden_horse_armor'
    ].forEach(item => chest.replaceLoot(item, 'minecraft:raw_gold', false))

    ;[
        'minecraft:diamond_sword','minecraft:diamond_pickaxe','minecraft:diamond_axe','minecraft:diamond_shovel',
        'minecraft:diamond_hoe','minecraft:diamond_helmet','minecraft:diamond_chestplate',
        'minecraft:diamond_leggings','minecraft:diamond_boots','minecraft:diamond_horse_armor'
    ].forEach(item => chest.replaceLoot(item, 'minecraft:diamond', false))
})
