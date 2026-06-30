const upgrades = [{
    id: "damage",
    icon: "✦",
    title: "Rune de puissance",
    description: "+25% dégâts des projectiles.",
    apply() {
        player.damage *= 1.25;
    }
}, {
    id: "fireRate",
    icon: "✹",
    title: "Rune de cadence",
    description: "Tire plus rapidement.",
    apply() {
        player.fireRate *= 0.86;
        player.fireRate = Math.max(0.12, player.fireRate);
    }
}, {
    id: "moveSpeed",
    icon: "➤",
    title: "Rune de célérité",
    description: "+15% vitesse de déplacement.",
    apply() {
        player.speed *= 1.15;
    }
}, {
    id: "projectileCount",
    icon: "☄",
    title: "Rune multiple",
    description: "+1 projectile à chaque attaque.",
    apply() {
        player.projectileCount += 1;
    }
}, {
    id: "projectileSize",
    icon: "●",
    title: "Rune colossale",
    description: "Les projectiles deviennent plus gros.",
    apply() {
        player.projectileRadius += 2;
    }
}, {
    id: "projectileSpeed",
    icon: "◆",
    title: "Rune véloce",
    description: "+30% vitesse des projectiles.",
    apply() {
        player.projectileSpeed *= 1.3;
    }
}, {
    id: "magnet",
    icon: "✧",
    title: "Rune d’attraction",
    description: "Attire l’XP de plus loin.",
    apply() {
        player.magnetRadius *= 1.45;
    }
}, {
    id: "maxHp",
    icon: "♥",
    title: "Rune vitale",
    description: "+25 PV max et soigne 25 PV.",
    apply() {
        player.maxHp += 25;
        player.hp = Math.min(player.maxHp, player.hp + 25);
    }
}, {
    id: "projectileBounce",
    icon: "↯",
    title: "Rune de ricochet",
    description: "Tes projectiles rebondissent 1 fois sur les murs. Permanent.",
    canAppear() {
        return player.projectileBounces === 0;
    },
    apply() {
        player.projectileBounces = 1;
    }
}, {
    id: "arcaneClone",
    icon: "✥",
    title: "Rune d’écho",
    description: "Invoque un clone à tes côtés pendant 18s. Il tire avec toi.",
    canAppear() {
        return player.cloneTimer <= 0;
    },
    apply() {
        activateArcaneClone();
    }
}, {
    id: "guardian_orb_damage",
    legendaryUpgradeFor: "legendary_guardian_orb",
    rarity: "legendary-upgrade",
    icon: "☉",
    title: "Orbe renforcé",
    description: "+25% dégâts de l’Orbe gardien.",
    canAppear() {
        return player.guardianOrbUnlocked &&
            (player.guardianOrbDamageLevel || 0) < GUARDIAN_ORB_DAMAGE_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.guardianOrbDamageLevel = (player.guardianOrbDamageLevel || 0) + 1;

        addFloatingText(player.x, player.y - player.radius - 38, "ORBE +DÉGÂTS", "#ffd86b");
        createParticles(player.x, player.y, 42, "#ffd86b", 2.4);
    }
},
{
    id: "guardian_orb_speed",
    legendaryUpgradeFor: "legendary_guardian_orb",
    rarity: "legendary-upgrade",
    icon: "◌",
    title: "Orbe accéléré",
    description: "+18% vitesse de rotation de l’Orbe gardien.",
    canAppear() {
        return player.guardianOrbUnlocked &&
            (player.guardianOrbSpeedLevel || 0) < GUARDIAN_ORB_SPEED_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.guardianOrbSpeedLevel = (player.guardianOrbSpeedLevel || 0) + 1;

        addFloatingText(player.x, player.y - player.radius - 38, "ORBE +VITESSE", "#ffd86b");
        createParticles(player.x, player.y, 42, "#ffd86b", 2.4);
    }
},
{
    id: "guardian_orb_count",
    legendaryUpgradeFor: "legendary_guardian_orb",
    rarity: "legendary-upgrade",
    icon: "☉+",
    title: "Orbe supplémentaire",
    description: "+1 Orbe gardien autour de toi.",
    canAppear() {
        return player.guardianOrbUnlocked &&
            (player.guardianOrbCount || 1) < GUARDIAN_ORB_MAX_COUNT;
    },
    apply() {
        player.guardianOrbCount = Math.min(
            GUARDIAN_ORB_MAX_COUNT,
            (player.guardianOrbCount || 1) + 1
        );

        addFloatingText(player.x, player.y - player.radius - 38, "+1 ORBE", "#ffd86b");
        createParticles(player.x, player.y, 58, "#ffd86b", 2.8);
    }
}, {
    id: "astral_rain_damage",
    legendaryUpgradeFor: "legendary_astral_rain",
    rarity: "legendary-upgrade",
    icon: "☄",
    title: "Comètes renforcées",
    description: "+25% dégâts de la Pluie astrale.",
    canAppear() {
        return player.astralRainUnlocked &&
            (player.astralRainDamageLevel || 0) < ASTRAL_RAIN_DAMAGE_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.astralRainDamageLevel = (player.astralRainDamageLevel || 0) + 1;

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "ASTRAL +DÉGÂTS",
            "#9ee7ff"
        );

        createParticles(player.x, player.y, 46, "#9ee7ff", 2.5);
    }
}, {
    id: "astral_rain_cooldown",
    legendaryUpgradeFor: "legendary_astral_rain",
    rarity: "legendary-upgrade",
    icon: "⌛",
    title: "Ciel instable",
    description: "-2s de délai entre deux Pluies astrales.",
    canAppear() {
        return player.astralRainUnlocked &&
            (player.astralRainCooldownLevel || 0) < ASTRAL_RAIN_COOLDOWN_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.astralRainCooldownLevel = (player.astralRainCooldownLevel || 0) + 1;

        player.astralRainTimer = Math.min(
            player.astralRainTimer,
            getAstralRainInterval()
        );

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "ASTRAL +FRÉQUENCE",
            "#9ee7ff"
        );

        createParticles(player.x, player.y, 46, "#9ee7ff", 2.5);
    }
}, {
    id: "astral_rain_strikes",
    legendaryUpgradeFor: "legendary_astral_rain",
    rarity: "legendary-upgrade",
    icon: "✦+",
    title: "Averse astrale",
    description: "+1 frappe à chaque Pluie astrale.",
    canAppear() {
        return player.astralRainUnlocked &&
            (player.astralRainStrikeLevel || 0) < ASTRAL_RAIN_STRIKE_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.astralRainStrikeLevel = (player.astralRainStrikeLevel || 0) + 1;

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "ASTRAL +FRAPPES",
            "#9ee7ff"
        );

        createParticles(player.x, player.y, 58, "#9ee7ff", 2.8);
    }
}, {
    id: "void_rift_damage",
    legendaryUpgradeFor: "legendary_void_rift",
    rarity: "legendary-upgrade",
    icon: "◈",
    title: "Néant vorace",
    description: "+25% dégâts de la Faille du Néant.",
    canAppear() {
        return player.voidRiftUnlocked &&
            (player.voidRiftDamageLevel || 0) < VOID_RIFT_DAMAGE_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.voidRiftDamageLevel = (player.voidRiftDamageLevel || 0) + 1;

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "NÉANT +DÉGÂTS",
            "#b56dff"
        );

        createParticles(player.x, player.y, 48, "#b56dff", 2.6);
    }
}, {
    id: "void_rift_radius",
    legendaryUpgradeFor: "legendary_void_rift",
    rarity: "legendary-upgrade",
    icon: "◎",
    title: "Gravité instable",
    description: "+20% rayon et aspiration de la Faille du Néant.",
    canAppear() {
        return player.voidRiftUnlocked &&
            (player.voidRiftRadiusLevel || 0) < VOID_RIFT_RADIUS_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.voidRiftRadiusLevel = (player.voidRiftRadiusLevel || 0) + 1;

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "NÉANT +RAYON",
            "#b56dff"
        );

        createParticles(player.x, player.y, 56, "#b56dff", 2.8);
    }
}, {
    id: "void_rift_trigger",
    legendaryUpgradeFor: "legendary_void_rift",
    rarity: "legendary-upgrade",
    icon: "✦",
    title: "Fracture accélérée",
    description: "La Faille du Néant se déclenche avec moins de kills.",
    canAppear() {
        return player.voidRiftUnlocked &&
            (player.voidRiftTriggerLevel || 0) < VOID_RIFT_TRIGGER_UPGRADE_MAX_LEVEL;
    },
    apply() {
        player.voidRiftTriggerLevel = (player.voidRiftTriggerLevel || 0) + 1;

        player.voidRiftKillCounter = Math.min(
            player.voidRiftKillCounter || 0,
            getVoidRiftKillsRequired() - 1
        );

        addFloatingText(
            player.x,
            player.y - player.radius - 38,
            "NÉANT +FRÉQUENCE",
            "#b56dff"
        );

        createParticles(player.x, player.y, 56, "#b56dff", 2.8);
    }
}];

const legendaryUpgrades = [{
    id: "legendary_guardian_orb",
    rarity: "legendary",
    icon: "☉",
    title: "Orbe gardien",
    description: "Une orbe légendaire tourne autour de toi et blesse les ennemis proches.",
    canAppear() {
        return !player.guardianOrbUnlocked;
    },
    apply() {
        player.guardianOrbUnlocked = true;
        player.guardianOrbAngle = 0;

        player.guardianOrbCount = Math.max(1, player.guardianOrbCount || 1);
        player.guardianOrbDamageLevel = player.guardianOrbDamageLevel || 0;
        player.guardianOrbSpeedLevel = player.guardianOrbSpeedLevel || 0;

        addFloatingText(
            player.x,
            player.y - player.radius - 42,
            "ORBE GARDIEN",
            "#ffd86b"
        );

        createParticles(player.x, player.y, 70, "#ffd86b", 3);
    }
}, {
    id: "legendary_astral_rain",
    rarity: "legendary",
    icon: "☄",
    title: "Pluie astrale",
    description: "Toutes les 18s, des frappes astrales tombent sur le champ de bataille.",
    canAppear() {
        return !player.astralRainUnlocked;
    },
    apply() {
        player.astralRainUnlocked = true;
        player.astralRainTimer = 1.2;

        player.astralRainDamageLevel = player.astralRainDamageLevel || 0;
        player.astralRainCooldownLevel = player.astralRainCooldownLevel || 0;
        player.astralRainStrikeLevel = player.astralRainStrikeLevel || 0;

        addFloatingText(
            player.x,
            player.y - player.radius - 42,
            "PLUIE ASTRALE",
            "#9ee7ff"
        );

        createParticles(player.x, player.y, 80, "#9ee7ff", 3.2);
    }
}, {
    id: "legendary_void_rift",
    rarity: "legendary",
    icon: "◈",
    title: "Faille du Néant",
    description: "Après plusieurs ennemis tués, ouvre une faille qui aspire et blesse les ennemis proches.",
    canAppear() {
        return !player.voidRiftUnlocked;
    },
    apply() {
        player.voidRiftUnlocked = true;
        player.voidRiftKillCounter = 0;

        player.voidRiftDamageLevel = player.voidRiftDamageLevel || 0;
        player.voidRiftRadiusLevel = player.voidRiftRadiusLevel || 0;
        player.voidRiftTriggerLevel = player.voidRiftTriggerLevel || 0;

        addFloatingText(
            player.x,
            player.y - player.radius - 42,
            "FAILLE DU NÉANT",
            "#b56dff"
        );

        createParticles(player.x, player.y, 90, "#b56dff", 3.4);
    }
}];