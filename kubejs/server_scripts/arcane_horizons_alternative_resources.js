// Arcane Horizons - Alternative resource infrastructure
//
// Alternative systems are encouraged as specialist extraction facilities, but
// they do not replace the pack's first-time mining and processing progression.
// Productive Bees therefore becomes scalable only after the conventional
// metallurgy, precision, pneumatic, and dimensional facilities already exist.

ServerEvents.recipes(event => {
    if (Platform.isLoaded('productivebees')) {
        // Controlled breeding begins after the Twilight/Ars automation gate.
        event.remove({ id: 'productivebees:breeding_chamber' })
        event.shaped('productivebees:breeding_chamber', [
            'GCG',
            'BAB',
            'SIS'
        ], {
            G: 'minecraft:glass',
            C: 'productivebees:sturdy_bee_cage',
            B: 'productivebees:wax_block',
            A: 'arcane_horizons:arcane_actuator',
            S: '#c:plates/steel',
            I: 'create:electron_tube'
        }).id('arcane_horizons:alternative_resources/breeding_chamber')

        // The basic centrifuge is intentionally midgame. Bees can be developed
        // earlier, but cannot replace the primitive foundry or first ironworks.
        event.remove({ id: 'productivebees:centrifuge' })
        event.shaped('productivebees:centrifuge', [
            'BCB',
            'RIR',
            'BMB'
        ], {
            B: 'create:brass_sheet',
            C: 'productivebees:configurable_comb',
            R: 'create:rotation_speed_controller',
            I: 'arcane_horizons:industrial_control_unit',
            M: 'create:mechanical_mixer'
        }).id('arcane_horizons:alternative_resources/centrifuge')

        // Comb-block throughput belongs beside the pneumatic and IE districts.
        event.remove({ id: 'productivebees:heated_centrifuge' })
        event.shaped('productivebees:heated_centrifuge', [
            'PHP',
            'CIC',
            'PBP'
        ], {
            P: 'pneumaticcraft:printed_circuit_board',
            H: 'immersiveengineering:heavy_engineering',
            C: 'productivebees:centrifuge',
            I: 'arcane_horizons:industrial_control_unit',
            B: 'create:blaze_burner'
        }).id('arcane_horizons:alternative_resources/heated_centrifuge')

        // The high-throughput powered machine is a post-dimensional support
        // facility for nuclear and singularity production, not an early mine.
        ;[
            'productivebees:powered_centrifuge/vanilla',
            'productivebees:powered_centrifuge/mekanism',
            'productivebees:powered_centrifuge/silents_mechanisms',
            'productivebees:powered_centrifuge/thermal'
        ].forEach(id => event.remove({ id: id }))
        event.shaped('productivebees:powered_centrifuge', [
            'AMA',
            'CDC',
            'PSP'
        ], {
            A: 'create_new_age:advanced_motor',
            M: 'mekanism:steel_casing',
            C: 'mekanism:advanced_control_circuit',
            D: 'arcane_horizons:dimensional_matrix',
            P: 'pneumaticcraft:printed_circuit_board',
            S: 'productivebees:heated_centrifuge'
        }).id('arcane_horizons:alternative_resources/powered_centrifuge')
    }

    if (Platform.isLoaded('occultism')) {
        // Occultism miners remain a valid magical alternative for bulk raw
        // material. Ancient debris is the exception: producing it from a miner
        // would bypass the Nether expedition and debris-mining challenge.
        event.remove({ id: 'occultism:miner/eldritch/ancient_debris' })
    }
})
