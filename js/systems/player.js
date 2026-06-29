function updatePlayer(dt) {
    let dx = 0;
    let dy = 0;

    if (keys.has("arrowup") || keys.has("w") || keys.has("z")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
    if (keys.has("arrowleft") || keys.has("a") || keys.has("q")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;

    const dir = normalize(dx, dy);
    const movementMultiplier = player.slowTimer > 0 ? player.slowMultiplier : 1;
    const currentMoveSpeed = player.speed * movementMultiplier;

    player.x += dir.x * currentMoveSpeed * dt;
    player.y += dir.y * currentMoveSpeed * dt;
    player.x += player.knockbackX * dt;
    player.y += player.knockbackY * dt;
    player.knockbackX *= Math.pow(0.02, dt);
    player.knockbackY *= Math.pow(0.02, dt);
    player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y));
    player.fireCooldown -= dt;
    const target = findNearestEnemy();
    if (target) {
        player.targetAimAngle = Math.atan2(target.y - player.y, target.x - player.x);
    }
    player.aimAngle = lerpAngle(player.aimAngle, player.targetAimAngle, player.aimTurnSpeed, dt);
    updateArcaneClone(dt);
    updateTripleEchoClones(dt);
    updateLegendaryRunes(dt);
    if (player.fireCooldown <= 0 && target) {
        shootAt(target);
        player.fireCooldown = player.fireRate;
    }
    player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);
    player.spikeInvulnerabilityTimer = Math.max(0, player.spikeInvulnerabilityTimer - dt);
    player.hitFlashTimer = Math.max(0, player.hitFlashTimer - dt);
    player.shieldTimer = Math.max(0, player.shieldTimer - dt);
    player.shieldBlockCooldown = Math.max(0, player.shieldBlockCooldown - dt);
    player.healLockTimer = Math.max(0, player.healLockTimer - dt);
    player.damageBoostTimer = Math.max(0, player.damageBoostTimer - dt);
    player.slowTimer = Math.max(0, player.slowTimer - dt);
    if (player.slowTimer <= 0) {
        player.slowMultiplier = 1;
    }
    if (player.damageBoostTimer <= 0) {
        player.damageMultiplier = 1;
        if (spikes.length > 0) {
            spikes = [];
            spikeCanvas = null;
        }
    }
}

function damagePlayer(amount, source) {
    if (state !== "playing") {
        return;
    }
    if (blockDamageWithShield(source)) {
        return;
    }
    if (player.invulnerabilityTimer > 0) {
        return;
    }
    player.hp = Math.max(0, player.hp - amount);
    player.invulnerabilityTimer = 0.45;
    player.hitFlashTimer = 0.18;
    player.healLockTimer = Math.max(player.healLockTimer, HIT_HEAL_LOCK_DURATION);
    damageFlash = 0.45;
    screenShake = 2.2; // force
    screenShakeTimer = 0.06; // durée
    addFloatingText(player.x, player.y - player.radius - 18, `-${Math.ceil(amount)}`, "#ff5f75");
    createParticles(player.x, player.y, 26, "#ff365d", 1.9);
    if (source) {
        const dir = normalize(player.x - source.x, player.y - source.y);
        player.knockbackX += dir.x * 430;
        player.knockbackY += dir.y * 430;
        source.x -= dir.x * 18;
        source.y -= dir.y * 18;
    }
    if (player.hp <= 0) {
        player.hp = 0;
        endGame();
    }
    updateHud();
}

function damagePlayerFromSpike(spike) {
    if (state !== "playing") {
        return;
    }
    if (blockDamageWithShield(spike)) {
        return;
    }
    if (player.spikeInvulnerabilityTimer > 0) {
        return;
    }
    const damage = player.maxHp / 2;
    player.hp = Math.max(0, player.hp - damage);
    player.hitFlashTimer = 0.22;
    player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer, 0.25);
    player.spikeInvulnerabilityTimer = 1;
    player.healLockTimer = Math.max(player.healLockTimer, SPIKE_HEAL_LOCK_DURATION);
    damageFlash = 0.55;
    screenShake = 2.8;
    screenShakeTimer = 0.07;
    addFloatingText(player.x, player.y - player.radius - 22, "-50% PV", "#ff365d");
    createParticles(player.x, player.y, 34, "#ff365d", 2.1);
    const dir = normalize(player.x - spike.x, player.y - spike.y);
    player.knockbackX += dir.x * 650;
    player.knockbackY += dir.y * 650;
    if (player.hp <= 0) {
        player.hp = 0;
        endGame();
    }
    updateHud();
}

function damagePlayerByHordePressure(amount, nearbyEnemies) {
    if (state !== "playing") {
        return;
    }
    if (blockDamageWithShield(null)) {
        return;
    }
    player.hp = Math.max(0, player.hp - amount);
    player.hitFlashTimer = 0.12;
    player.healLockTimer = Math.max(player.healLockTimer || 0, HORDE_PRESSURE_HEAL_LOCK);
    damageFlash = Math.max(damageFlash, 0.24);
    screenShake = 1.8;
    screenShakeTimer = 0.045;
    if (player.hordeWarningTimer <= 0) {
        addFloatingText(player.x, player.y - player.radius - 42, `SUBMERGÉ -${Math.ceil(amount)}`, "#ff5f75");
        player.hordeWarningTimer = 0.65;
    }
    if (player.hp <= 0) {
        player.hp = 0;
        endGame();
    }
    updateHud();
}

function applyLifeSteal(damageDealt) {
    if (player.lifeSteal <= 0) {
        return;
    }
    if (damageDealt <= 0) {
        return;
    }
    if (player.healLockTimer > 0) {
        return;
    }
    if (player.hp >= player.maxHp) {
        player.lifeStealBuffer = 0;
        return;
    }
    const effectiveLifeSteal = Math.min(0.15, player.lifeSteal);
    const healingGained = damageDealt * effectiveLifeSteal;
    const maxStoredHealing = player.maxHp * 0.45;
    player.lifeStealBuffer = Math.min(maxStoredHealing, player.lifeStealBuffer + healingGained);
}

function updateLifeStealHealing(dt) {
    if (!player || !player.lifeSteal || player.lifeSteal <= 0) {
        if (player) {
            player.lifeStealBuffer = 0;
            player.lifeStealPopupBuffer = 0;
        }

        return;
    }
    
    if (player.lifeStealBuffer <= 0) {
        return;
    }
    if (player.hp >= player.maxHp) {
        player.lifeStealBuffer = 0;
        return;
    }
    if (player.healLockTimer > 0) {
        return;
    }
    const maxHealPerSecond = Math.max(LIFE_STEAL_MIN_HEAL_PER_SECOND, player.maxHp * LIFE_STEAL_MAX_HEAL_PER_SECOND_RATIO);
    const healAmount = Math.min(player.lifeStealBuffer, maxHealPerSecond * dt, player.maxHp - player.hp);
    if (healAmount <= 0) {
        return;
    }
    player.lifeStealBuffer -= healAmount;
    healPlayer(healAmount);
}

function activateArcaneClone() {
    player.cloneTimer = ARCANE_CLONE_DURATION;
    player.cloneSide = 1;
    const targetPosition = getArcaneCloneTargetPosition();
    player.cloneX = targetPosition.x;
    player.cloneY = targetPosition.y;
    addFloatingText(player.x, player.y - player.radius - 34, "CLONE D'ÉCHO", "#b88cff");
    createParticles(player.x, player.y, 48, "#b88cff", 2.4);
}

function updateArcaneClone(dt) {
    if (player.cloneTimer <= 0) {
        return;
    }
    const wasActive = player.cloneTimer > 0;
    player.cloneTimer = Math.max(0, player.cloneTimer - dt);
    if (player.cloneTimer <= 0) {
        if (wasActive) {
            createParticles(player.cloneX, player.cloneY, 22, "#b88cff", 1.5);
        }
        return;
    }
    const targetPosition = getArcaneCloneTargetPosition();
    const followStrength = 1 - Math.pow(0.001, dt);
    player.cloneX += (targetPosition.x - player.cloneX) * followStrength;
    player.cloneY += (targetPosition.y - player.cloneY) * followStrength;
}

function getArcaneCloneTargetPosition() {
    const sideAngle = player.aimAngle + Math.PI / 2;
    const offset = ARCANE_CLONE_OFFSET * player.cloneSide;
    const x = player.x + Math.cos(sideAngle) * offset;
    const y = player.y + Math.sin(sideAngle) * offset;
    return {
        x: Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, x)),
        y: Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, y))
    };
}

function blockDamageWithShield(source) {
    if (player.shieldTimer <= 0) {
        return false;
    }
    if (player.shieldBlockCooldown <= 0) {
        player.shieldBlockCooldown = 0.25;
        addFloatingText(player.x, player.y - player.radius - 22, "BLOQUÉ", "#d8dde8");
        createParticles(player.x, player.y, 18, "#d8dde8", 1.4);
        screenShake = 1.4;
        screenShakeTimer = 0.04;
        if (source) {
            const dir = normalize(player.x - source.x, player.y - source.y);
            player.knockbackX += dir.x * 260;
            player.knockbackY += dir.y * 260;
        }
    }
    return true;
}

function healPlayer(amount) {
    if (amount <= 0) {
        return;
    }
    if (player.hp >= player.maxHp) {
        return;
    }
    const previousHp = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + amount);
    const actualHeal = player.hp - previousHp;
    if (actualHeal <= 0) {
        return;
    }
    player.lifeStealPopupBuffer += actualHeal;
    if (player.lifeStealPopupBuffer >= 1) {
        const displayHeal = Math.floor(player.lifeStealPopupBuffer);
        player.lifeStealPopupBuffer -= displayHeal;
        addFloatingText(player.x, player.y - player.radius - 34, `+${displayHeal}`, "#68ff96");
        createParticles(player.x, player.y, 8, "#68ff96", 1.1);
    }
    updateHud();
}

function updateLegendaryRunes(dt) {
    updateGuardianOrb(dt);
    updateAstralRain(dt);
}

function activateTripleEcho() {
    player.tripleEchoTimer = TRIPLE_ECHO_DURATION;
    player.tripleEchoClones = [];
    player.tripleEchoUnlocked = true;

    const angleA = player.aimAngle + Math.PI / 2;
    const angleB = player.aimAngle - Math.PI / 2;

    player.tripleEchoClones.push({
        x: player.x + Math.cos(angleA) * TRIPLE_ECHO_OFFSET,
        y: player.y + Math.sin(angleA) * TRIPLE_ECHO_OFFSET
    });

    player.tripleEchoClones.push({
        x: player.x + Math.cos(angleB) * TRIPLE_ECHO_OFFSET,
        y: player.y + Math.sin(angleB) * TRIPLE_ECHO_OFFSET
    });

    player.cloneTimer = 0;

    addFloatingText(
        player.x,
        player.y - player.radius - 42,
        "TRIPLE ÉCHO",
        "#d7b4ff"
    );

    createParticles(player.x, player.y, 80, "#d7b4ff", 3.2);
}

function updateTripleEchoClones(dt) {
    if (!player || player.tripleEchoTimer <= 0) {
        player.tripleEchoTimer = 0;
        player.tripleEchoClones = [];
        return;
    }

    player.tripleEchoTimer = Math.max(0, player.tripleEchoTimer - dt);

    if (player.tripleEchoTimer <= 0) {
        createParticles(player.x, player.y, 32, "#d7b4ff", 1.8);
        player.tripleEchoClones = [];
        return;
    }

    const angleA = player.aimAngle + Math.PI / 2;
    const angleB = player.aimAngle - Math.PI / 2;

    const targets = [{
        x: player.x + Math.cos(angleA) * TRIPLE_ECHO_OFFSET,
        y: player.y + Math.sin(angleA) * TRIPLE_ECHO_OFFSET
    }, {
        x: player.x + Math.cos(angleB) * TRIPLE_ECHO_OFFSET,
        y: player.y + Math.sin(angleB) * TRIPLE_ECHO_OFFSET
    }];

    if (!player.tripleEchoClones || player.tripleEchoClones.length !== 2) {
        player.tripleEchoClones = targets.map((target) => ({
            x: target.x,
            y: target.y
        }));
    }

    const followStrength = 1 - Math.pow(0.001, dt);

    for (let i = 0; i < 2; i++) {
        const clone = player.tripleEchoClones[i];
        const target = targets[i];

        clone.x += (target.x - clone.x) * followStrength;
        clone.y += (target.y - clone.y) * followStrength;

        clone.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, clone.x));
        clone.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, clone.y));
    }
}

function updateGuardianOrb(dt) {
    if (!player || !player.guardianOrbUnlocked) {
        return;
    }

    const speedMultiplier =
        1 + (player.guardianOrbSpeedLevel || 0) * GUARDIAN_ORB_SPEED_UPGRADE_BONUS;

    player.guardianOrbAngle += GUARDIAN_ORB_SPEED * speedMultiplier * dt;

    const orbCount = Math.max(1, player.guardianOrbCount || 1);

    for (let i = 0; i < orbCount; i++) {
        const orb = getGuardianOrbPosition(i, orbCount);

        for (const enemy of enemies) {
            if (!enemy || enemy.dead) {
                continue;
            }

            enemy.guardianOrbCooldown = Math.max(
                0,
                (enemy.guardianOrbCooldown || 0) - dt
            );

            const dx = enemy.x - orb.x;
            const dy = enemy.y - orb.y;
            const hitRadius = enemy.radius + GUARDIAN_ORB_RADIUS;

            if (
                dx * dx + dy * dy <= hitRadius * hitRadius &&
                enemy.guardianOrbCooldown <= 0
            ) {
                enemy.guardianOrbCooldown = GUARDIAN_ORB_HIT_COOLDOWN;

                const damageMultiplier =
                    1 + (player.guardianOrbDamageLevel || 0) * GUARDIAN_ORB_DAMAGE_UPGRADE_BONUS;

                damageEnemyFromLegendary(
                    enemy,
                    player.damage *
                        player.damageMultiplier *
                        GUARDIAN_ORB_DAMAGE_RATIO *
                        damageMultiplier,
                    orb.x,
                    orb.y,
                    "#ffd86b",
                    "ORBE"
                );
            }
        }
    }
}

function getGuardianOrbPosition(index = 0, total = 1) {
    const baseAngle = player.guardianOrbAngle || 0;
    const offset = (Math.PI * 2 * index) / total;
    const angle = baseAngle + offset;

    return {
        x: player.x + Math.cos(angle) * GUARDIAN_ORB_ORBIT_RADIUS,
        y: player.y + Math.sin(angle) * GUARDIAN_ORB_ORBIT_RADIUS
    };
}

function updateAstralRain(dt) {
    if (player && player.astralRainUnlocked) {
        player.astralRainTimer -= dt;

        if (player.astralRainTimer <= 0) {
            spawnAstralRain();
            player.astralRainTimer = getAstralRainInterval();
        }
    }

    updateAstralStrikes(dt);
}

function spawnAstralRain() {
    const validTargets = enemies.filter((enemy) => {
        return enemy && !enemy.dead && enemy.type !== "hordeBomb";
    });

    const strikeCount = ASTRAL_RAIN_STRIKE_COUNT + (player.astralRainStrikeLevel || 0) * ASTRAL_RAIN_STRIKE_UPGRADE_BONUS;

    for (let i = 0; i < strikeCount; i++) {
        let x;
        let y;

        if (validTargets.length > 0) {
            const target = validTargets[Math.floor(Math.random() * validTargets.length)];

            x = target.x + randomBetween(-90, 90);
            y = target.y + randomBetween(-90, 90);
        } else {
            x = player.x + randomBetween(-260, 260);
            y = player.y + randomBetween(-180, 180);
        }

        astralStrikes.push({
            x: Math.max(ASTRAL_RAIN_RADIUS, Math.min(GAME_WIDTH - ASTRAL_RAIN_RADIUS, x)),
            y: Math.max(ASTRAL_RAIN_RADIUS, Math.min(GAME_HEIGHT - ASTRAL_RAIN_RADIUS, y)),
            radius: ASTRAL_RAIN_RADIUS,
            warningTimer: ASTRAL_RAIN_WARNING_DURATION,
            activeTimer: ASTRAL_RAIN_ACTIVE_DURATION,
            damaged: false
        });
    }

    addFloatingText(
        player.x,
        player.y - player.radius - 42,
        "PLUIE ASTRALE",
        "#9ee7ff"
    );
}

function updateAstralStrikes(dt) {
    for (let i = astralStrikes.length - 1; i >= 0; i--) {
        const strike = astralStrikes[i];

        if (strike.warningTimer > 0) {
            strike.warningTimer -= dt;

            if (strike.warningTimer <= 0) {
                strike.warningTimer = 0;
                strike.activeTimer = ASTRAL_RAIN_ACTIVE_DURATION;

                applyAstralStrikeDamage(strike);

                screenShake = Math.max(screenShake, 3.2);
                screenShakeTimer = Math.max(screenShakeTimer, 0.08);

                createParticles(strike.x, strike.y, 36, "#9ee7ff", 2.4);
            }

            continue;
        }

        strike.activeTimer -= dt;

        if (strike.activeTimer <= 0) {
            astralStrikes.splice(i, 1);
        }
    }
}

function applyAstralStrikeDamage(strike) {
    if (strike.damaged) {
        return;
    }

    strike.damaged = true;

    const damageMultiplier = 1 + (player.astralRainDamageLevel || 0) * ASTRAL_RAIN_DAMAGE_UPGRADE_BONUS;
    const damage = player.damage * player.damageMultiplier * ASTRAL_RAIN_DAMAGE_RATIO * damageMultiplier;
    
    const radiusSq = strike.radius * strike.radius;

    for (const enemy of enemies) {
        if (!enemy || enemy.dead) {
            continue;
        }

        const dx = enemy.x - strike.x;
        const dy = enemy.y - strike.y;

        if (dx * dx + dy * dy <= radiusSq) {
            damageEnemyFromLegendary(
                enemy,
                damage,
                strike.x,
                strike.y,
                "#9ee7ff",
                "ASTRAL"
            );
        }
    }
}

function damageEnemyFromLegendary(enemy, damage, hitX, hitY, color, label) {
    if (!enemy || enemy.dead || damage <= 0) {
        return;
    }

    enemy.hp -= damage;

    addFloatingText(
        enemy.x,
        enemy.y - enemy.radius,
        label ? `${label} ${Math.floor(damage)}` : Math.floor(damage),
        color
    );

    createParticles(hitX, hitY, 12, color, 1.5);

    if (enemy.hp <= 0 && !enemy.dead) {
        enemy.dead = true;
        player.kills += 1;

        if (!enemy.isBoss && enemy.xp > 0) {
            dropGem(enemy.x, enemy.y, enemy.xp);
        }

        createParticles(
            enemy.x,
            enemy.y,
            enemy.isBoss ? 48 : 22,
            enemy.color,
            enemy.isBoss ? 2.4 : 1.7
        );
    }
}

function getAstralRainInterval() {
    const cooldownLevel = player.astralRainCooldownLevel || 0;

    return Math.max(
        ASTRAL_RAIN_MIN_INTERVAL,
        ASTRAL_RAIN_INTERVAL - cooldownLevel * ASTRAL_RAIN_COOLDOWN_UPGRADE_REDUCTION
    );
}
