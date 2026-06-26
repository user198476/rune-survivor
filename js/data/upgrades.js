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
    description: "Toutes les 8s, des frappes astrales tombent sur le champ de bataille.",
    canAppear() {
        return !player.astralRainUnlocked;
    },
    apply() {
        player.astralRainUnlocked = true;
        player.astralRainTimer = 1.2;

        addFloatingText(
            player.x,
            player.y - player.radius - 42,
            "PLUIE ASTRALE",
            "#9ee7ff"
        );

        createParticles(player.x, player.y, 80, "#9ee7ff", 3.2);
    }
}, {
    id: "legendary_triple_echo",
    rarity: "legendary",
    icon: "✥",
    title: "Triple écho",
    description: "Deux clones d’écho combattent avec toi pendant 12s.",
    canAppear() {
        return player.tripleEchoTimer <= 0;
    },
    apply() {
        activateTripleEcho();
    }
}];