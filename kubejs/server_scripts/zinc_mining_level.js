ServerEvents.tags('block', event => {
    const zincOres = [
        'create:zinc_ore',
        'create:deepslate_zinc_ore'
    ];

    zincOres.forEach(ore => {
        event.remove('minecraft:needs_iron_tool', ore);
        event.add('minecraft:needs_stone_tool', ore);
    });
});
