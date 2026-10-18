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
    event.shaped('8x arcane_horizons:twilight_core', [
        'NSN',
        'SLS',
        'NSN'
    ], {
        N: 'twilightforest:naga_scale',
        S: '#c:plates/steel',
        L: 'twilightforest:lich_trophy'
    }).id('arcane_horizons:expanded/twilight_core')

    // -----------------------------------------------------------------
    // ARCANE II + BRASS AUTOMATION
    // -----------------------------------------------------------------
    event.shaped('2x arcane_horizons:arcane_actuator', [
        'TST',
        'CBC',
        'TMT'
    ], {
        T: 'arcane_horizons:twilight_core',
        S: 'ars_nouveau:source_gem',
        C: 'create:brass_casing',
        B: 'create:electron_tube',
        M: 'hexerei:moon_dust'
    }).id('arcane_horizons:expanded/arcane_actuator')

    event.shaped('arcane_horizons:enchanted_machine_frame', [
        'SMS',
        'PAP',
        'STS'
    ], {
        S: '#c:plates/steel',
        M: 'hexerei:moon_dust',
        P: 'ars_nouveau:source_gem',
        A: 'arcane_horizons:arcane_actuator',
        T: 'arcane_horizons:twilight_core'
    }).id('arcane_horizons:expanded/enchanted_machine_frame')

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
    event.shaped('arcane_horizons:industrial_control_unit', [
        'SPS',
        'AEA',
        'SRS'
    ], {
        S: '#c:plates/steel',
        P: 'create:precision_mechanism',
        A: 'arcane_horizons:arcane_actuator',
        E: 'arcane_horizons:enchanted_machine_frame',
        R: 'minecraft:redstone_block'
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
    event.shaped('8x arcane_horizons:resonant_core', [
        'TST',
        'SWS',
        'TST'
    ], {
        T: 'arcane_horizons:twilight_core',
        S: 'ars_nouveau:source_gem_block',
        W: 'mowziesmobs:wrought_axe'
    }).id('arcane_horizons:expanded/resonant_core')

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
    event.shaped('arcane_horizons:flight_control_assembly', [
        'FCF',
        'IRI',
        'FEF'
    ], {
        F: 'twilightforest:knightmetal_ingot',
        C: 'createaddition:capacitor',
        I: 'arcane_horizons:industrial_control_unit',
        R: 'arcane_horizons:resonant_core',
        E: 'immersiveengineering:heavy_engineering'
    }).id('arcane_horizons:expanded/flight_control_assembly')

    if (Platform.isLoaded('sable_ships')) {
        replaceShaped('sable_ships:ship_engine', [
            'SES',
            'AFA',
            'SCS'
        ], {
            S: 'create:sturdy_sheet',
            E: 'createaddition:electric_motor',
            A: 'create:andesite_alloy',
            F: 'arcane_horizons:flight_control_assembly',
            C: 'arcane_horizons:industrial_control_unit'
        }, 'sable_ship_engine')
    }

    // -----------------------------------------------------------------
    // LATE DIMENSIONS, TELEPORTATION, AND ENDGAME INDUSTRY
    // -----------------------------------------------------------------
    event.shaped('arcane_horizons:spirit_bound_core', [
        'OMO',
        'MFM',
        'ORO'
    ], {
        O: 'occultism:spirit_attuned_gem',
        M: 'hexerei:moon_dust',
        F: 'arcane_horizons:enchanted_machine_frame',
        R: 'arcane_horizons:resonant_core'
    }).id('arcane_horizons:expanded/spirit_bound_core')

    event.shaped('arcane_horizons:dimensional_matrix', [
        'AEA',
        'SDS',
        'BEB'
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

