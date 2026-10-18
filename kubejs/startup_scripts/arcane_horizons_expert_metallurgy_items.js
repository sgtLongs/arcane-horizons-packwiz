// Arcane Horizons Expert Metallurgy v0.4.1
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
    item('poor_silver_powder', 'Poor Silver Powder', 'create:item/crushed_raw_silver')

    item('washed_copper_concentrate', 'Washed Copper Concentrate', 'minecraft:item/copper_ingot')
    item('washed_tin_concentrate', 'Washed Tin Concentrate', 'minecraft:item/quartz')
    item('washed_iron_concentrate', 'Washed Iron Concentrate', 'minecraft:item/iron_nugget')
    item('washed_gold_concentrate', 'Washed Gold Concentrate', 'minecraft:item/gold_nugget')
    item('washed_silver_concentrate', 'Washed Silver Concentrate', 'immersiveengineering:item/metal_ingot_silver')

    item('iron_bloom_charge', 'Iron Bloom Charge', 'minecraft:item/raw_iron')
    item('refined_iron_charge', 'Refined Iron Charge', 'minecraft:item/iron_nugget')
    item('hot_refined_iron_charge', 'Hot Refined Iron Charge', 'minecraft:item/blaze_powder')

    item('industrial_flux', 'Industrial Flux', 'minecraft:item/quartz')

    item('rich_copper_concentrate', 'Rich Copper Concentrate', 'minecraft:item/copper_ingot')
    item('rich_tin_concentrate', 'Rich Tin Concentrate', 'minecraft:item/quartz')
    item('rich_iron_concentrate', 'Rich Iron Concentrate', 'minecraft:item/iron_ingot')
    item('rich_gold_concentrate', 'Rich Gold Concentrate', 'minecraft:item/gold_ingot')
    item('rich_silver_concentrate', 'Rich Silver Concentrate', 'immersiveengineering:item/metal_ingot_silver')

    item('industrial_separation_media', 'Industrial Separation Media', 'create:item/precision_mechanism')
    item('advanced_separation_media', 'Advanced Separation Media', 'minecraft:item/shulker_shell')
    item('arcane_metallurgical_catalyst', 'Arcane Metallurgical Catalyst', 'minecraft:item/nether_star')

    ;['copper', 'tin', 'iron', 'gold', 'silver'].forEach(metal => {
        const textures = {
            copper: 'minecraft:item/copper_ingot',
            tin: 'minecraft:item/quartz',
            iron: 'minecraft:item/iron_ingot',
            gold: 'minecraft:item/gold_ingot',
            silver: 'immersiveengineering:item/metal_ingot_silver'
        }
        const pretty = metal.charAt(0).toUpperCase() + metal.slice(1)
        item(`industrial_${metal}_feed`, `Industrial ${pretty} Feed`, textures[metal])
        item(`advanced_${metal}_feed`, `Advanced ${pretty} Feed`, textures[metal])
        item(`arcane_${metal}_feed`, `Arcane ${pretty} Feed`, textures[metal])
    })

    item('mechanical_ignition_core', 'Mechanical Ignition Core', 'create:item/precision_mechanism')
    item('processed_slag', 'Processed Slag', 'minecraft:item/flint')

    // Additional intermediates used by the server's rebalanced metallurgy.
    item('washed_zinc_concentrate', 'Washed Zinc Concentrate', 'create:item/zinc_ingot')
    item('rich_zinc_concentrate', 'Rich Zinc Concentrate', 'create:item/zinc_ingot')

    item('mythic_transmutation_core', 'Mythic Transmutation Core', 'minecraft:item/nether_star')
    item('mythic_metallurgical_catalyst', 'Mythic Metallurgical Catalyst', 'minecraft:item/echo_shard')

    const lateMetalTextures = {
        copper: 'minecraft:item/copper_ingot',
        tin: 'minecraft:item/quartz',
        zinc: 'create:item/zinc_ingot',
        iron: 'minecraft:item/iron_ingot',
        gold: 'minecraft:item/gold_ingot',
        aluminum: 'minecraft:item/iron_ingot',
        lead: 'minecraft:item/iron_ingot',
        nickel: 'minecraft:item/iron_ingot',
        silver: 'immersiveengineering:item/metal_ingot_silver',
        uranium: 'minecraft:item/emerald',
        tungsten: 'minecraft:item/netherite_ingot',
        iesnium: 'minecraft:item/amethyst_shard'
    }
    const allMetals = Object.keys(lateMetalTextures)
    const baseFeedMetals = ['copper', 'tin', 'iron', 'gold', 'silver']
    allMetals.filter(metal => !baseFeedMetals.includes(metal)).forEach(metal => {
        const pretty = metal.charAt(0).toUpperCase() + metal.slice(1)
        ;['industrial', 'advanced', 'arcane'].forEach(tier => {
            const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
            item(`${tier}_${metal}_feed`, `${tierName} ${pretty} Feed`, lateMetalTextures[metal])
        })
    })
    allMetals.forEach(metal => {
        const pretty = metal.charAt(0).toUpperCase() + metal.slice(1)
        item(`mythic_${metal}_feed`, `Mythic ${pretty} Feed`, lateMetalTextures[metal])
    })

    const progressionItems = [
        ['twilight_core', 'Twilight Core', 'minecraft:item/ender_eye'],
        ['arcane_actuator', 'Arcane Actuator', 'minecraft:item/ender_pearl'],
        ['enchanted_machine_frame', 'Enchanted Machine Frame', 'minecraft:item/iron_block'],
        ['industrial_control_unit', 'Industrial Control Unit', 'minecraft:item/comparator'],
        ['resonant_core', 'Resonant Core', 'minecraft:item/amethyst_shard'],
        ['flight_control_assembly', 'Flight Control Assembly', 'minecraft:item/elytra'],
        ['spirit_bound_core', 'Spirit Bound Core', 'minecraft:item/echo_shard'],
        ['dimensional_matrix', 'Dimensional Matrix', 'minecraft:item/nether_star']
    ]
    progressionItems.forEach(([id, name, texture]) => {
        item(`arcane_horizons:${id}`, name, texture)
    })
})
