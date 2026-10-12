// Arcane Horizons Expert Metallurgy v0.3.1
// Custom intermediates. Changes require a full Minecraft restart.

StartupEvents.registry('item', event => {
    const item = (id, name, texture) => event.create(id).displayName(name).texture(texture)

    item('primitive_drive_belt', 'Primitive Drive Belt', 'create:item/belt_connector')

    item('primitive_copper_charge', 'Primitive Copper Charge', 'minecraft:item/raw_copper')
    item('primitive_tin_charge', 'Primitive Tin Charge', 'minecraft:item/raw_iron')
    item('primitive_zinc_charge', 'Primitive Zinc Charge', 'create:item/raw_zinc')

    item('poor_copper_powder', 'Poor Copper Powder', 'create:item/crushed_raw_copper')
    item('poor_tin_powder', 'Poor Tin Powder', 'minecraft:item/gunpowder')
    item('poor_zinc_powder', 'Poor Zinc Powder', 'create:item/crushed_raw_zinc')
    item('poor_iron_powder', 'Poor Iron Powder', 'create:item/crushed_raw_iron')
    item('poor_gold_powder', 'Poor Gold Powder', 'create:item/crushed_raw_gold')

    item('washed_copper_concentrate', 'Washed Copper Concentrate', 'minecraft:item/copper_ingot')
    item('washed_tin_concentrate', 'Washed Tin Concentrate', 'minecraft:item/quartz')
    item('washed_iron_concentrate', 'Washed Iron Concentrate', 'minecraft:item/iron_nugget')
    item('washed_gold_concentrate', 'Washed Gold Concentrate', 'minecraft:item/gold_nugget')

    item('iron_bloom_charge', 'Iron Bloom Charge', 'minecraft:item/raw_iron')
    item('refined_iron_charge', 'Refined Iron Charge', 'minecraft:item/iron_nugget')
    item('hot_refined_iron_charge', 'Hot Refined Iron Charge', 'minecraft:item/blaze_powder')

    item('industrial_flux', 'Industrial Flux', 'minecraft:item/quartz')

    item('rich_copper_concentrate', 'Rich Copper Concentrate', 'minecraft:item/copper_ingot')
    item('rich_tin_concentrate', 'Rich Tin Concentrate', 'minecraft:item/quartz')
    item('rich_iron_concentrate', 'Rich Iron Concentrate', 'minecraft:item/iron_ingot')
    item('rich_gold_concentrate', 'Rich Gold Concentrate', 'minecraft:item/gold_ingot')

    item('industrial_separation_media', 'Industrial Separation Media', 'create:item/precision_mechanism')
    item('advanced_separation_media', 'Advanced Separation Media', 'minecraft:item/shulker_shell')
    item('arcane_metallurgical_catalyst', 'Arcane Metallurgical Catalyst', 'minecraft:item/nether_star')

    ;['copper', 'tin', 'iron', 'gold'].forEach(metal => {
        const textures = {
            copper: 'minecraft:item/copper_ingot',
            tin: 'minecraft:item/quartz',
            iron: 'minecraft:item/iron_ingot',
            gold: 'minecraft:item/gold_ingot'
        }
        const pretty = metal.charAt(0).toUpperCase() + metal.slice(1)
        item(`industrial_${metal}_feed`, `Industrial ${pretty} Feed`, textures[metal])
        item(`advanced_${metal}_feed`, `Advanced ${pretty} Feed`, textures[metal])
        item(`arcane_${metal}_feed`, `Arcane ${pretty} Feed`, textures[metal])
    })

    item('mechanical_ignition_core', 'Mechanical Ignition Core', 'create:item/precision_mechanism')
    item('processed_slag', 'Processed Slag', 'minecraft:item/flint')
})
