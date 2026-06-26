function loadMetaProgression() {
    metaCoins = parseStoredScore(safeLocalStorageGet(META_STORAGE_KEYS.coins));

    const skillsRaw = safeLocalStorageGet(META_STORAGE_KEYS.skills);

    if (skillsRaw) {
        try {
            metaSkills = JSON.parse(skillsRaw) || {};
        } catch (error) {
            metaSkills = {};
        }
    } else {
        metaSkills = {};
    }

    normalizeMetaSkillKeys();
}

function saveMetaProgression() {
    try {
        localStorage.setItem(META_STORAGE_KEYS.coins, String(Math.floor(metaCoins)));
        localStorage.setItem(META_STORAGE_KEYS.skills, JSON.stringify(metaSkills));
    } catch (error) {
        // on ignore si localStorage bloque
    }
}

function getSkillLevel(skillId, tier = selectedSkillTier) {
    return metaSkills[getSkillKey(skillId, tier)] || 0;
}

function getSkillCost(node, tier = selectedSkillTier) {
    const level = getSkillLevel(node.id, tier);
    const baseCost = node.baseCost + node.costStep * level;

    return Math.floor(baseCost * getTierCostMultiplier(tier));
}

function areRequirementsMet(node, tier = selectedSkillTier) {
    if (!node.requires || node.requires.length === 0) {
        return true;
    }

    return node.requires.every((requirement) => {
        return getSkillLevel(requirement.id, tier) >= requirement.level;
    });
}

function canBuySkill(node, tier = selectedSkillTier) {
    if (!isSkillTierUnlocked(tier)) {
        return false;
    }

    if (getSkillLevel(node.id, tier) >= node.maxLevel) {
        return false;
    }

    if (!areRequirementsMet(node, tier)) {
        return false;
    }

    return metaCoins >= getSkillCost(node, tier);
}

function getPermanentBonuses() {
    const bonuses = {
        damagePercent: 0,
        fireRateReduction: 0,
        projectileSpeedPercent: 0,
        maxHpFlat: 0,
        healKitPowerPercent: 0,
        shieldDurationFlat: 0,
        moveSpeedPercent: 0,
        magnetFlat: 0,
        xpGainPercent: 0
    };

    const highestUnlockedTier = getHighestUnlockedSkillTier();

    for (let tier = 0; tier <= highestUnlockedTier; tier++) {
        const effectMultiplier = getTierEffectMultiplier(tier);

        for (const branch of SKILL_TREE) {
            for (const node of branch.nodes) {
                const level = getSkillLevel(node.id, tier);

                if (level <= 0) {
                    continue;
                }

                if (!Object.prototype.hasOwnProperty.call(bonuses, node.effectType)) {
                    continue;
                }

                bonuses[node.effectType] += node.effectValue * level * effectMultiplier;
            }
        }
    }

    return bonuses;
}

function applyPermanentBonusesToPlayer() {
    const bonuses = getPermanentBonuses();
    player.damage *= 1 + bonuses.damagePercent;
    player.fireRate *= Math.max(0.35, 1 - bonuses.fireRateReduction);
    player.projectileSpeed *= 1 + bonuses.projectileSpeedPercent;
    
    player.maxHp += bonuses.maxHpFlat;
    player.hp = player.maxHp;

    player.lifeSteal = 0;
    player.healKitPower = bonuses.healKitPowerPercent || 0;

    player.shieldDurationBonus = bonuses.shieldDurationFlat;
    player.speed *= 1 + bonuses.moveSpeedPercent;
    player.magnetRadius += bonuses.magnetFlat;
    player.xpGainMultiplier = 1 + bonuses.xpGainPercent;
}

function clampPlayerStats() {
    player.lifeSteal = Math.min(0.15, Math.max(0, player.lifeSteal));
}

function buySkill(skillId) {
    const node = findSkillNodeById(skillId);

    if (!node) {
        return;
    }

    if (!canBuySkill(node, selectedSkillTier)) {
        return;
    }

    metaCoins -= getSkillCost(node, selectedSkillTier);

    const skillKey = getSkillKey(skillId, selectedSkillTier);
    metaSkills[skillKey] = getSkillLevel(skillId, selectedSkillTier) + 1;

    saveMetaProgression();
    updateMetaCurrencyDisplays();

    if (isSkillTierCompleted(selectedSkillTier)) {
        selectedSkillTier = Math.min(
            selectedSkillTier + 1,
            getHighestUnlockedSkillTier()
        );
    }

    clampSelectedSkillTier();
    renderSkillTree();
}

function findSkillNodeById(skillId) {
    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            if (node.id === skillId) {
                return node;
            }
        }
    }
    return null;
}

function resetProgressionButKeepScores() {
    const confirmed = window.confirm(
        "Réinitialiser toute la progression ?\n\nLes pièces, l'arbre de compétences et la run sauvegardée seront supprimés.\nLe meilleur score sera conservé."
    );

    if (!confirmed) {
        return;
    }

    const protectedScoreKeys = new Set([
        ...BEST_SCORE_STORAGE_KEYS,
        BEST_SCORE_STATS_KEY
    ]);

    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (!key) {
            continue;
        }

        const isRuneSurvivorKey =
            key.startsWith("runeSurvivor") ||
            key.startsWith("RuneSurvivor");

        if (!isRuneSurvivorKey) {
            continue;
        }

        if (protectedScoreKeys.has(key)) {
            continue;
        }

        keysToDelete.push(key);
    }

    for (const key of keysToDelete) {
        localStorage.removeItem(key);
    }

    metaCoins = 0;
    metaSkills = {};

    saveMetaProgression();
    loadMetaProgression();

    if (player) {
        resetGame();
    }

    updateMetaCurrencyDisplays();
    renderSkillTree();

    alert("Progression réinitialisée. Le meilleur score a été conservé.");
}

function getSkillKey(skillId, tier = selectedSkillTier) {
    return `${tier}:${skillId}`;
}

function getLegacySkillKey(skillId) {
    return skillId;
}

function normalizeMetaSkillKeys() {
    if (!metaSkills || typeof metaSkills !== "object") {
        metaSkills = {};
        return;
    }

    let changed = false;

    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            const legacyKey = getLegacySkillKey(node.id);
            const tierZeroKey = getSkillKey(node.id, 0);

            if (
                Object.prototype.hasOwnProperty.call(metaSkills, legacyKey) &&
                !Object.prototype.hasOwnProperty.call(metaSkills, tierZeroKey)
            ) {
                metaSkills[tierZeroKey] = metaSkills[legacyKey];
                delete metaSkills[legacyKey];
                changed = true;
            }
        }
    }

    if (changed) {
        saveMetaProgression();
    }
}

function getTierCostMultiplier(tier = selectedSkillTier) {
    return Math.pow(SKILL_TIER_COST_MULTIPLIER, tier);
}

function getTierEffectMultiplier(tier = selectedSkillTier) {
    return 1 + tier * SKILL_TIER_EFFECT_BONUS;
}

function getSkillTierName(tier = selectedSkillTier) {
    if (tier === 0) {
        return "Palier de base";
    }

    return `Palier +${tier}`;
}

function isSkillTierCompleted(tier) {
    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            if (getSkillLevel(node.id, tier) < node.maxLevel) {
                return false;
            }
        }
    }

    return true;
}

function getHighestUnlockedSkillTier() {
    let tier = 0;

    while (
        tier < MAX_VISIBLE_SKILL_TIER &&
        isSkillTierCompleted(tier)
    ) {
        tier++;
    }

    return tier;
}

function isSkillTierUnlocked(tier) {
    return tier <= getHighestUnlockedSkillTier();
}

function clampSelectedSkillTier() {
    const highestUnlockedTier = getHighestUnlockedSkillTier();

    selectedSkillTier = Math.max(
        0,
        Math.min(selectedSkillTier, highestUnlockedTier)
    );
}
