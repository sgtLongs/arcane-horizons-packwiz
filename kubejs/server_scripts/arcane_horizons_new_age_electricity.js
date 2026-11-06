// Arcane Horizons - Create electricity consolidation
//
// Create: New Age owns generation, motors, wiring, and transmission.
// Create Crafts & Additions remains installed for useful machines and components,
// but its parallel power-conversion and cable recipes are deliberately disabled.

// Requires steel production before the first practical electrical network. This
// keeps electricity after the pack's slow, machinery-heavy iron/steel stage.

ServerEvents.recipes(event => {
    if (!Platform.isLoaded('create_new_age') || !Platform.isLoaded('createaddition')) return

    const disableCreateAdditionPath = [
        'createaddition:alternator',
        'createaddition:electric_motor',
        'createaddition:connector',
        'createaddition:large_connector',
        'createaddition:small_light_connector',
        'createaddition:redstone_relay',
        'createaddition:copper_spool',
        'createaddition:electrum_spool',
        'createaddition:gold_spool',
        'createaddition:festive_spool'
    ]

    disableCreateAdditionPath.forEach(item => event.remove({ output: item }))

    // New Age entry equipment: eight steel plates total for a working generator
    // and motor, with coke-based brushes preserving the steel-industry dependency.
    event.remove({ output: 'create_new_age:generator_coil' })
    event.shaped('create_new_age:generator_coil', [
        'CSC',
        'SAS',
        'CSC'
    ], {
        C: 'minecraft:copper_ingot',
        S: '#c:plates/steel',
        A: 'create:andesite_alloy_block'
    }).id('arcane_horizons:electricity/new_age_generator_coil')

    event.remove({ output: 'create_new_age:carbon_brushes' })
    event.shaped('create_new_age:carbon_brushes', [
        'ACA',
        ' S ',
        'ACA'
    ], {
        A: 'create:andesite_alloy',
        C: '#c:dusts/coal_coke',
        S: 'create:shaft'
    }).id('arcane_horizons:electricity/new_age_carbon_brushes')

    event.remove({ output: 'create_new_age:basic_motor' })
    event.shaped('create_new_age:basic_motor', [
        'PWP',
        'MCS',
        'PWP'
    ], {
        P: '#c:plates/steel',
        W: 'create_new_age:copper_wire',
        M: 'create_new_age:magnetite_block',
        C: 'create:andesite_casing',
        S: 'create:shaft'
    }).id('arcane_horizons:electricity/new_age_basic_motor')

    event.remove({ output: 'create_new_age:electrical_connector' })
    event.shaped('2x create_new_age:electrical_connector', [
        ' W ',
        'PAP',
        ' W '
    ], {
        W: 'create_new_age:copper_wire',
        P: 'create:copper_sheet',
        A: 'create:andesite_alloy'
    }).id('arcane_horizons:electricity/new_age_electrical_connector')

    // Preserve the distinctive C&A utility machines, but place them on New Age's
    // electrical component ladder instead of its removed motor/cable ladder.
    event.remove({ output: 'createaddition:modular_accumulator' })
    event.shaped('createaddition:modular_accumulator', [
        ' E ',
        'CBC',
        ' W '
    ], {
        E: 'create_new_age:electrical_connector',
        C: 'createaddition:capacitor',
        B: 'create:brass_casing',
        W: 'create_new_age:copper_circuit'
    }).id('arcane_horizons:electricity/createaddition_modular_accumulator')

    event.remove({ output: 'createaddition:portable_energy_interface' })
    event.shapeless('createaddition:portable_energy_interface', [
        'create:brass_casing',
        'create:chute',
        'create_new_age:electrical_connector',
        'create_new_age:copper_circuit'
    ]).id('arcane_horizons:electricity/createaddition_portable_energy_interface')

    event.remove({ output: 'createaddition:servo_motor' })
    event.shapeless('createaddition:servo_motor', [
        'create:mechanical_bearing',
        'create_new_age:advanced_motor',
        'create:electron_tube'
    ]).id('arcane_horizons:electricity/createaddition_servo_motor')

    event.remove({ output: 'createaddition:tesla_coil' })
    event.recipes.create.mechanical_crafting('createaddition:tesla_coil', [
        'WWW',
        ' E ',
        'CBC',
        'PTP'
    ], {
        W: 'create_new_age:copper_wire_block',
        E: 'create_new_age:electrical_connector',
        C: 'createaddition:capacitor',
        B: 'create:brass_casing',
        P: 'create:brass_sheet',
        T: 'create:electron_tube'
    }).id('arcane_horizons:electricity/createaddition_tesla_coil')
})
