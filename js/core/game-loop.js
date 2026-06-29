function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    updateVisualEffects(dt);
    if (state === "playing") {
        update(dt);
    }
    render();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    gameTime += dt;

    if (bossState === "none") {
        waveTime += dt;
    }

    if (bossState === "intro") {
        updateBossIntro(dt);
        updateParticles(dt);
        updateFloatingTexts(dt);
        updateHud();
        return;
    }

    if (bossState === "none" && tryStartScheduledBoss()) {
        updateParticles(dt);
        updateFloatingTexts(dt);
        updateHud();
        return;
    }

    updatePlayer(dt);
    updateSpikes();

    if (bossState === "reward") {
        updateLifeStealHealing(dt);
        updateGems(dt);
        updateBossReward(dt);
        updateParticles(dt);
        updateFloatingTexts(dt);
        updateHud();
        return;
    }

    if (bossState === "none") {
        updatePostBossRamp(dt);
        updatePowerUps(dt);
        updateSpawns(dt);
        updateHordeBombSpawn(dt);
    }

    updateEnemies(dt);
    updateEnemyProjectiles(dt);
    trimEnemyOverflow();
    buildEnemyGrid();
    updateBossAbilities(dt);

    if (bossState === "none") {
        updateHordePressure(dt);
    }

    updateProjectiles(dt);
    checkBossDeath();

    updateLifeStealHealing(dt);
    updateGems(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updateHud();
}

function resetGame() {
    state = "menu";
    gameTime = 0;
    waveTime = 0;
    spawnTimer = 0;
    screenShake = 0;
    screenShakeTimer = 0;
    damageFlash = 0;
    bestScore = loadBestScore();
    currentScore = 0;
    newBestThisRun = false;
    lastSavedCurrentScore = -1;
    lastSavedBestScore = bestScore;
    bossState = "none";
    currentBoss = null;
    currentBossDefinition = null;
    bossIntroTimer = 0;
    bossRewardTimer = 0;
    triggeredBossIds = new Set();
    bossDangerZones = [];
    bossLasers = [];
    bossPullTimer = 0;
    bossMissiles = [];
    bossWallStrikes = [];

    // objet player (player object)
    player = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        radius: 18,
        aimAngle: 0,
        targetAimAngle: 0,
        aimTurnSpeed: 16,
        hp: 100,
        maxHp: 100,
        speed: 260,
        level: 1,
        xp: 0,
        xpToNext: 25,
        kills: 0,
        damage: 18,
        damageMultiplier: 1,
        damageBoostTimer: 0,
        cloneTimer: 0,
        cloneX: GAME_WIDTH / 2 + ARCANE_CLONE_OFFSET,
        cloneY: GAME_HEIGHT / 2,
        cloneSide: 1,
        shieldTimer: 0,
        shieldBlockCooldown: 0,
        shieldDurationBonus: 0,
        lifeSteal: 0,
        lifeStealBuffer: 0,
        lifeStealPopupBuffer: 0,
        healKitPower: 0,
        healLockTimer: 0,
        hordeDamageTimer: 0,
        hordeWarningTimer: 0,
        xpGainMultiplier: 1,
        spikeInvulnerabilityTimer: 0,
        fireRate: 0.55,
        fireCooldown: 0,
        range: 650,
        projectileSpeed: 620,
        projectileRadius: 7,
        projectileCount: 1,
        projectileBounces: 0,
        magnetRadius: 90,
        invulnerabilityTimer: 0,
        hitFlashTimer: 0,
        knockbackX: 0,
        knockbackY: 0,
        slowTimer: 0,
        slowMultiplier: 1,
        guardianOrbUnlocked: false,
        guardianOrbAngle: 0,
        guardianOrbCount: 1,
        guardianOrbDamageLevel: 0,
        guardianOrbSpeedLevel: 0,
        astralRainUnlocked: false,
        astralRainTimer: ASTRAL_RAIN_INTERVAL,
        tripleEchoTimer: 0,
        tripleEchoClones: []
    };
    applyPermanentBonusesToPlayer();
    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    gems = [];
    powerUps = [];
    spikes = [];
    spikeCanvas = null;
    particles = [];
    floatingTexts = [];
    astralStrikes = [];
    currentUpgrades = [];
    enemyGrid.clear();
    powerUpSpawnTimer = 6;
    shieldSpawnTimer = 12;
    runRewardGranted = false;
    postBossRampTimer = 0;
    hordeBombSpawnTimer = HORDE_BOMB_SPAWN_INTERVAL;
    healKitSpawnTimer = randomBetween(HEAL_KIT_SPAWN_MIN, HEAL_KIT_SPAWN_MAX);
    levelUpOverlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    mainMenuOverlay.classList.remove("hidden");
    updateHud();
    updateMetaCurrencyDisplays();
}
