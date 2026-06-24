function updateRoyalSlimeAbilities(dt) {
    currentBoss.pullCooldown -= dt;

    if (currentBoss.pullCooldown > 0) {
        return;
    }

    currentBoss.pullCooldown = BOSS_PULL_COOLDOWN;
    bossPullTimer = BOSS_PULL_DURATION;

    addFloatingText(
        currentBoss.x,
        currentBoss.y - currentBoss.radius - 28,
        "ASPIRATION MORTELLE",
        currentBoss.color
    );

    createParticles(currentBoss.x, currentBoss.y, 70, currentBoss.color, 2.8);

    screenShake = 3.2;
    screenShakeTimer = 0.18;
}

function updateBossPull(dt) {
    if (!currentBoss || currentBoss.dead) {
        return;
    }

    currentBoss.pullContactCooldown = Math.max(
        0,
        (currentBoss.pullContactCooldown || 0) - dt
    );

    if (bossPullTimer <= 0) {
        return;
    }

    bossPullTimer -= dt;

    const dx = currentBoss.x - player.x;
    const dy = currentBoss.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const dirX = dx / dist;
    const dirY = dy / dist;

    // Plus tu es loin, plus l'aspiration est forte.
    const distanceBoost = Math.min(1.45, 0.75 + dist / 520);
    const pullForce = BOSS_PULL_FORCE * distanceBoost;

    player.knockbackX += dirX * pullForce * dt;
    player.knockbackY += dirY * pullForce * dt;

    // Contact punitif pendant l'attraction.
    const contactRadius =
        currentBoss.radius +
        player.radius +
        BOSS_PULL_CONTACT_RADIUS_BONUS;

    if (
        dist <= contactRadius &&
        currentBoss.pullContactCooldown <= 0
    ) {
        currentBoss.pullContactCooldown = BOSS_PULL_CONTACT_COOLDOWN;

        damagePlayer(BOSS_PULL_CONTACT_DAMAGE, currentBoss);

        // Petit effet de "claque" pour que le contact se sente vraiment.
        const pushDir = normalize(player.x - currentBoss.x, player.y - currentBoss.y);

        player.knockbackX += pushDir.x * 520;
        player.knockbackY += pushDir.y * 520;

        screenShake = 5.5;
        screenShakeTimer = 0.14;

        addFloatingText(
            player.x,
            player.y - player.radius - 24,
            "ÉCRASEMENT",
            "#ff5f75"
        );

        createParticles(player.x, player.y, 34, "#ff365d", 2.2);
    }
}

function updateRoyalSlimeAura(dt) {
    if (
        bossState !== "active" ||
        !currentBoss ||
        currentBoss.dead ||
        currentBoss.bossId !== "royal_slime"
    ) {
        return;
    }

    currentBoss.auraDamageTimer = Math.max(
        0,
        (currentBoss.auraDamageTimer || 0) - dt
    );

    const dx = player.x - currentBoss.x;
    const dy = player.y - currentBoss.y;
    const distanceSq = dx * dx + dy * dy;

    const hitRadius = BOSS_SLIME_AURA_RADIUS + player.radius;

    if (distanceSq > hitRadius * hitRadius) {
        return;
    }

    player.slowTimer = Math.max(
    player.slowTimer || 0,
        BOSS_SLIME_AURA_SLOW_DURATION
    );

    player.slowMultiplier = Math.min(
        player.slowMultiplier || 1,
        BOSS_SLIME_AURA_SLOW_MULTIPLIER
    );

    if (currentBoss.auraDamageTimer > 0) {
        return;
    }

    currentBoss.auraDamageTimer = BOSS_SLIME_AURA_TICK;

    const damageMultiplier = bossPullTimer > 0
        ? BOSS_SLIME_AURA_PULL_MULTIPLIER
        : 1;

    damagePlayer(
        BOSS_SLIME_AURA_DAMAGE * damageMultiplier,
        currentBoss
    );

    addFloatingText(
        player.x,
        player.y - player.radius - 30,
        "AURA CORROSIVE",
        "#b88cff"
    );
}

function updateBloodBatAbilities(dt) {
    currentBoss.laserCooldown -= dt;
    currentBoss.missileCooldown -= dt;

    if (currentBoss.laserCooldown <= 0) {
        currentBoss.laserCooldown = BOSS_LASER_COOLDOWN;

        bossLasers.push({
            x: currentBoss.x,
            y: currentBoss.y,
            angle: Math.atan2(player.y - currentBoss.y, player.x - currentBoss.x),
            warning: BOSS_LASER_WARNING_DURATION,
            active: BOSS_LASER_ACTIVE_DURATION,
            damageTick: 0,
            color: currentBoss.color,
            locked: false
        });

        addFloatingText(
            currentBoss.x,
            currentBoss.y - currentBoss.radius - 28,
            "LASER",
            currentBoss.color
        );
    }

    if (currentBoss.missileCooldown <= 0) {
        currentBoss.missileCooldown = BOSS_MISSILE_COOLDOWN;
        spawnBossMissileWave();

        addFloatingText(
            currentBoss.x,
            currentBoss.y - currentBoss.radius - 54,
            "MISSILES",
            "#ff9bd3"
        );
    }
}

function spawnBossMissileWave() {
    if (!currentBoss) {
        return;
    }

    const baseAngle = Math.atan2(player.y - currentBoss.y, player.x - currentBoss.x);

    for (let i = 0; i < BOSS_MISSILE_COUNT; i++) {
        const spread = (i - (BOSS_MISSILE_COUNT - 1) / 2) * 0.22;
        const angle = baseAngle + spread;

        bossMissiles.push({
            x: currentBoss.x,
            y: currentBoss.y,
            vx: Math.cos(angle) * BOSS_MISSILE_SPEED,
            vy: Math.sin(angle) * BOSS_MISSILE_SPEED,
            radius: BOSS_MISSILE_RADIUS,
            damage: BOSS_MISSILE_DAMAGE,
            life: BOSS_MISSILE_LIFE,
            locked: false,
            trackTimer: BOSS_MISSILE_TRACK_DURATION,
            color: "#ff4d8d"
        });
    }

    createParticles(currentBoss.x, currentBoss.y, 36, "#ff4d8d", 2.4);
}

function updateBossMissiles(dt) {
    for (let i = bossMissiles.length - 1; i >= 0; i--) {
        const missile = bossMissiles[i];

        missile.life -= dt;

        if (missile.life <= 0) {
            createParticles(missile.x, missile.y, 14, missile.color, 1.2);
            bossMissiles.splice(i, 1);
            continue;
        }

        const dx = player.x - missile.x;
        const dy = player.y - missile.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy) || 1;

        if (!missile.locked) {
            missile.trackTimer -= dt;

            const shouldStopTracking =
                missile.trackTimer <= 0 ||
                distanceToPlayer <= BOSS_MISSILE_LOCK_DISTANCE;

            if (shouldStopTracking) {
                missile.locked = true;

                const currentSpeed = Math.sqrt(
                    missile.vx * missile.vx + missile.vy * missile.vy
                ) || 1;

                missile.vx = (missile.vx / currentSpeed) * BOSS_MISSILE_SPEED;
                missile.vy = (missile.vy / currentSpeed) * BOSS_MISSILE_SPEED;
            } else {
                const targetVx = (dx / distanceToPlayer) * BOSS_MISSILE_SPEED;
                const targetVy = (dy / distanceToPlayer) * BOSS_MISSILE_SPEED;

                const turn = Math.min(1, BOSS_MISSILE_TURN_SPEED * dt);

                missile.vx += (targetVx - missile.vx) * turn;
                missile.vy += (targetVy - missile.vy) * turn;

                const speed = Math.sqrt(
                    missile.vx * missile.vx + missile.vy * missile.vy
                ) || 1;

                missile.vx = (missile.vx / speed) * BOSS_MISSILE_SPEED;
                missile.vy = (missile.vy / speed) * BOSS_MISSILE_SPEED;
            }
        }

        missile.x += missile.vx * dt;
        missile.y += missile.vy * dt;

        const hitRadius = missile.radius + player.radius;
        const hitDx = player.x - missile.x;
        const hitDy = player.y - missile.y;

        if (hitDx * hitDx + hitDy * hitDy <= hitRadius * hitRadius) {
            damagePlayer(missile.damage, null);

            screenShake = 4.5;
            screenShakeTimer = 0.12;

            createParticles(missile.x, missile.y, 36, missile.color, 2.5);
            addFloatingText(
                player.x,
                player.y - player.radius - 26,
                "MISSILE",
                "#ff5f75"
            );

            bossMissiles.splice(i, 1);
            continue;
        }

        const touchesBorder =
            missile.x - missile.radius <= 0 ||
            missile.x + missile.radius >= GAME_WIDTH ||
            missile.y - missile.radius <= 0 ||
            missile.y + missile.radius >= GAME_HEIGHT;

        if (touchesBorder) {
            createParticles(missile.x, missile.y, 18, missile.color, 1.5);
            bossMissiles.splice(i, 1);
        }
    }
}

function updateBossLasers(dt) {
    for (let i = bossLasers.length - 1; i >= 0; i--) {
        const laser = bossLasers[i];

        if (!laser.locked && laser.warning > 0) {
            // Le laser suit le joueur pendant l'avertissement.
            laser.x = currentBoss ? currentBoss.x : laser.x;
            laser.y = currentBoss ? currentBoss.y : laser.y;
            laser.angle = Math.atan2(player.y - laser.y, player.x - laser.x);

            laser.warning -= dt;

            if (laser.warning <= 0) {
                laser.warning = 0;
                laser.locked = true;

                screenShake = 5.5;
                screenShakeTimer = 0.12;
            }

            continue;
        }

        laser.active -= dt;
        laser.damageTick -= dt;

        if (laser.damageTick <= 0) {
            laser.damageTick = 0.22;

            if (isPlayerInsideLaser(laser)) {
                damagePlayer(BOSS_LASER_DAMAGE, null);

                addFloatingText(
                    player.x,
                    player.y - player.radius - 24,
                    "LASER",
                    "#ff5f75"
                );
            }
        }

        if (laser.active <= 0) {
            bossLasers.splice(i, 1);
        }
    }
}

function isPlayerInsideLaser(laser) {
    const px = player.x - laser.x;
    const py = player.y - laser.y;

    const cos = Math.cos(laser.angle);
    const sin = Math.sin(laser.angle);

    const forward = px * cos + py * sin;

    if (forward < 0 || forward > BOSS_LASER_LENGTH) {
        return false;
    }

    const perpendicular = Math.abs(px * sin - py * cos);

    return perpendicular <= BOSS_LASER_WIDTH / 2 + player.radius * 0.65;
}

function updateRuneBruteAbilities(dt) {
    currentBoss.zoneCooldown -= dt;

    if (currentBoss.zoneCooldown > 0) {
        return;
    }

    currentBoss.zoneCooldown = BOSS_ZONE_COOLDOWN;

    // Une zone toujours ciblée sur la position actuelle du joueur.
    createBossDangerZone(player.x, player.y);

    // Plusieurs zones autour du joueur pour fermer les sorties.
    for (let i = 1; i < BOSS_ZONE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / (BOSS_ZONE_COUNT - 1);
        const distance = randomBetween(95, 230);

        const offsetX =
            Math.cos(angle) * distance +
            randomBetween(-BOSS_ZONE_SPREAD_X * 0.22, BOSS_ZONE_SPREAD_X * 0.22);

        const offsetY =
            Math.sin(angle) * distance +
            randomBetween(-BOSS_ZONE_SPREAD_Y * 0.22, BOSS_ZONE_SPREAD_Y * 0.22);

        createBossDangerZone(
            player.x + offsetX,
            player.y + offsetY
        );
    }

    // Une chance de créer une zone directement entre le boss et le joueur.
    if (Math.random() < 0.65) {
        createBossDangerZone(
            (player.x + currentBoss.x) / 2,
            (player.y + currentBoss.y) / 2
        );
    }

    addFloatingText(
        currentBoss.x,
        currentBoss.y - currentBoss.radius - 28,
        "RUPTURE",
        currentBoss.color
    );
}

function createBossDangerZone(x, y) {
    bossDangerZones.push({
        x: Math.max(BOSS_ZONE_RADIUS + 10, Math.min(GAME_WIDTH - BOSS_ZONE_RADIUS - 10, x)),
        y: Math.max(BOSS_ZONE_RADIUS + 10, Math.min(GAME_HEIGHT - BOSS_ZONE_RADIUS - 10, y)),
        radius: BOSS_ZONE_RADIUS,
        warning: BOSS_ZONE_WARNING_DURATION,
        maxWarning: BOSS_ZONE_WARNING_DURATION,
        active: BOSS_ZONE_ACTIVE_DURATION,
        damageTick: 0,
        color: currentBoss ? currentBoss.color : "#aaf737"
    });
}

function updateBossDangerZones(dt) {
    let totalZoneDamage = 0;
    let overlapCount = 0;

    for (let i = bossDangerZones.length - 1; i >= 0; i--) {
        const zone = bossDangerZones[i];

        if (zone.warning > 0) {
            zone.warning -= dt;

            if (zone.warning <= 0) {
                zone.warning = 0;

                screenShake = 3.8;
                screenShakeTimer = 0.08;

                createParticles(zone.x, zone.y, 36, zone.color, 1.8);
            }

            continue;
        }

        zone.active -= dt;
        zone.damageTick -= dt;

        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const hitRadius = zone.radius + player.radius;

        if (
            zone.damageTick <= 0 &&
            dx * dx + dy * dy <= hitRadius * hitRadius
        ) {
            totalZoneDamage += BOSS_ZONE_DAMAGE;
            overlapCount += 1;
        }

        if (zone.damageTick <= 0) {
            zone.damageTick = BOSS_ZONE_DAMAGE_TICK;
        }

        if (zone.active <= 0) {
            bossDangerZones.splice(i, 1);
        }
    }

    if (totalZoneDamage > 0) {
        damagePlayerByBossZone(totalZoneDamage, overlapCount);
    }
}

function damagePlayerByBossZone(amount, overlapCount) {
    if (state !== "playing") {
        return;
    }

    if (player.hp <= 0) {
        return;
    }

    player.hp = Math.max(0, player.hp - amount);

    player.hitFlashTimer = 0.18;
    player.healLockTimer = Math.max(player.healLockTimer || 0, 0.55);

    damageFlash = Math.max(damageFlash, 0.42);
    screenShake = Math.max(screenShake, 2.8 + overlapCount * 1.1);
    screenShakeTimer = Math.max(screenShakeTimer, 0.09);

    const label = overlapCount > 1
        ? `RUPTURE x${overlapCount}`
        : "RUPTURE";

    addFloatingText(
        player.x,
        player.y - player.radius - 26,
        `${label} -${Math.ceil(amount)}`,
        "#ff5f75"
    );

    createParticles(player.x, player.y, 20 + overlapCount * 8, "#ff365d", 1.9);

    if (player.hp <= 0) {
        player.hp = 0;
        endGame();
    }

    updateHud();
}