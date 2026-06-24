function loadMetaProgression() {
    try {
        metaCoins = Math.max(0, Number(localStorage.getItem(META_STORAGE_KEYS.coins)) || 0);
    } catch (error) {
        metaCoins = 0;
    }
    try {
        metaSkills = JSON.parse(localStorage.getItem(META_STORAGE_KEYS.skills) || "{}");
    } catch (error) {
        metaSkills = {};
    }
}

function saveMetaProgression() {
    try {
        localStorage.setItem(META_STORAGE_KEYS.coins, String(Math.floor(metaCoins)));
        localStorage.setItem(META_STORAGE_KEYS.skills, JSON.stringify(metaSkills));
    } catch (error) {
        // on ignore si localStorage bloque
    }
}

function getSkillLevel(skillId) {
    return metaSkills[skillId] || 0;
}

function getSkillCost(node) {
    const currentLevel = getSkillLevel(node.id);
    return node.baseCost + node.costStep * currentLevel;
}

function areRequirementsMet(node) {
    if (!node.requires || node.requires.length === 0) {
        return true;
    }
    return node.requires.every((requirement) => {
        return getSkillLevel(requirement.id) >= requirement.level;
    });
}

function canBuySkill(node) {
    const currentLevel = getSkillLevel(node.id);
    if (currentLevel >= node.maxLevel) {
        return false;
    }
    if (!areRequirementsMet(node)) {
        return false;
    }
    return metaCoins >= getSkillCost(node);
}

function getPermanentBonuses() {
    const bonuses = {
        damagePercent: 0,
        fireRateReduction: 0,
        projectileSpeedPercent: 0,
        maxHpFlat: 0,
        lifeStealPercent: 0,
        shieldDurationFlat: 0,
        moveSpeedPercent: 0,
        magnetFlat: 0,
        xpGainPercent: 0
    };
    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            const level = getSkillLevel(node.id);
            if (level <= 0) {
                continue;
            }
            bonuses[node.effectType] += node.effectValue * level;
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
    player.lifeSteal = Math.min(0.15, player.lifeSteal + bonuses.lifeStealPercent);
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
    if (!canBuySkill(node)) {
        return;
    }
    metaCoins -= getSkillCost(node);
    metaSkills[skillId] = getSkillLevel(skillId) + 1;
    saveMetaProgression();
    updateMetaCurrencyDisplays();
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

function buySkill(skillId) {
    const node = findSkillNodeById(skillId);
    if (!node) {
        return;
    }
    if (!canBuySkill(node)) {
        return;
    }
    metaCoins -= getSkillCost(node);
    metaSkills[skillId] = getSkillLevel(skillId) + 1;
    saveMetaProgression();
    updateMetaCurrencyDisplays();
    renderSkillTree();
}
