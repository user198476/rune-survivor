const META_STORAGE_KEYS = {
    coins: "runeSurvivor.meta.coins",
    skills: "runeSurvivor.meta.skills"
};
const SKILL_TREE = [{
    id: "damage",
    label: "Dégâts",
    icon: "✦",
    className: "damage",
    nodes: [{
        id: "damage_power",
        nodeIcon: "✦",
        title: "Puissance brute",
        desc: "+5% dégâts par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "damagePercent",
        effectValue: 0.05
    }, {
        id: "damage_rate",
        nodeIcon: "✹",
        title: "Cadence runique",
        desc: "-4% de cooldown de tir par niveau.",
        maxLevel: 5,
        baseCost: 320,
        costStep: 170,
        requires: [{
            id: "damage_power",
            level: 1
        }],
        effectType: "fireRateReduction",
        effectValue: 0.04
    }, {
        id: "damage_proj",
        nodeIcon: "➶",
        title: "Projectiles véloces",
        desc: "+8% vitesse des projectiles par niveau.",
        maxLevel: 5,
        baseCost: 480,
        costStep: 220,
        requires: [{
            id: "damage_rate",
            level: 1
        }],
        effectType: "projectileSpeedPercent",
        effectValue: 0.08
    }]
}, {
    id: "defense",
    label: "Vie / Défense",
    icon: "❤",
    className: "defense",
    nodes: [{
        id: "defense_hp",
        nodeIcon: "♥",
        title: "Vitalité",
        desc: "+15 PV max par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "maxHpFlat",
        effectValue: 15
    }, {
        id: "defense_lifesteal",
        nodeIcon: "✚",
        title: "Sang ancien",
        desc: "+1% vol de vie permanent par niveau.",
        maxLevel: 5,
        baseCost: 360,
        costStep: 190,
        requires: [{
            id: "defense_hp",
            level: 1
        }],
        effectType: "lifeStealPercent",
        effectValue: 0.01
    }, {
        id: "defense_shield",
        nodeIcon: "⛨",
        title: "Maîtrise du bouclier",
        desc: "+0.75s de durée de bouclier par niveau.",
        maxLevel: 4,
        baseCost: 520,
        costStep: 260,
        requires: [{
            id: "defense_lifesteal",
            level: 1
        }],
        effectType: "shieldDurationFlat",
        effectValue: 0.75
    }]
}, {
    id: "speed",
    nodeIcon: "➜",
    label: "Vitesse",
    icon: "➜",
    className: "speed",
    nodes: [{
        id: "speed_move",
        nodeIcon: "➜",
        title: "Célérité",
        desc: "+5% vitesse de déplacement par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "moveSpeedPercent",
        effectValue: 0.05
    }, {
        id: "speed_magnet",
        nodeIcon: "◌",
        title: "Attraction",
        desc: "+14 de rayon d’aspiration XP par niveau.",
        maxLevel: 5,
        baseCost: 300,
        costStep: 160,
        requires: [{
            id: "speed_move",
            level: 1
        }],
        effectType: "magnetFlat",
        effectValue: 14
    }, {
        id: "speed_xp",
        nodeIcon: "✧",
        title: "Instinct",
        desc: "+5% d’XP gagnée par niveau.",
        maxLevel: 5,
        baseCost: 460,
        costStep: 210,
        requires: [{
            id: "speed_magnet",
            level: 1
        }],
        effectType: "xpGainPercent",
        effectValue: 0.05
    }]
}];
const SKILL_TREE_MAP_HEIGHT = 680;
const SKILL_TREE_LAYOUT = {
    origin: {
        x: 50,
        y: 610
    },
    branches: {
        damage: {
            label: {
                x: 10,
                y: 28
            },
            bend: -8,
            nodes: [{
                x: 40,
                y: 520,
                card: "left",
                cardOffsetY: 34
            }, {
                x: 30,
                y: 392,
                card: "left",
                cardOffsetY: -8
            }, {
                x: 24,
                y: 256,
                card: "right",
                cardOffsetY: -34
            }]
        },
        speed: {
            label: {
                x: 50,
                y: 28
            },
            bend: 0,
            nodes: [{
                x: 50,
                y: 500,
                card: "right",
                cardOffsetY: 8
            }, {
                x: 50,
                y: 360,
                card: "left",
                cardOffsetY: -10
            }, {
                x: 50,
                y: 220,
                card: "right",
                cardOffsetY: -26
            }]
        },
        defense: {
            label: {
                x: 82,
                y: 28
            },
            bend: 8,
            nodes: [{
                x: 60,
                y: 520,
                card: "right",
                cardOffsetY: 34
            }, {
                x: 70,
                y: 392,
                card: "right",
                cardOffsetY: -8
            }, {
                x: 76,
                y: 256,
                card: "left",
                cardOffsetY: -34
            }]
        }
    }
};