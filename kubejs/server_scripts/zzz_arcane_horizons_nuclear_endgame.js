// Arcane Horizons - Nuclear and draconic endgame
//
// Mekanism is deliberately post-dimensional technology. Its chemistry and
// reactors extend the pack, but its stock ore multiplication and convenience
// machines must not bypass the established Create/Occultism metallurgy ladder.

ServerEvents.recipes(event => {
    const replaceShaped = (output, pattern, key, id) => {
        const outputId = output.replace(/^\d+x\s+/, '')
        event.remove({ output: outputId })
        event.shaped(output, pattern, key).id(`arcane_horizons:endgame/${id}`)
    }

    // Extended Crafting stores every singularity type as a data component on
    // one shared item. Recipes must therefore match the component as well as
    // the base item or any singularity could be substituted for any other.
    const singularity = id => ({
        type: 'neoforge:components',
        items: 'extendedcrafting:singularity',
        components: { 'extendedcrafting:singularity_id': `extendedcrafting:${id}` }
    })

    const consumedSingularity = id => ({
        consume: true,
        ingredient: singularity(id)
    })

    if (Platform.isLoaded('pneumaticcraft')) {
        // PneumaticCraft is the steel-to-electronics bridge. The lossy bootstrap
        // explosion consumes steel; once the Pressure Chamber exists, its stock
        // 2-bar iron recipe provides the cheaper sustained route.
        event.remove({ id: 'pneumaticcraft:explosion_crafting/compressed_iron_ingot' })
        event.custom({
            type: 'pneumaticcraft:explosion_crafting',
            input: { count: 1, tag: 'c:ingots/steel' },
            loss_rate: 20,
            results: [{ count: 1, id: 'pneumaticcraft:ingot_iron_compressed' }]
        }).id('arcane_horizons:endgame/compressed_iron_from_steel')

        event.remove({ id: 'pneumaticcraft:explosion_crafting/compressed_iron_block' })
        event.custom({
            type: 'pneumaticcraft:explosion_crafting',
            input: { count: 1, tag: 'c:storage_blocks/steel' },
            loss_rate: 20,
            results: [{ count: 1, id: 'pneumaticcraft:compressed_iron_block' }]
        }).id('arcane_horizons:endgame/compressed_iron_block_from_steel')

        replaceShaped('pneumaticcraft:air_compressor', [
            'SSS',
            'S T',
            'MFS'
        ], {
            S: 'immersiveengineering:component_steel',
            T: 'pneumaticcraft:pressure_tube',
            M: 'create_new_age:basic_motor',
            F: 'minecraft:furnace'
        }, 'pneumatic_air_compressor')
    }

    if (Platform.isLoaded('createoreexcavation')) {
        // The add-on's stock veins are infinite metal/gem sources. Replace them
        // with finite industrial-mineral deposits so IE remains the bulk metal
        // mining branch and relocation/freight continue to matter.
        event.remove({ id: /^createoreexcavation:ore_vein_type\/.+$/ })
        event.remove({ id: /^createoreexcavation:drilling\/.+$/ })
        event.remove({ id: /^createoreexcavation:extractor\/.+$/ })

        const industrialVein = (id, name, icon, output, ticks, stress, salt) => {
            const veinId = `arcane_horizons:${id}_vein`
            event.recipes.createoreexcavation.vein(`{"text":"${name}"}`, icon)
                .placement(1024, 128, salt)
                .alwaysFinite()
                .veinSize(8, 16)
                .biomeWhitelist('minecraft:is_overworld')
                .id(veinId)
            event.recipes.createoreexcavation.drilling(output, veinId, ticks)
                .stress(stress)
                .id(`arcane_horizons:${id}_drilling`)
        }

        industrialVein('coal_seam', 'Industrial Coal Seam', 'minecraft:coal', 'minecraft:coal', 800, 512, 71930211)
        industrialVein('calcite_bed', 'Calcite Bed', 'minecraft:calcite', 'minecraft:calcite', 700, 512, 71930212)
        industrialVein('clay_bed', 'Deep Clay Bed', 'minecraft:clay_ball', 'minecraft:clay_ball', 600, 512, 71930213)
        industrialVein('quartz_lode', 'Quartz Lode', 'minecraft:quartz', 'minecraft:quartz', 1000, 768, 71930214)
        industrialVein('sulfur_bed', 'Sulfur Bed', 'immersiveengineering:dust_sulfur', 'immersiveengineering:dust_sulfur', 1200, 1024, 71930215)
        industrialVein('saltpeter_bed', 'Saltpeter Bed', 'immersiveengineering:dust_saltpeter', 'immersiveengineering:dust_saltpeter', 1200, 1024, 71930216)

        event.remove({ output: 'createoreexcavation:drilling_machine' })
        event.recipes.create.mechanical_crafting('createoreexcavation:drilling_machine', [
            'SPSPS',
            'PHMHP',
            'EBDBE',
            'PHMHP',
            'SPSPS'
        ], {
            S: '#c:plates/steel',
            P: 'pneumaticcraft:printed_circuit_board',
            H: 'immersiveengineering:heavy_engineering',
            M: 'create_new_age:advanced_motor',
            E: 'immersiveengineering:component_electronic_adv',
            B: 'create:brass_casing',
            D: 'create:mechanical_drill'
        }).id('arcane_horizons:endgame/industrial_drilling_machine')
    }

    if (Platform.isLoaded('mekanism')) {
        // Remove every stock raw ore/block -> Mekanism dust, clump, shard, or
        // slurry route. Mekanism remains a chemistry/nuclear branch; ores must
        // first pass through Arcane Horizons' prepared-feed progression.
        event.remove({ id: /^mekanism:processing\/.+\/(dust|clump|shard)\/from_(ore|raw_ore|raw_block)$/ })
        event.remove({ id: /^mekanism:processing\/.+\/slurry\/dirty\/from_(ore|raw_ore|raw_block)$/ })

        // Mekanism is a compact continuation of the established metallurgy
        // line, not an alternate raw-ore entrance. Only Rich Concentrates can
        // enter these machines. The machine/chemical tier then determines the
        // yield: Enrichment 2x, Purification 3x, Injection 4x, Dissolution 5x.
        // Zinc and silver stay in Create/IE because Mekanism has no native
        // clump, shard, slurry, or crystal chain for them.
        const mekanismMetals = ['copper', 'tin', 'iron', 'gold']
        mekanismMetals.forEach(metal => {
            const feed = { count: 1, item: `kubejs:rich_${metal}_concentrate` }

            event.custom({
                type: 'mekanism:enriching',
                input: feed,
                output: { count: 2, id: `mekanism:dust_${metal}` }
            }).id(`arcane_horizons:mekanism/${metal}_rich_2x`)

            event.custom({
                type: 'mekanism:purifying',
                chemical_input: { amount: 1, chemical: 'mekanism:oxygen' },
                item_input: feed,
                output: { count: 3, id: `mekanism:clump_${metal}` },
                per_tick_usage: true
            }).id(`arcane_horizons:mekanism/${metal}_rich_3x`)

            event.custom({
                type: 'mekanism:injecting',
                chemical_input: { amount: 1, chemical: 'mekanism:hydrogen_chloride' },
                item_input: feed,
                output: { count: 4, id: `mekanism:shard_${metal}` },
                per_tick_usage: true
            }).id(`arcane_horizons:mekanism/${metal}_rich_4x`)

            event.custom({
                type: 'mekanism:dissolution',
                chemical_input: { amount: 1, chemical: 'mekanism:sulfuric_acid' },
                item_input: feed,
                output: { amount: 1000, id: `mekanism:dirty_${metal}` },
                per_tick_usage: true
            }).id(`arcane_horizons:mekanism/${metal}_rich_5x`)
        })

        // Entry requires the post-End dimensional milestone plus established
        // IE, PneumaticCraft, and Create: New Age production facilities.
        replaceShaped('mekanism:metallurgic_infuser', [
            'HCH',
            'PDP',
            'AMA'
        ], {
            H: 'immersiveengineering:heavy_engineering',
            C: 'immersiveengineering:component_electronic_adv',
            P: 'pneumaticcraft:printed_circuit_board',
            D: 'arcane_horizons:dimensional_matrix',
            A: 'create_new_age:advanced_motor',
            M: '#c:ingots/osmium'
        }, 'mekanism_entry')

        // Every serious Mekanism machine continues to draw on the older
        // industrial districts instead of becoming a self-contained shortcut.
        replaceShaped('mekanism:steel_casing', [
            'SCS',
            'EHE',
            'SPS'
        ], {
            S: '#c:plates/steel',
            C: 'mekanism:basic_control_circuit',
            E: 'immersiveengineering:component_electronic_adv',
            H: 'immersiveengineering:heavy_engineering',
            P: 'pneumaticcraft:printed_circuit_board'
        }, 'mekanism_steel_casing')

        // The stock Heat Generator otherwise requires no Mekanism machinery
        // and would provide an early electrical bypass.
        if (Platform.isLoaded('mekanismgenerators')) {
            replaceShaped('mekanismgenerators:heat_generator', [
                'SGS',
                'CHC',
                'SMS'
            ], {
                S: '#c:plates/steel',
                G: 'create_new_age:generator_coil',
                C: 'mekanism:basic_control_circuit',
                H: 'immersiveengineering:component_electronic_adv',
                M: 'mekanism:steel_casing'
            }, 'mekanism_heat_generator')
        }

        // Teleportation, QIO, and entanglement are nuclear-era conveniences.
        // Gating their shared core prevents each downstream recipe from needing
        // another bespoke pack item.
        replaceShaped('mekanism:teleportation_core', [
            'AIA',
            'PDP',
            'AIA'
        ], {
            A: 'mekanism:alloy_atomic',
            I: 'occultism:iesnium_ingot',
            P: '#c:pellets/polonium',
            D: 'arcane_horizons:dimensional_matrix'
        }, 'mekanism_teleportation_core')

        // The Digital Miner is the capstone of the industrial singularities,
        // not a replacement for Create bores, IE excavators, or Occultism
        // mineshafts. Two antimatter pellets retain its post-SPS position.
        event.remove({ output: 'mekanism:digital_miner' })
        event.custom({
            type: 'minecraft:crafting_shaped',
            category: 'misc',
            pattern: [
                'TAT',
                'SBC',
                'EPR'
            ],
            key: {
                T: { item: 'mekanism:teleportation_core' },
                A: { tag: 'c:pellets/antimatter' },
                S: singularity('steel'),
                B: singularity('brass'),
                C: singularity('compressed_iron'),
                E: singularity('advanced_electronics'),
                P: singularity('pneumatic_pcb'),
                R: { item: 'mekanism:robit' }
            },
            result: { count: 1, id: 'mekanism:digital_miner' }
        }).id('arcane_horizons:endgame/mekanism_digital_miner')

        // High-speed handheld mining waits for fission and the existing
        // dimensional campaign; the Meka-Tool consequently remains later still.
        replaceShaped('mekanism:atomic_disassembler', [
            'UQU',
            'ADA',
            'UMU'
        ], {
            U: '#c:circuits/ultimate',
            Q: '#c:pellets/polonium',
            A: 'mekanism:alloy_atomic',
            D: 'arcane_horizons:dimensional_matrix',
            M: 'create_new_age:advanced_motor'
        }, 'mekanism_atomic_disassembler')

        if (Platform.isLoaded('mekanismgenerators')) {
            // The reactor shell remains a bulk recipe, but now consumes mature
            // IE structure and electronics as well as Mekanism's own casing.
            replaceShaped('4x mekanismgenerators:fission_reactor_casing', [
                'LBL',
                'BSB',
                'LBL'
            ], {
                L: '#c:ingots/lead',
                B: 'immersiveengineering:heavy_engineering',
                S: 'mekanism:steel_casing'
            }, 'mekanism_fission_casing')

            // Fusion requires demonstrated fission reprocessing rather than
            // only high-tier circuits.
            replaceShaped('mekanismgenerators:fusion_reactor_controller', [
                'UPU',
                'FCF',
                'URU'
            ], {
                U: '#c:circuits/ultimate',
                P: '#c:pellets/polonium',
                F: 'mekanismgenerators:fusion_reactor_frame',
                C: 'mekanism:ultimate_chemical_tank',
                R: '#c:pellets/plutonium'
            }, 'mekanism_fusion_controller')

            // At least one extra fusion controller is invested in the SPS port,
            // enforcing the fission -> fusion -> antimatter construction order.
            replaceShaped('mekanism:sps_port', [
                'SUS',
                'SFS',
                'SUS'
            ], {
                S: 'mekanism:sps_casing',
                U: '#c:circuits/ultimate',
                F: 'mekanismgenerators:fusion_reactor_controller'
            }, 'mekanism_sps_port')
        }
    }

    if (Platform.isLoaded('extendedcrafting') && Platform.isLoaded('mekanism')) {
        // Singularity production begins only after fission/fusion components.
        replaceShaped('extendedcrafting:compressor', [
            'SUS',
            'PFP',
            'SCS'
        ], {
            S: 'mekanism:sps_casing',
            U: '#c:circuits/ultimate',
            P: '#c:pellets/polonium',
            F: 'mekanismgenerators:fusion_reactor_controller',
            C: 'pneumaticcraft:printed_circuit_board'
        }, 'quantum_compressor')

        // The 9x9 table is an antimatter-era machine. The compressor can be
        // built earlier so factories can accumulate singularities in parallel.
        replaceShaped('extendedcrafting:ultimate_table', [
            'AUA',
            'CDC',
            'AEA'
        ], {
            A: '#c:pellets/antimatter',
            U: '#c:circuits/ultimate',
            C: 'extendedcrafting:elite_table',
            D: 'arcane_horizons:dimensional_matrix',
            E: 'draconicevolution:draconium_core'
        }, 'ultimate_crafting_table')
    }

    if (Platform.isLoaded('draconicevolution') && Platform.isLoaded('mekanism')) {
        // Basic Draconic infrastructure begins after fission.
        replaceShaped('draconicevolution:draconium_core', [
            'DUD',
            'UPU',
            'DUD'
        ], {
            D: '#c:ingots/draconium',
            U: '#c:circuits/ultimate',
            P: '#c:pellets/polonium'
        }, 'draconium_core')

        // Wyvern technology is the first antimatter consumer.
        replaceShaped('draconicevolution:wyvern_core', [
            'BNB',
            'CAC',
            'BNB'
        ], {
            B: '#c:storage_blocks/draconium',
            N: '#c:nether_stars',
            C: 'draconicevolution:draconium_core',
            A: '#c:pellets/antimatter'
        }, 'wyvern_core')

        // Awakened technology condenses every major magical/industrial branch
        // and one full Ultimate Singularity under a billion-FE fusion operation.
        event.remove({ output: 'draconicevolution:awakened_core' })
        event.custom({
            type: 'draconicevolution:fusion_crafting',
            catalyst: { item: 'extendedcrafting:ultimate_singularity' },
            ingredients: [
                { consume: true, ingredient: { item: 'draconicevolution:wyvern_core' } },
                { consume: true, ingredient: { item: 'draconicevolution:wyvern_core' } },
                { consume: true, ingredient: { tag: 'c:ingots/draconium_awakened' } },
                { consume: true, ingredient: { tag: 'c:ingots/draconium_awakened' } },
                { consume: true, ingredient: { item: 'ars_nouveau:source_gem_block' } },
                { consume: true, ingredient: { item: 'ars_nouveau:source_gem_block' } },
                { consume: true, ingredient: { item: 'hexerei:moon_dust' } },
                { consume: true, ingredient: { item: 'occultism:spirit_attuned_gem' } },
                { consume: true, ingredient: { item: 'kubejs:mythic_metallurgical_catalyst' } },
                { consume: true, ingredient: { item: 'mekanism:pellet_antimatter' } },
                { consume: true, ingredient: { item: 'minecraft:dragon_breath' } },
                { consume: true, ingredient: { item: 'arcane_horizons:dimensional_matrix' } },
                consumedSingularity('source'),
                consumedSingularity('spirit_attunement'),
                consumedSingularity('aureal')
            ],
            result: { count: 1, id: 'draconicevolution:awakened_core' },
            techLevel: 'wyvern',
            totalEnergy: 1000000000
        }).id('arcane_horizons:endgame/awakened_core')

        // Chaotic technology is deliberately repeat-expensive: another full
        // singularity, four antimatter pellets, Chaos Guardian materials, and
        // the maximum safe signed-int fusion energy cost.
        event.remove({ output: 'draconicevolution:chaotic_core' })
        event.custom({
            type: 'draconicevolution:fusion_crafting',
            catalyst: { item: 'draconicevolution:chaos_shard' },
            ingredients: [
                { consume: true, ingredient: { item: 'draconicevolution:awakened_core' } },
                { consume: true, ingredient: { item: 'draconicevolution:awakened_core' } },
                { consume: true, ingredient: { item: 'draconicevolution:awakened_core' } },
                { consume: true, ingredient: { item: 'draconicevolution:awakened_core' } },
                { consume: true, ingredient: { item: 'extendedcrafting:ultimate_singularity' } },
                { consume: true, ingredient: { item: 'mekanism:pellet_antimatter' } },
                { consume: true, ingredient: { item: 'mekanism:pellet_antimatter' } },
                { consume: true, ingredient: { item: 'mekanism:pellet_antimatter' } },
                { consume: true, ingredient: { item: 'mekanism:pellet_antimatter' } },
                { consume: true, ingredient: { item: 'draconicevolution:large_chaos_frag' } },
                { consume: true, ingredient: { item: 'draconicevolution:large_chaos_frag' } },
                { consume: true, ingredient: { item: 'kubejs:mythic_metallurgical_catalyst' } },
                consumedSingularity('flux_power'),
                consumedSingularity('ultimate_circuit'),
                consumedSingularity('antimatter')
            ],
            result: { count: 1, id: 'draconicevolution:chaotic_core' },
            techLevel: 'draconic',
            totalEnergy: 2000000000
        }).id('arcane_horizons:endgame/chaotic_core')
    }
})

