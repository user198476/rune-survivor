function getNextScheduledBoss() {
    if (bossState !== "none") {
        return null;
    }

    return BOSS_WAVES.find((bossDefinition) => {
        return waveTime >= bossDefinition.time && !triggeredBossIds.has(bossDefinition.id);
    }) || null;
}

function tryStartScheduledBoss() {
    const bossDefinition = getNextScheduledBoss();

    if (!bossDefinition) {
        return false;
    }

    startBossIntro(bossDefinition);
    return true;
}

function startBossIntro(bossDefinition) {
    triggeredBossIds.add(bossDefinition.id);

    bossState = "intro";
    currentBossDefinition = bossDefinition;
    currentBoss = null;
    bossIntroTimer = BOSS_INTRO_DURATION;

    prepareArenaForBoss();

    screenShake = 4;
    screenShakeTimer = 0.22;

    addFloatingText(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 80,
        `${bossDefinition.name} approche`,
        bossDefinition.color
    );
}

function prepareArenaForBoss() {
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    powerUps = [];
    spikes = [];
    spikeCanvas = null;
    enemyGrid.clear();

    disablePickableBuffsForBoss();

    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT - 135;
    player.knockbackX = 0;
    player.knockbackY = 0;
    player.fireCooldown = 0.65;
    player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer, 2.2);

    spawnTimer = 1.2;

    bossDangerZones = [];
    bossLasers = [];
    bossPullTimer = 0;
    bossMissiles = [];
}

function updateBossIntro(dt) {
    if (bossState !== "intro") {
        return;
    }

    bossIntroTimer -= dt;

    if (bossIntroTimer <= 0) {
        startBossFight();
    }
}

function startBossFight() {
    if (!currentBossDefinition) {
        bossState = "none";
        return;
    }

    const bossDefinition = currentBossDefinition;

    // boss object (objet boss)
    const boss = {
        isBoss: true,
        bossId: bossDefinition.id,
        bossName: bossDefinition.name,

        type: bossDefinition.type,
        x: GAME_WIDTH / 2,
        y: 110,

        radius: bossDefinition.radius,
        hp: bossDefinition.hp,
        maxHp: bossDefinition.hp,
        speed: bossDefinition.speed,
        damage: bossDefinition.damage,
        xp: 0,
        color: bossDefinition.color,

        attackCooldown: 1,
        spellCooldown: 2.2,
        auraDamageTimer: 0,
        laserCooldown: 2.8,
        missileCooldown: 1.6,
        zoneCooldown: 3.2,
        pullCooldown: 2.5,
        pullContactCooldown: 0,

        rewardXp: bossDefinition.rewardXp,
        rewardGemCount: bossDefinition.rewardGemCount
    };

    currentBoss = boss;
    enemies.push(boss);

    bossState = "active";

    screenShake = 5;
    screenShakeTimer = 0.28;

    createParticles(boss.x, boss.y, 80, boss.color, 2.6);
}

function checkBossDeath() {
    if (bossState !== "active") {
        return;
    }

    if (!currentBoss) {
        return;
    }

    if (currentBoss.dead || currentBoss.hp <= 0) {
        defeatBoss();
    }
}

function defeatBoss() {
    if (!currentBoss) {
        return;
    }

    const boss = currentBoss;

    bossState = "reward";
    bossRewardTimer = BOSS_REWARD_DELAY;

    const deathX = boss.x;
    const deathY = boss.y;
    const bossColor = boss.color || "#ffffff";

    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    enemyGrid.clear();

    screenShake = 7;
    screenShakeTimer = 0.35;

    createParticles(deathX, deathY, 120, bossColor, 3.2);
    addFloatingText(deathX, deathY - 80, "BOSS VAINCU", "#ffd86b");

    dropBossRewardXp(boss, deathX, deathY);

    currentBoss = null;

    bossDangerZones = [];
    bossLasers = [];
    bossPullTimer = 0;
    bossMissiles = [];
}

function dropBossRewardXp(boss, x, y) {
    const count = boss.rewardGemCount || 24;
    const gemValue = Math.max(1, Math.ceil((boss.rewardXp || 250) / count));

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const distanceFromBoss = randomBetween(20, 115);

        const gemX = Math.max(30, Math.min(GAME_WIDTH - 30, x + Math.cos(angle) * distanceFromBoss));
        const gemY = Math.max(30, Math.min(GAME_HEIGHT - 30, y + Math.sin(angle) * distanceFromBoss));

        dropGem(gemX, gemY, gemValue);

        const gem = gems[gems.length - 1];

        if (gem) {
            const burstSpeed = randomBetween(90, 230);
            gem.vx = Math.cos(angle) * burstSpeed;
            gem.vy = Math.sin(angle) * burstSpeed;
            gem.radius = 10;
        }
    }
}

function updateBossReward(dt) {
    if (bossState !== "reward") {
        return;
    }

    bossRewardTimer -= dt;

    // Pendant la récompense de boss, les gemmes sont aspirées beaucoup plus vite.
    for (const gem of gems) {
        const dx = player.x - gem.x;
        const dy = player.y - gem.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        gem.vx += (dx / dist) * 900 * dt;
        gem.vy += (dy / dist) * 900 * dt;
    }

    if (gems.length === 0 || bossRewardTimer <= 0) {
        finishBossRewardPhase();
    }
}

function finishBossRewardPhase() {
    bossState = "none";
    currentBossDefinition = null;
    bossRewardTimer = 0;

    spawnTimer = 0.35;
    postBossRampTimer = POST_BOSS_RAMP_DURATION;
    
    powerUpSpawnTimer = Math.max(powerUpSpawnTimer, 6);
    shieldSpawnTimer = Math.max(shieldSpawnTimer, 8);

    addFloatingText(
        player.x,
        player.y - player.radius - 42,
        "LES VAGUES REPRENNENT",
        "#d9d2ff"
    );
}

function updateBossAbilities(dt) {
    if (bossState !== "active" || !currentBoss || currentBoss.dead) {
        return;
    }

    updateBossPull(dt);
    updateBossLasers(dt);
    updateBossMissiles(dt);
    updateBossDangerZones(dt);
    updateRoyalSlimeAura(dt);

    if (currentBoss.bossId === "royal_slime") {
        updateRoyalSlimeAbilities(dt);
    }

    if (currentBoss.bossId === "blood_bat") {
        updateBloodBatAbilities(dt);
    }

    if (currentBoss.bossId === "rune_brute") {
        updateRuneBruteAbilities(dt);
    }
}