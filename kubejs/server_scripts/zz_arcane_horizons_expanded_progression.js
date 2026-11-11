// Arcane Horizons Expanded Expert Progression v0.1.0
// Loaded after the metallurgy scripts so these are the final active recipes.

ServerEvents.recipes(event => {
    const replaceShaped = (output, pattern, key, id) => {
        event.remove({ output: output })
        event.shaped(output, pattern, key).id(`arcane_horizons:expanded/${id}`)
    }

    const replaceShapeless = (output, inputs, id) => {
        event.remove({ output: output })
        event.shapeless(output, inputs).id(`arcane_horizons:expanded/${id}`)
    }

    const apparatus = (output, reagent, pedestalItems, sourceCost, id) => {
        event.custom({
            type: 'ars_nouveau:enchanting_apparatus',
            keepNbtOfReagent: false,
            output: output,
            pedestalItems: pedestalItems.map(item => ({ item: item })),
            reagent: [{ item: reagent }],
            sourceCost: sourceCost
        }).id(`arcane_horizons:expanded/${id}`)
    }

    // -----------------------------------------------------------------
    // NETHER -> STEEL -> TWILIGHT I
    // -----------------------------------------------------------------
    // Remove furnace, recycling, casting, and cross-mod steel producers.
    // The intended first steel route requires heated Create mixing.
    event.remove({ output: 'immersiveengineering:ingot_steel' })
    event.recipes.create.mixing('immersiveengineering:ingot_steel', [
        'minecraft:iron_ingot',
        '#c:dusts/coal_coke'
    ]).heated().id('arcane_horizons:expanded/nether_steel')
    event.shapeless('9x immersiveengineering:ingot_steel', [
        'immersiveengineering:storage_steel'
    ]).id('arcane_horizons:expanded/unpack_steel_block')
    event.shaped('immersiveengineering:ingot_steel', ['NNN', 'NNN', 'NNN'], {
        N: 'immersiveengineering:nugget_steel'
    }).id('arcane_horizons:expanded/compact_steel_nuggets')

    // Brass material follows steel, while the automation blocks below also
    // require the Twilight/Arcane progression key.
    event.remove({ output: 'create:brass_ingot' })
    event.recipes.create.mixing('2x create:brass_ingot', [
        'minecraft:copper_ingot',
        'create:zinc_ingot',
        'immersiveengineering:nugget_steel'
    ]).heated().id('arcane_horizons:expanded/steel_brass')
    event.shapeless('9x create:brass_ingot', [
        'create:brass_block'
    ]).id('arcane_horizons:expanded/unpack_brass_block')
    event.shaped('create:brass_ingot', ['NNN', 'NNN', 'NNN'], {
        N: 'create:brass_nugget'
    }).id('arcane_horizons:expanded/compact_brass_nuggets')

    // One early Twilight boss cycle supplies enough cores for the first
    // factory tier. Later recipes use the renewable core, not boss drops.
    event.recipes.create.mechanical_crafting('8x arcane_horizons:twilight_core', [
        ' NSSS ',
        'NSTSN',
        'SSLSS',
        'NSTSN',
        ' NSSS '
    ], {
        N: 'twilightforest:naga_scale',
        S: '#c:plates/steel',
        L: 'twilightforest:lich_trophy',
        T: 'twilightforest:torchberries'
    }).id('arcane_horizons:expanded/twilight_core')

    // -----------------------------------------------------------------
    // ARCANE II + BRASS AUTOMATION
    // -----------------------------------------------------------------
    apparatus(
        { item: 'arcane_horizons:arcane_actuator', count: 2 },
        'create:electron_tube',
        [
            'arcane_horizons:twilight_core', 'arcane_horizons:twilight_core',
            'ars_nouveau:source_gem', 'ars_nouveau:source_gem',
            'create:brass_casing', 'create:brass_casing',
            'hexerei:moon_dust', 'hexerei:moon_dust'
        ],
        3000,
        'arcane_actuator'
    )

    apparatus(
        { item: 'arcane_horizons:enchanted_machine_frame' },
        'arcane_horizons:arcane_actuator',
        [
            'immersiveengineering:plate_steel', 'immersiveengineering:plate_steel',
            'immersiveengineering:plate_steel', 'immersiveengineering:plate_steel',
            'ars_nouveau:source_gem', 'ars_nouveau:source_gem',
            'hexerei:moon_dust', 'arcane_horizons:twilight_core'
        ],
        5000,
        'enchanted_machine_frame'
    )

    replaceShaped('create:deployer', [' E ', 'CAC', ' H '], {
        E: 'create:electron_tube',
        C: 'create:brass_casing',
        A: 'arcane_horizons:arcane_actuator',
        H: 'create:brass_hand'
    }, 'deployer')

    replaceShaped('create:brass_funnel', [' E ', 'BAB', ' K '], {
        E: 'create:electron_tube',
        B: 'create:brass_ingot',
        A: 'arcane_horizons:arcane_actuator',
        K: 'minecraft:dried_kelp'
    }, 'brass_funnel')

    replaceShaped('create:brass_tunnel', ['EAE', 'BBB', 'KKK'], {
        E: 'create:electron_tube',
        A: 'arcane_horizons:arcane_actuator',
        B: 'create:brass_ingot',
        K: 'minecraft:dried_kelp'
    }, 'brass_tunnel')

    // -----------------------------------------------------------------
    // PRECISION ENGINEERING
    // -----------------------------------------------------------------
    event.recipes.create.mechanical_crafting('2x arcane_horizons:industrial_control_unit', [
        'SPAPS',
        'PEAEP',
        'AEREA',
        'PEAEP',
        'SPAPS'
    ], {
        S: 'immersiveengineering:plate_steel',
        P: 'create:precision_mechanism',
        A: 'arcane_horizons:arcane_actuator',
        E: 'create:electron_tube',
        R: 'arcane_horizons:enchanted_machine_frame'
    }).id('arcane_horizons:expanded/industrial_control_unit')

    replaceShaped('create:mechanical_arm', [' B ', 'CIC', ' H '], {
        B: 'create:brass_sheet',
        C: 'create:brass_casing',
        I: 'arcane_horizons:industrial_control_unit',
        H: 'create:brass_hand'
    }, 'mechanical_arm')

    replaceShaped('create:mechanical_crafter', [' E ', 'CIC', ' T '], {
        E: 'create:electron_tube',
        C: 'create:brass_casing',
        I: 'arcane_horizons:industrial_control_unit',
        T: 'minecraft:crafting_table'
    }, 'mechanical_crafter')

    replaceShaped('create:rotation_speed_controller', [' P ', 'CIC', ' S '], {
        P: 'create:precision_mechanism',
        C: 'create:brass_casing',
        I: 'arcane_horizons:industrial_control_unit',
        S: 'create:shaft'
    }, 'rotation_speed_controller')

    // A single midgame combat reward becomes a batch of reusable keys.
    apparatus(
        { item: 'arcane_horizons:resonant_core', count: 8 },
        'mowziesmobs:wrought_axe',
        [
            'arcane_horizons:twilight_core', 'arcane_horizons:twilight_core',
            'arcane_horizons:twilight_core', 'arcane_horizons:twilight_core',
            'ars_nouveau:source_gem_block', 'ars_nouveau:source_gem_block',
            'ars_nouveau:source_gem_block', 'ars_nouveau:source_gem_block'
        ],
        10000,
        'resonant_core'
    )

    // -----------------------------------------------------------------
    // INDUSTRIAL POWER -> DEEPER AND DARKER -> HEAVY ENGINEERING
    // -----------------------------------------------------------------
    replaceShaped('immersiveengineering:heavy_engineering', [
        'SHS',
        'CIC',
        'SHS'
    ], {
        S: 'immersiveengineering:sheetmetal_steel',
        H: 'deeperdarker:heart_of_the_deep',
        C: 'immersiveengineering:component_steel',
        I: 'arcane_horizons:industrial_control_unit'
    }, 'heavy_engineering')

    replaceShaped('create:track_station', [' R ', 'CIC', ' H '], {
        R: 'create:railway_casing',
        C: 'minecraft:compass',
        I: 'arcane_horizons:industrial_control_unit',
        H: 'immersiveengineering:heavy_engineering'
    }, 'track_station')

    // -----------------------------------------------------------------
    // AVIATION AGE
    // -----------------------------------------------------------------
    event.recipes.create.mechanical_crafting('arcane_horizons:flight_control_assembly', [
        'F S F',
        ' C I ',
        'S H S',
        ' R E ',
        'F S F'
    ], {
        F: 'twilightforest:knightmetal_ingot',
        S: 'create:sturdy_sheet',
        C: 'createaddition:capacitor',
        I: 'arcane_horizons:industrial_control_unit',
        H: 'immersiveengineering:heavy_engineering',
        R: 'arcane_horizons:resonant_core',
        E: 'create_new_age:advanced_motor'
    }).id('arcane_horizons:expanded/flight_control_assembly')

    if (Platform.isLoaded('sable_ships')) {
        replaceShaped('sable_ships:ship_engine', [
            'SES',
            'AFA',
            'SCS'
        ], {
            S: 'create:sturdy_sheet',
            E: 'create_new_age:advanced_motor',
            A: 'create:andesite_alloy',
            F: 'arcane_horizons:flight_control_assembly',
            C: 'arcane_horizons:industrial_control_unit'
        }, 'sable_ship_engine')
    }

    // -----------------------------------------------------------------
    // LATE DIMENSIONS, TELEPORTATION, AND ENDGAME INDUSTRY
    // -----------------------------------------------------------------
    apparatus(
        { item: 'arcane_horizons:unbound_spirit_core', count: 2 },
        'arcane_horizons:enchanted_machine_frame',
        [
            'occultism:spirit_attuned_gem', 'occultism:spirit_attuned_gem',
            'occultism:spirit_attuned_gem', 'occultism:spirit_attuned_gem',
            'hexerei:moon_dust', 'hexerei:moon_dust',
            'arcane_horizons:resonant_core', 'occultism:otherworld_essence'
        ],
        10000,
        'unbound_spirit_core'
    )

    event.custom({
        type: 'occultism:crushing',
        ingredient: { item: 'arcane_horizons:unbound_spirit_core' },
        min_tier: 2,
        result: { type: 'occultism:item', id: 'arcane_horizons:spirit_bound_core', count: 1 },
        crushing_time: 400,
        ignore_crushing_multiplier: true
    }).id('arcane_horizons:expanded/spirit_bound_core')

    event.recipes.create.mechanical_crafting('arcane_horizons:dimensional_matrix', [
        'AESEA',
        'EBDBE',
        'SDBDS',
        'EBDBE',
        'AESEA'
    ], {
        A: 'aether:ambrosium_shard',
        E: 'betterend:eternal_crystal',
        S: 'arcane_horizons:spirit_bound_core',
        D: 'minecraft:dragon_breath',
        B: 'betterend:aeternium_ingot'
    }).id('arcane_horizons:expanded/dimensional_matrix')

    if (Platform.isLoaded('waystones')) {
        replaceShaped('waystones:waystone', [
            'SMS',
            'ODO',
            'SSS'
        ], {
            S: 'minecraft:stone_bricks',
            M: 'arcane_horizons:dimensional_matrix',
            O: 'minecraft:obsidian',
            D: 'arcane_horizons:spirit_bound_core'
        }, 'waystone')
    }

    if (Platform.isLoaded('productivemetalworks')) {
        replaceShaped('productivemetalworks:black_foundry_controller', [
            'SDS',
            'RCR',
            'SIS'
        ], {
            S: '#c:plates/steel',
            D: 'arcane_horizons:dimensional_matrix',
            R: 'arcane_horizons:resonant_core',
            C: 'createmetallurgy:industrial_crucible',
            I: 'arcane_horizons:industrial_control_unit'
        }, 'productive_metalworks_controller')
    }

    // -----------------------------------------------------------------
    // STORAGE CONVENIENCE WITHOUT LOGISTICS BYPASSES
    // -----------------------------------------------------------------
    if (Platform.isLoaded('sophisticatedbackpacks')) {
        replaceShaped('sophisticatedbackpacks:advanced_filter_upgrade', [
            ' R ',
            'FAF',
            ' B '
        ], {
            R: 'minecraft:redstone',
            F: 'sophisticatedbackpacks:filter_upgrade',
            A: 'arcane_horizons:arcane_actuator',
            B: 'create:brass_ingot'
        }, 'advanced_filter_upgrade')

        replaceShaped('sophisticatedbackpacks:stack_upgrade_tier_3', [
            'DID',
            'SCS',
            'DID'
        ], {
            D: 'minecraft:diamond_block',
            I: 'arcane_horizons:industrial_control_unit',
            S: 'sophisticatedbackpacks:stack_upgrade_tier_2',
            C: 'create:precision_mechanism'
        }, 'stack_upgrade_tier_3')
    }
})

