// Arcane Horizons Expert Metallurgy v0.3.1
// Minecraft 1.21.1 / NeoForge / Create 6.0.10
// Create Metallurgy 1.0.3 / Create Ironworks 4.0.3 / KubeJS Create
//
// Yield ladder:
//   Primitive copper      4 raw -> 1 ingot
//   Primitive tin         5 raw -> 1 ingot
//   Primitive zinc        4 raw -> 1 ingot
//   Early foundry Cu/Tin  3 raw -> 1 ingot
//   First iron            6 raw -> 1 ingot
//   Established iron      3 raw -> 1 ingot
//   Nether metallurgy     2 raw -> 1 ingot
//   Mature industry       1 raw -> 1 ingot
//   Industrial recovery   1 raw -> 1.5 ingots
//   Advanced recovery     1 raw -> 2 ingots
//   Endgame recovery      1 raw -> 3 ingots

ServerEvents.recipes(event => {
    var removeOutput = output => event.remove({ output: output })
    var replaceShaped = (output, pattern, key, id) => {
        event.remove({ output: output })
        event.shaped(output, pattern, key).id(id || `arcane_horizons:expert_metallurgy/${output.replace(':', '_')}`)
    }
    var replaceShapeless = (output, inputs, id) => {
        event.remove({ output: output })
        event.shapeless(output, inputs).id(id || `arcane_horizons:expert_metallurgy/${output.replace(':', '_')}`)
    }
    var removeFurnaceMetal = output => {
        event.remove({ type: 'minecraft:smelting', output: output })
        event.remove({ type: 'minecraft:blasting', output: output })
    }
    var cmMelt = (id, input, outputs, heat, time) => {
        var r = event.recipes.createmetallurgy.melting(outputs, input).processingTime(time || 100)
        if (heat === 'heated') r = r.heated()
        if (heat === 'superheated') r = r.superheated()
        return r.id(`arcane_horizons:metallurgy/${id}`)
    }
    var cmCast = (id, output, fluid, amount, time) =>
        event.recipes.createmetallurgy
            .casting_in_table(output, [Fluid.of(fluid, amount), 'createmetallurgy:graphite_ingot_mold'])
            .processingTime(time || 80)
            .id(`arcane_horizons:metallurgy/${id}`)

    // =====================================================================
    // 0. QUEST BOOK
    // =====================================================================
    event.remove({ output: 'ftbquests:book' })
    event.shapeless('ftbquests:book', ['minecraft:book', 'minecraft:charcoal'])
        .id('arcane_horizons:expert_metallurgy/quest_book')

    // =====================================================================
    // 1. PRIMITIVE FIRE AGE
    // =====================================================================
    removeOutput('minecraft:furnace')

    // Primitive kiln/cooking operations. Metal requires charges; raw ore itself does not cook.
    event.campfireCooking('minecraft:charcoal', '#minecraft:logs', 0.1, 600)
        .id('arcane_horizons:expert_metallurgy/campfire_charcoal')
    event.campfireCooking('minecraft:stone', 'minecraft:cobblestone', 0.0, 500)
        .id('arcane_horizons:expert_metallurgy/campfire_stone')
    event.campfireCooking('minecraft:brick', 'minecraft:clay_ball', 0.1, 500)
        .id('arcane_horizons:expert_metallurgy/campfire_brick')
    event.campfireCooking('minecraft:glass', 'minecraft:sand', 0.1, 700)
        .id('arcane_horizons:expert_metallurgy/campfire_glass')

    event.shapeless('kubejs:primitive_copper_charge', [
        'minecraft:raw_copper','minecraft:raw_copper','minecraft:raw_copper','minecraft:raw_copper',
        'minecraft:charcoal','minecraft:clay_ball'
    ]).id('arcane_horizons:metallurgy/primitive_copper_charge')
    event.campfireCooking('minecraft:copper_ingot', 'kubejs:primitive_copper_charge', 0.3, 1200)
        .id('arcane_horizons:metallurgy/primitive_copper')

    event.shapeless('kubejs:primitive_tin_charge', [
        'create_ironworks:raw_tin','create_ironworks:raw_tin','create_ironworks:raw_tin',
        'create_ironworks:raw_tin','create_ironworks:raw_tin',
        'minecraft:charcoal','minecraft:clay_ball'
    ]).id('arcane_horizons:metallurgy/primitive_tin_charge')
    event.campfireCooking('create_ironworks:tin_ingot', 'kubejs:primitive_tin_charge', 0.3, 1400)
        .id('arcane_horizons:metallurgy/primitive_tin')

    event.shapeless('kubejs:primitive_zinc_charge', [
        'create:raw_zinc','create:raw_zinc','create:raw_zinc','create:raw_zinc',
        'minecraft:charcoal','minecraft:clay_ball'
    ]).id('arcane_horizons:metallurgy/primitive_zinc_charge')
    event.campfireCooking('create:zinc_ingot', 'kubejs:primitive_zinc_charge', 0.3, 1200)
        .id('arcane_horizons:metallurgy/primitive_zinc')

    // No ordinary furnace route for the core metals.
    ;['minecraft:copper_ingot','create_ironworks:tin_ingot','create:zinc_ingot','minecraft:iron_ingot','minecraft:gold_ingot']
        .forEach(removeFurnaceMetal)

    // Remove Create's easy raw -> crushed paths. Arcane Horizons uses poor powders instead.
    ;['create:crushed_raw_copper','create:crushed_raw_zinc','create:crushed_raw_iron','create:crushed_raw_gold','create_ironworks:crushed_raw_tin']
        .forEach(removeOutput)

    event.recipes.create.milling('kubejs:poor_copper_powder', 'minecraft:raw_copper').processingTime(250)
        .id('arcane_horizons:metallurgy/mill_poor_copper')
    event.recipes.create.milling('kubejs:poor_tin_powder', 'create_ironworks:raw_tin').processingTime(250)
        .id('arcane_horizons:metallurgy/mill_poor_tin')
    event.recipes.create.milling('kubejs:poor_zinc_powder', 'create:raw_zinc').processingTime(250)
        .id('arcane_horizons:metallurgy/mill_poor_zinc')
    event.recipes.create.milling('kubejs:poor_iron_powder', 'minecraft:raw_iron').processingTime(300)
        .id('arcane_horizons:metallurgy/mill_poor_iron')
    event.recipes.create.milling('kubejs:poor_gold_powder', 'minecraft:raw_gold').processingTime(300)
        .id('arcane_horizons:metallurgy/mill_poor_gold')

    // Remove default Create Metallurgy routes that would yield close to 1:1 immediately.
    var easyMeltInputs = [
        'minecraft:raw_copper','minecraft:copper_ore','minecraft:deepslate_copper_ore','create:crushed_raw_copper',
        'create_ironworks:raw_tin','create_ironworks:tin_ore','create_ironworks:deepslate_tin_ore','create_ironworks:crushed_raw_tin',
        'create:raw_zinc','create:zinc_ore','create:deepslate_zinc_ore','create:crushed_raw_zinc',
        'minecraft:raw_iron','minecraft:iron_ore','minecraft:deepslate_iron_ore','create:crushed_raw_iron',
        'minecraft:raw_gold','minecraft:gold_ore','minecraft:deepslate_gold_ore','create:crushed_raw_gold'
    ]
    easyMeltInputs.forEach(input => {
        event.remove({ type: 'createmetallurgy:melting', input: input })
        event.remove({ type: 'createmetallurgy:bulk_melting', input: input })
        event.remove({ type: 'createmetallurgy:grinding', input: input })
    })

    // Remove Ironworks' convenient Create alloying shortcuts for Bronze/Steel.
    event.remove({ type: 'create:mixing', output: 'create_ironworks:bronze_ingot' })
    event.remove({ type: 'create:compacting', output: 'create_ironworks:bronze_ingot' })
    event.remove({ type: 'create:mixing', output: 'create_ironworks:steel_ingot' })
    event.remove({ type: 'create:compacting', output: 'create_ironworks:steel_ingot' })

    // If Productive Metalworks is already in the pack source, block its raw-ore 2x/3x bypass.
    if (Platform.isLoaded('productivemetalworks')) {
        ;['minecraft:raw_copper','create_ironworks:raw_tin','create:raw_zinc','minecraft:raw_iron','minecraft:raw_gold']
            .forEach(input => event.remove({ type: 'productivemetalworks:item_melting', input: input }))
        ;['#c:ores/copper','#c:ores/tin','#c:ores/zinc','#c:ores/iron','#c:ores/gold']
            .forEach(input => event.remove({ type: 'productivemetalworks:item_melting', input: input }))

        var pmColors = ['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black']
        pmColors.forEach(color => removeOutput(`productivemetalworks:${color}_foundry_controller`))
        event.shaped('productivemetalworks:black_foundry_controller', [
            'SPS',
            'ICI',
            'SAS'
        ], {
            S: '#c:plates/steel', P: 'create:precision_mechanism',
            I: 'create:iron_sheet', C: 'createmetallurgy:industrial_crucible',
            A: 'ars_nouveau:source_gem'
        }).id('arcane_horizons:metallurgy/late_productive_metalworks_controller')
    }

    // =====================================================================
    // 2. EARLY CHIPPED / SETTLEMENT BUILDING
    // =====================================================================
    var chippedBenches = [
        'chipped:alchemy_bench','chipped:botanist_workbench','chipped:carpenters_table',
        'chipped:glassblower','chipped:loom_table','chipped:mason_table','chipped:tinkering_table'
    ]
    chippedBenches.forEach(removeOutput)

    event.shaped('chipped:carpenters_table', ['PCP','PWP','PPP'], {
        P:'#minecraft:planks', C:'minecraft:copper_ingot', W:'minecraft:crafting_table'
    }).id('arcane_horizons:expert_metallurgy/chipped_carpenters')
    event.shaped('chipped:mason_table', ['SCS','PWP','PPP'], {
        S:'minecraft:cobblestone', C:'minecraft:copper_ingot', P:'#minecraft:planks', W:'minecraft:crafting_table'
    }).id('arcane_horizons:expert_metallurgy/chipped_mason')
    event.shaped('chipped:botanist_workbench', ['PCP','PFP','PPP'], {
        P:'#minecraft:planks', C:'minecraft:copper_ingot', F:'minecraft:flower_pot'
    }).id('arcane_horizons:expert_metallurgy/chipped_botanist')
    event.shaped('chipped:glassblower', ['GCG','PFP','PPP'], {
        G:'minecraft:glass', C:'minecraft:copper_ingot', P:'#minecraft:planks', F:'minecraft:campfire'
    }).id('arcane_horizons:expert_metallurgy/chipped_glassblower')
    event.shaped('chipped:loom_table', ['SCS','PLP','PPP'], {
        S:'minecraft:string', C:'minecraft:copper_ingot', P:'#minecraft:planks', L:'minecraft:loom'
    }).id('arcane_horizons:expert_metallurgy/chipped_loom')
    event.shaped('chipped:alchemy_bench', ['BCB','PWP','PPP'], {
        B:'minecraft:glass_bottle', C:'minecraft:copper_ingot', P:'#minecraft:planks', W:'minecraft:crafting_table'
    }).id('arcane_horizons:expert_metallurgy/chipped_alchemy')
    event.shaped('chipped:tinkering_table', ['FCF','PWP','PPP'], {
        F:'minecraft:flint', C:'minecraft:copper_ingot', P:'#minecraft:planks', W:'minecraft:crafting_table'
    }).id('arcane_horizons:expert_metallurgy/chipped_tinkering')

    // =====================================================================
    // 3. MECHANICAL FOUNDATIONS - STILL PRE-BRONZE
    // =====================================================================
    event.shaped('kubejs:primitive_drive_belt', ['LDL','S S','LDL'], {
        L:'minecraft:leather', D:'minecraft:dried_kelp', S:'minecraft:string'
    }).id('arcane_horizons:expert_metallurgy/primitive_drive_belt')

    // Copper-era press: expensive, but not 18 ingots worth of pure grind.
    replaceShaped('create:mechanical_press', [' S ',' C ','IDI'], {
        S:'create:shaft', C:'create:andesite_casing', I:'minecraft:copper_ingot', D:'kubejs:primitive_drive_belt'
    }, 'arcane_horizons:expert_metallurgy/copper_mechanical_press')

    // =====================================================================
    // 4. CREATE METALLURGY FOUNDRY - COPPER/TIN ERA
    // =====================================================================
    replaceShaped('createmetallurgy:foundry_basin', ['BCB','BAB','BBB'], {
        B:'minecraft:bricks', C:'minecraft:copper_ingot', A:'create:andesite_alloy'
    }, 'arcane_horizons:metallurgy/foundry_basin')
    replaceShaped('createmetallurgy:casting_table', [' C ','BBB',' A '], {
        C:'minecraft:copper_ingot', B:'minecraft:brick', A:'create:andesite_alloy'
    }, 'arcane_horizons:metallurgy/casting_table')
    replaceShaped('createmetallurgy:faucet', [' C ','CBC',' C '], {
        C:'minecraft:copper_ingot', B:'minecraft:brick'
    }, 'arcane_horizons:metallurgy/faucet')
    replaceShaped('createmetallurgy:foundry_lid', ['CCC','BAB'], {
        C:'minecraft:copper_ingot', B:'minecraft:brick', A:'create:andesite_alloy'
    }, 'arcane_horizons:metallurgy/foundry_lid')
    replaceShaped('createmetallurgy:foundry_mixer', [' G ',' A ','CDC'], {
        G:'create:cogwheel', A:'create:andesite_casing', C:'minecraft:copper_ingot', D:'kubejs:primitive_drive_belt'
    }, 'arcane_horizons:metallurgy/foundry_mixer')
    replaceShaped('createmetallurgy:graphite_ingot_mold', ['CCC','CLC','CCC'], {
        C:'minecraft:charcoal', L:'minecraft:clay_ball'
    }, 'arcane_horizons:metallurgy/graphite_ingot_mold')

    // First real foundry efficiency: 3 raw -> 1 ingot (30 mB per raw, 90 mB per cast).
    cmMelt('poor_copper', 'kubejs:poor_copper_powder', [
        Fluid.of('createmetallurgy:molten_copper', 30), Fluid.of('createmetallurgy:molten_slag', 30)
    ], 'none', 120)
    cmMelt('poor_tin', 'kubejs:poor_tin_powder', [
        Fluid.of('createmetallurgy:molten_tin', 30), Fluid.of('createmetallurgy:molten_slag', 30)
    ], 'none', 140)
    cmMelt('poor_zinc', 'kubejs:poor_zinc_powder', [
        Fluid.of('createmetallurgy:molten_zinc', 30), Fluid.of('createmetallurgy:molten_slag', 30)
    ], 'none', 140)

    cmCast('cast_copper_ingot', 'minecraft:copper_ingot', 'createmetallurgy:molten_copper', 90, 80)
    cmCast('cast_tin_ingot', 'create_ironworks:tin_ingot', 'createmetallurgy:molten_tin', 90, 90)
    cmCast('cast_zinc_ingot', 'create:zinc_ingot', 'createmetallurgy:molten_zinc', 90, 90)
    cmCast('cast_iron_ingot', 'minecraft:iron_ingot', 'createmetallurgy:molten_iron', 90, 100)
    cmCast('cast_gold_ingot', 'minecraft:gold_ingot', 'createmetallurgy:molten_gold', 90, 100)
    cmCast('cast_bronze_ingot', 'create_ironworks:bronze_ingot', 'createmetallurgy:molten_bronze', 90, 100)

    // Bronze is deliberately a large foundry batch: 3 parts copper / 1 part tin.
    event.recipes.createmetallurgy.alloying(
        Fluid.of('createmetallurgy:molten_bronze', 360),
        [Fluid.of('createmetallurgy:molten_copper', 270), Fluid.of('createmetallurgy:molten_tin', 90)]
    ).processingTime(240).id('arcane_horizons:metallurgy/bronze_alloy')

    event.recipes.create.pressing('create_ironworks:bronze_sheet', 'create_ironworks:bronze_ingot')
        .id('arcane_horizons:metallurgy/bronze_sheet')

    // Bronze is a real prerequisite for the Mixer and therefore for iron reduction chemistry.
    replaceShaped('create:whisk', [' A ','BBB',' B '], {
        A:'create:andesite_alloy', B:'create_ironworks:bronze_sheet'
    }, 'arcane_horizons:expert_metallurgy/bronze_whisk')
    replaceShaped('create:mechanical_mixer', [' G ',' C ','DWD'], {
        G:'create:cogwheel', C:'create:andesite_casing', W:'create:whisk', D:'kubejs:primitive_drive_belt'
    }, 'arcane_horizons:expert_metallurgy/bronze_mechanical_mixer')

    // =====================================================================
    // 5. IRON AGE - FIRST IRON IS SIX RAW PER INGOT
    // =====================================================================
    event.recipes.create.mixing('kubejs:iron_bloom_charge', [
        'kubejs:poor_iron_powder','kubejs:poor_iron_powder','kubejs:poor_iron_powder',
        'kubejs:poor_iron_powder','kubejs:poor_iron_powder','kubejs:poor_iron_powder',
        'minecraft:charcoal','minecraft:calcite','minecraft:clay_ball'
    ]).id('arcane_horizons:metallurgy/iron_bloom_charge')

    // 6 raw iron -> 1 bloom charge -> exactly 90 mB iron, plus heavy slag.
    cmMelt('first_iron_bloom', 'kubejs:iron_bloom_charge', [
        Fluid.of('createmetallurgy:molten_iron', 90), Fluid.of('createmetallurgy:molten_slag', 270)
    ], 'none', 360)

    event.recipes.create.pressing('create:iron_sheet', 'minecraft:iron_ingot')
        .id('arcane_horizons:metallurgy/iron_sheet')

    // First iron should be invested in a Fan. Washing halves the ore cost from 6:1 to 3:1.
    event.recipes.create.splashing('kubejs:washed_iron_concentrate', 'kubejs:poor_iron_powder')
        .id('arcane_horizons:metallurgy/wash_iron_concentrate')
    event.recipes.create.mixing('kubejs:refined_iron_charge', [
        'kubejs:washed_iron_concentrate','minecraft:charcoal','minecraft:calcite'
    ]).id('arcane_horizons:metallurgy/refined_iron_charge')
    cmMelt('established_iron', 'kubejs:refined_iron_charge', [
        Fluid.of('createmetallurgy:molten_iron', 30), Fluid.of('createmetallurgy:molten_slag', 20)
    ], 'none', 160)

    // Washing also improves non-ferrous metal recovery from 3:1 to 2:1.
    ;[
        ['copper','kubejs:poor_copper_powder','kubejs:washed_copper_concentrate'],
        ['tin','kubejs:poor_tin_powder','kubejs:washed_tin_concentrate'],
        ['gold','kubejs:poor_gold_powder','kubejs:washed_gold_concentrate']
    ].forEach(([metal, input, output]) => {
        event.recipes.create.splashing(output, input).id(`arcane_horizons:metallurgy/wash_${metal}`)
    })
    cmMelt('washed_copper', 'kubejs:washed_copper_concentrate', [Fluid.of('createmetallurgy:molten_copper',45),Fluid.of('createmetallurgy:molten_slag',15)], 'none', 120)
    cmMelt('washed_tin', 'kubejs:washed_tin_concentrate', [Fluid.of('createmetallurgy:molten_tin',45),Fluid.of('createmetallurgy:molten_slag',15)], 'none', 130)
    cmMelt('washed_gold', 'kubejs:washed_gold_concentrate', [Fluid.of('createmetallurgy:molten_gold',45),Fluid.of('createmetallurgy:molten_slag',15)], 'none', 150)

    // =====================================================================
    // 6. FURNACE AGE - AFTER FIRST IRON
    // =====================================================================
    event.shaped('minecraft:furnace', ['BBB','BIB','BCB'], {
        B:'minecraft:brick', I:'create:iron_sheet', C:'minecraft:campfire'
    }).id('arcane_horizons:expert_metallurgy/furnace')
    replaceShaped('minecraft:blast_furnace', ['III','IFI','SSS'], {
        I:'create:iron_sheet', F:'minecraft:furnace', S:'minecraft:smooth_stone'
    }, 'arcane_horizons:expert_metallurgy/blast_furnace')

    // Important vanilla iron infrastructure uses formed stock, not raw ingots.
    ;[
        ['minecraft:iron_pickaxe',['III',' S ',' S '],{I:'create:iron_sheet',S:'minecraft:stick'}],
        ['minecraft:iron_axe',['II ','IS ',' S '],{I:'create:iron_sheet',S:'minecraft:stick'}],
        ['minecraft:iron_shovel',[' I ',' S ',' S '],{I:'create:iron_sheet',S:'minecraft:stick'}],
        ['minecraft:iron_hoe',['II ',' S ',' S '],{I:'create:iron_sheet',S:'minecraft:stick'}],
        ['minecraft:iron_sword',[' I ',' I ',' S '],{I:'create:iron_sheet',S:'minecraft:stick'}],
        ['minecraft:iron_helmet',['III','I I'],{I:'create:iron_sheet'}],
        ['minecraft:iron_chestplate',['I I','III','III'],{I:'create:iron_sheet'}],
        ['minecraft:iron_leggings',['III','I I','I I'],{I:'create:iron_sheet'}],
        ['minecraft:iron_boots',['I I','I I'],{I:'create:iron_sheet'}]
    ].forEach(([out, pat, key]) => replaceShaped(out, pat, key))

    replaceShaped('minecraft:shield', ['PIP','PPP',' P '], {P:'#minecraft:planks',I:'create:iron_sheet'})
    replaceShaped('minecraft:hopper', ['I I','ICI',' I '], {I:'create:iron_sheet',C:'minecraft:chest'})
    replaceShaped('minecraft:shears', [' I','I '], {I:'create:iron_sheet'})
    replaceShaped('minecraft:cauldron', ['I I','I I','III'], {I:'create:iron_sheet'})

    // Gold starts only after mechanical ore preparation exists.
    // Poor gold is 3:1; washing improves it to 2:1 via the recipes above.
    cmMelt('poor_gold', 'kubejs:poor_gold_powder', [
        Fluid.of('createmetallurgy:molten_gold',30), Fluid.of('createmetallurgy:molten_slag',30)
    ], 'none', 160)

    // =====================================================================
    // 7. PRE-NETHER PRECISION AND MAGIC
    // =====================================================================
    event.shaped('kubejs:mechanical_ignition_core', ['IRI','CAC','IRI'], {
        I:'create:iron_sheet', R:'minecraft:redstone', C:'create:copper_sheet', A:'minecraft:amethyst_shard'
    }).id('arcane_horizons:expert_metallurgy/mechanical_ignition_core')

    replaceShaped('minecraft:diamond_pickaxe', ['DDD',' I ',' S '], {
        D:'minecraft:diamond', I:'kubejs:mechanical_ignition_core', S:'create:iron_sheet'
    }, 'arcane_horizons:expert_metallurgy/pre_nether_diamond_pickaxe')
    replaceShapeless('minecraft:flint_and_steel', ['minecraft:flint','create:iron_sheet','kubejs:mechanical_ignition_core'],
        'arcane_horizons:expert_metallurgy/mechanical_flint_and_steel')

    removeOutput('ars_nouveau:imbuement_chamber')
    event.shaped('ars_nouveau:imbuement_chamber', ['CAC','G G','CAC'], {
        C:'create:copper_sheet', A:'minecraft:amethyst_shard', G:'create:golden_sheet'
    }).id('arcane_horizons:expert_metallurgy/ars_imbuement_chamber')
    removeOutput('ars_nouveau:novice_spell_book')
    event.shaped('ars_nouveau:novice_spell_book', [' G ','IBI',' A '], {
        G:'ars_nouveau:source_gem', I:'create:iron_sheet', B:'minecraft:book', A:'minecraft:amethyst_shard'
    }).id('arcane_horizons:expert_metallurgy/ars_novice_spell_book')

    // =====================================================================
    // 8. NETHER METALLURGY - 2 RAW PER INGOT
    // =====================================================================
    event.shapeless('4x kubejs:industrial_flux', [
        'minecraft:calcite','minecraft:quartz','minecraft:blaze_powder','minecraft:clay_ball'
    ]).id('arcane_horizons:metallurgy/industrial_flux')

    event.recipes.create.mixing('kubejs:hot_refined_iron_charge', [
        'kubejs:refined_iron_charge','kubejs:industrial_flux'
    ]).heated().id('arcane_horizons:metallurgy/hot_refined_iron_charge')
    cmMelt('nether_iron', 'kubejs:hot_refined_iron_charge', [
        Fluid.of('createmetallurgy:molten_iron',45), Fluid.of('createmetallurgy:molten_slag',10)
    ], 'heated', 120)

    // Real Precision Mechanisms remain where Create intends them: after Brass and Deployers.
    replaceShaped('minecraft:brewing_stand', [' B ',' C ','SSS'], {
        B:'minecraft:blaze_rod', C:'create:brass_sheet', S:'minecraft:cobblestone'
    }, 'arcane_horizons:expert_metallurgy/brewing_stand')

    // =====================================================================
    // 9. MATURE INDUSTRY - FINALLY REACH 1:1
    // =====================================================================
    replaceShaped('createmetallurgy:mechanical_belt_grinder', ['SPS','CBC',' A '], {
        S:'#c:plates/steel', P:'create:precision_mechanism', C:'create:brass_sheet',
        B:'create:belt_connector', A:'create:andesite_casing'
    }, 'arcane_horizons:metallurgy/mechanical_belt_grinder')
    replaceShaped('createmetallurgy:industrial_crucible', ['SPS','ICI','SSS'], {
        S:'#c:plates/steel', P:'create:precision_mechanism', I:'create:iron_sheet', C:'createmetallurgy:foundry_basin'
    }, 'arcane_horizons:metallurgy/industrial_crucible')

    ;[
        ['copper','kubejs:washed_copper_concentrate','kubejs:rich_copper_concentrate'],
        ['tin','kubejs:washed_tin_concentrate','kubejs:rich_tin_concentrate'],
        ['iron','kubejs:washed_iron_concentrate','kubejs:rich_iron_concentrate'],
        ['gold','kubejs:washed_gold_concentrate','kubejs:rich_gold_concentrate']
    ].forEach(([metal,input,output]) => {
        event.recipes.createmetallurgy.grinding(output, input).processingTime(180)
            .id(`arcane_horizons:metallurgy/grind_rich_${metal}`)
    })

    cmMelt('rich_copper', 'kubejs:rich_copper_concentrate', [Fluid.of('createmetallurgy:molten_copper',90),Fluid.of('createmetallurgy:molten_slag',5)], 'heated', 100)
    cmMelt('rich_tin', 'kubejs:rich_tin_concentrate', [Fluid.of('createmetallurgy:molten_tin',90),Fluid.of('createmetallurgy:molten_slag',5)], 'heated', 110)
    cmMelt('rich_iron', 'kubejs:rich_iron_concentrate', [Fluid.of('createmetallurgy:molten_iron',90),Fluid.of('createmetallurgy:molten_slag',8)], 'heated', 120)
    cmMelt('rich_gold', 'kubejs:rich_gold_concentrate', [Fluid.of('createmetallurgy:molten_gold',90),Fluid.of('createmetallurgy:molten_slag',5)], 'heated', 120)

    // =====================================================================
    // 10. POSITIVE ORE YIELDS - LATE GAME ONLY
    // =====================================================================
    event.shaped('4x kubejs:industrial_separation_media', ['SQS','RPR','SGS'], {
        S:'#c:plates/steel', Q:'minecraft:quartz', R:'minecraft:redstone',
        P:'create:precision_mechanism', G:'ars_nouveau:source_gem'
    }).id('arcane_horizons:metallurgy/industrial_separation_media')

    event.shaped('2x kubejs:advanced_separation_media', ['ESE','DMD','ESE'], {
        E:'minecraft:ender_eye', S:'minecraft:shulker_shell', D:'minecraft:diamond',
        M:'kubejs:industrial_separation_media'
    }).id('arcane_horizons:metallurgy/advanced_separation_media')

    event.shaped('2x kubejs:arcane_metallurgical_catalyst', ['GNG','PDP','GSG'], {
        G:'ars_nouveau:source_gem_block', N:'minecraft:nether_star',
        P:'create:precision_mechanism', D:'minecraft:dragon_breath', S:'minecraft:netherite_ingot'
    }).id('arcane_horizons:metallurgy/arcane_metallurgical_catalyst')

    var lateMetals = [
        ['copper','kubejs:rich_copper_concentrate','createmetallurgy:molten_copper'],
        ['tin','kubejs:rich_tin_concentrate','createmetallurgy:molten_tin'],
        ['iron','kubejs:rich_iron_concentrate','createmetallurgy:molten_iron'],
        ['gold','kubejs:rich_gold_concentrate','createmetallurgy:molten_gold']
    ]

    lateMetals.forEach(([metal, rich, fluid]) => {
        event.recipes.create.mixing(`kubejs:industrial_${metal}_feed`, [rich, 'kubejs:industrial_separation_media'])
            .superheated().id(`arcane_horizons:metallurgy/industrial_${metal}_feed`)
        cmMelt(`industrial_${metal}_1_5x`, `kubejs:industrial_${metal}_feed`, Fluid.of(fluid,135), 'superheated', 160)

        event.recipes.create.mixing(`kubejs:advanced_${metal}_feed`, [rich, 'kubejs:advanced_separation_media'])
            .superheated().id(`arcane_horizons:metallurgy/advanced_${metal}_feed`)
        cmMelt(`advanced_${metal}_2x`, `kubejs:advanced_${metal}_feed`, Fluid.of(fluid,180), 'superheated', 200)

        event.recipes.create.mixing(`kubejs:arcane_${metal}_feed`, [rich, 'kubejs:arcane_metallurgical_catalyst'])
            .superheated().id(`arcane_horizons:metallurgy/arcane_${metal}_feed`)
        cmMelt(`arcane_${metal}_3x`, `kubejs:arcane_${metal}_feed`, Fluid.of(fluid,270), 'superheated', 260)
    })

    // Slag starts as waste, then becomes partially recoverable once mature machinery exists.
    event.recipes.createmetallurgy.grinding('kubejs:processed_slag', 'createmetallurgy:slag').processingTime(200)
        .id('arcane_horizons:metallurgy/process_slag')
    event.shapeless('minecraft:gravel', ['kubejs:processed_slag','kubejs:processed_slag','kubejs:processed_slag'])
        .id('arcane_horizons:metallurgy/slag_aggregate')

    // =====================================================================
    // 11. EQUIPMENT / MAGIC / KITCHEN CROSS-GATES FROM v0.3.0
    // =====================================================================
    // Gold equipment uses formed stock rather than raw ingots.
    ;[
        ['minecraft:golden_pickaxe',['GGG',' S ',' S '],{G:'create:golden_sheet',S:'minecraft:stick'}],
        ['minecraft:golden_axe',['GG ','GS ',' S '],{G:'create:golden_sheet',S:'minecraft:stick'}],
        ['minecraft:golden_shovel',[' G ',' S ',' S '],{G:'create:golden_sheet',S:'minecraft:stick'}],
        ['minecraft:golden_hoe',['GG ',' S ',' S '],{G:'create:golden_sheet',S:'minecraft:stick'}],
        ['minecraft:golden_sword',[' G ',' G ',' S '],{G:'create:golden_sheet',S:'minecraft:stick'}]
    ].forEach(([out, pat, key]) => replaceShaped(out, pat, key))

    // Other diamond tools wait for the post-Nether Precision Mechanism.
    replaceShaped('minecraft:diamond_axe', ['DD ','DP ',' S '], {
        D:'minecraft:diamond', P:'create:precision_mechanism', S:'minecraft:stick'
    })
    replaceShaped('minecraft:diamond_shovel', [' D ',' P ',' S '], {
        D:'minecraft:diamond', P:'create:precision_mechanism', S:'minecraft:stick'
    })
    replaceShaped('minecraft:diamond_hoe', ['DD ',' P ',' S '], {
        D:'minecraft:diamond', P:'create:precision_mechanism', S:'minecraft:stick'
    })
    replaceShaped('minecraft:diamond_sword', [' D ',' D ',' P '], {
        D:'minecraft:diamond', P:'create:precision_mechanism'
    })
    replaceShaped('minecraft:diamond_helmet', ['DDD','S S'], {
        D:'minecraft:diamond', S:'create:sturdy_sheet'
    })
    replaceShaped('minecraft:diamond_chestplate', ['D D','DSD','DDD'], {
        D:'minecraft:diamond', S:'create:sturdy_sheet'
    })
    replaceShaped('minecraft:diamond_leggings', ['DSD','D D','D D'], {
        D:'minecraft:diamond', S:'create:sturdy_sheet'
    })
    replaceShaped('minecraft:diamond_boots', ['D D','S S'], {
        D:'minecraft:diamond', S:'create:sturdy_sheet'
    })

    // Ars Nouveau stays tied to mechanical metallurgy throughout its tiers.
    removeOutput('ars_nouveau:source_jar')
    event.shaped('ars_nouveau:source_jar', ['GGG','GSG','GCG'], {
        G:'minecraft:glass', S:'ars_nouveau:source_gem', C:'create:copper_sheet'
    }).id('arcane_horizons:expert_metallurgy/ars_source_jar')

    removeOutput('ars_nouveau:arcane_core')
    event.shaped('ars_nouveau:arcane_core', ['OSO','PDP','OSO'], {
        O:'minecraft:obsidian', S:'ars_nouveau:source_gem', P:'create:precision_mechanism', D:'minecraft:diamond'
    }).id('arcane_horizons:expert_metallurgy/ars_arcane_core')

    removeOutput('ars_nouveau:enchanting_apparatus')
    event.shaped('ars_nouveau:enchanting_apparatus', ['GSG','APA','GPG'], {
        G:'create:golden_sheet', S:'ars_nouveau:source_gem', A:'minecraft:amethyst_shard', P:'create:precision_mechanism'
    }).id('arcane_horizons:expert_metallurgy/ars_enchanting_apparatus')

    removeOutput('ars_nouveau:apprentice_spell_book')
    event.shapeless('ars_nouveau:apprentice_spell_book', [
        'ars_nouveau:novice_spell_book',
        'ars_nouveau:source_gem','ars_nouveau:source_gem','ars_nouveau:source_gem','ars_nouveau:source_gem',
        'create:golden_sheet','create:golden_sheet','create:precision_mechanism'
    ]).id('arcane_horizons:expert_metallurgy/ars_apprentice_spell_book')

    removeOutput('ars_nouveau:archmage_spell_book')
    event.shapeless('ars_nouveau:archmage_spell_book', [
        'ars_nouveau:apprentice_spell_book','ars_nouveau:source_gem_block','ars_nouveau:source_gem_block',
        'create:sturdy_sheet','create:sturdy_sheet','create:precision_mechanism','minecraft:netherite_ingot'
    ]).id('arcane_horizons:expert_metallurgy/ars_archmage_spell_book')

    // Iron's Spells is deliberately cross-linked with Ars and metallurgy.
    removeOutput('irons_spellbooks:copper_spell_book')
    event.shaped('irons_spellbooks:copper_spell_book', ['CAC','GBG','CCC'], {
        C:'minecraft:copper_ingot', A:'irons_spellbooks:arcane_essence', G:'ars_nouveau:source_gem', B:'minecraft:book'
    }).id('arcane_horizons:expert_metallurgy/irons_copper_spell_book')

    removeOutput('irons_spellbooks:iron_spell_book')
    event.shaped('irons_spellbooks:iron_spell_book', ['IAI','IBI','IAI'], {
        I:'create:iron_sheet', A:'irons_spellbooks:arcane_essence', B:'irons_spellbooks:copper_spell_book'
    }).id('arcane_horizons:expert_metallurgy/irons_iron_spell_book')

    removeOutput('irons_spellbooks:gold_spell_book')
    event.shaped('irons_spellbooks:gold_spell_book', ['GUG','PBP','GAG'], {
        G:'create:golden_sheet', U:'irons_spellbooks:uncommon_ink', P:'create:precision_mechanism',
        B:'irons_spellbooks:iron_spell_book', A:'irons_spellbooks:arcane_essence'
    }).id('arcane_horizons:expert_metallurgy/irons_gold_spell_book')

    removeOutput('irons_spellbooks:diamond_spell_book')
    event.shaped('irons_spellbooks:diamond_spell_book', ['DRD','SBS','DPD'], {
        D:'minecraft:diamond', R:'irons_spellbooks:rare_ink', S:'create:sturdy_sheet',
        B:'irons_spellbooks:gold_spell_book', P:'create:precision_mechanism'
    }).id('arcane_horizons:expert_metallurgy/irons_diamond_spell_book')

    removeOutput('irons_spellbooks:inscription_table')
    event.shaped('irons_spellbooks:inscription_table', ['BAB','ISI','PPP'], {
        B:'minecraft:book', A:'irons_spellbooks:arcane_essence', I:'create:iron_sheet',
        S:'ars_nouveau:source_gem', P:'#minecraft:planks'
    }).id('arcane_horizons:expert_metallurgy/irons_inscription_table')

    removeOutput('irons_spellbooks:scroll_forge')
    event.shaped('irons_spellbooks:scroll_forge', ['SAS','IPI','SSS'], {
        S:'minecraft:stone_bricks', A:'irons_spellbooks:arcane_essence', I:'create:iron_sheet', P:'create:precision_mechanism'
    }).id('arcane_horizons:expert_metallurgy/irons_scroll_forge')

    // Farmer's Delight gets its metal kitchen only after the Iron Age.
    removeOutput('farmersdelight:iron_knife')
    event.shaped('farmersdelight:iron_knife', [' I','S '], {I:'create:iron_sheet',S:'minecraft:stick'})
        .id('arcane_horizons:expert_metallurgy/farmersdelight_iron_knife')
    removeOutput('farmersdelight:cutting_board')
    event.shaped('farmersdelight:cutting_board', ['PP',' I'], {P:'#minecraft:planks',I:'create:iron_sheet'})
        .id('arcane_horizons:expert_metallurgy/farmersdelight_cutting_board')
    removeOutput('farmersdelight:skillet')
    event.shaped('farmersdelight:skillet', [' II',' SI','S  '], {I:'create:iron_sheet',S:'minecraft:stick'})
        .id('arcane_horizons:expert_metallurgy/farmersdelight_skillet')
    removeOutput('farmersdelight:stove')
    event.shaped('farmersdelight:stove', ['III','B B','BBB'], {I:'create:iron_sheet',B:'minecraft:brick'})
        .id('arcane_horizons:expert_metallurgy/farmersdelight_stove')
    removeOutput('farmersdelight:cooking_pot')
    event.shaped('farmersdelight:cooking_pot', ['I I','ICI',' B '], {
        I:'create:iron_sheet', C:'create:copper_sheet', B:'minecraft:brick'
    }).id('arcane_horizons:expert_metallurgy/farmersdelight_cooking_pot')

    removeOutput('hexerei:mixing_cauldron')
    event.shaped('hexerei:mixing_cauldron', ['ISI','ACA','III'], {
        I:'create:iron_sheet', S:'ars_nouveau:source_gem', A:'minecraft:amethyst_shard', C:'minecraft:cauldron'
    }).id('arcane_horizons:expert_metallurgy/hexerei_mixing_cauldron')

    // =====================================================================
    // 12. EXISTING EXPERT CROSS-GATES
    // =====================================================================
    removeOutput('immersiveengineering:hammer')
    event.shaped('immersiveengineering:hammer', [' IP',' SI','S  '], {
        I:'create:iron_sheet', P:'create:precision_mechanism', S:'minecraft:stick'
    }).id('arcane_horizons:expert_metallurgy/engineers_hammer')

    removeOutput('immersiveengineering:wirecutter')
    event.shaped('immersiveengineering:wirecutter', [' I ','ISI','S S'], {
        I:'create:iron_sheet', S:'minecraft:stick'
    }).id('arcane_horizons:expert_metallurgy/wirecutter')

    removeOutput('minecraft:smithing_table')
    event.shaped('minecraft:smithing_table', ['IPI','WWW','WWW'], {
        I:'create:iron_sheet', P:'create:precision_mechanism', W:'#minecraft:planks'
    }).id('arcane_horizons:expert_metallurgy/smithing_table')

    removeOutput('minecraft:enchanting_table')
    event.shapeless('minecraft:enchanting_table', [
        'minecraft:book','minecraft:diamond','minecraft:diamond',
        'minecraft:obsidian','minecraft:obsidian','minecraft:obsidian','minecraft:obsidian',
        'ars_nouveau:source_gem','create:precision_mechanism'
    ]).id('arcane_horizons:expert_metallurgy/enchanting_table')

    removeOutput('minecraft:ender_eye')
    event.shapeless('minecraft:ender_eye', [
        'minecraft:ender_pearl','minecraft:blaze_powder','ars_nouveau:source_gem','create:precision_mechanism'
    ]).id('arcane_horizons:expert_metallurgy/ender_eye')
})
