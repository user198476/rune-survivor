function spawnEnemy() {
    if (enemies.length >= MAX_ACTIVE_ENEMIES) {
        return false;
    }

    const side = Math.floor(Math.random() * 4);
    let x;
    let y;

    if (side === 0) {
        x = randomBetween(0, GAME_WIDTH);
        y = -40;
    } else if (side === 1) {
        x = GAME_WIDTH + 40;
        y = randomBetween(0, GAME_HEIGHT);
    } else if (side === 2) {
        x = randomBetween(0, GAME_WIDTH);
        y = GAME_HEIGHT + 40;
    } else {
        x = -40;
        y = randomBetween(0, GAME_HEIGHT);
    }

    const difficulty = 1 + waveTime / 80;
    const typeRoll = Math.random();
    let enemy;

    if (canSpawnCowardShooter() && typeRoll > 0.55 && typeRoll < 0.55 + COWARD_SHOOTER_SPAWN_CHANCE) {
        enemy = {
            type: "cowardShooter",
            x,
            y,
            radius: 18,
            hp: 38 + difficulty * 8,
            maxHp: 38 + difficulty * 8,
            speed: (128 + difficulty * 4) * COWARD_SHOOTER_SPEED_MULTIPLIER,
            damage: 10 + difficulty * 1.2,
            xp: 10,
            color: "#ff9b2f",
            shootCooldown: randomBetween(
                COWARD_SHOOTER_FIRE_COOLDOWN_MIN,
                COWARD_SHOOTER_FIRE_COOLDOWN_MAX
            ),
            strafeDirection: Math.random() > 0.5 ? 1 : -1
        };
    } else if (waveTime > 60 && typeRoll > 0.82) {
        enemy = {
            type: "brute",
            x,
            y,
            radius: 27,
            hp: 95 * difficulty,
            maxHp: 95 * difficulty,
            speed: 80 + difficulty * 5,
            damage: 16,
            xp: 12,
            color: "#aaf737"
        };
    } else if (waveTime > 25 && typeRoll > 0.65) {
        enemy = {
            type: "bat",
            x,
            y,
            radius: 14,
            hp: 24 * difficulty,
            maxHp: 24 * difficulty,
            speed: 170 + difficulty * 10,
            damage: 7,
            xp: 6,
            color: "#ff4d8d"
        };
    } else {
        enemy = {
            type: "slime",
            x,
            y,
            radius: 20,
            hp: 38 * difficulty,
            maxHp: 38 * difficulty,
            speed: 105 + difficulty * 7,
            damage: 8,
            xp: 8,
            color: "#8b5cff"
        };
    }

    enemy.attackCooldown = 0;
    enemies.push(enemy);

    return true;
}

function updateSpawns(dt) {
    if (enemies.length >= MAX_ACTIVE_ENEMIES) {
        spawnTimer = Math.max(spawnTimer, 0.35);
        return;
    }

    spawnTimer -= dt;

    const baseSpawnInterval = Math.max(0.22, 1.05 - waveTime / 160);
    const spawnInterval = getCurrentSpawnInterval(baseSpawnInterval);

    if (spawnTimer > 0) {
        return;
    }

    spawnTimer = spawnInterval;

    let desiredSpawnCount = 1;

    if (waveTime > 35 && Math.random() > 0.72) {
        desiredSpawnCount += 1;
    }

    if (waveTime > 90 && Math.random() > 0.78) {
        desiredSpawnCount += 1;
    }

    const spawnCount = getMaxSpawnsThisTick(desiredSpawnCount);

    for (let i = 0; i < spawnCount; i++) {
        if (enemies.length >= MAX_ACTIVE_ENEMIES) {
            break;
        }

        if (!canSpawnDuringPostBossRamp()) {
            break;
        }

        spawnEnemy();
    }
}

function isPlayerSubmerged() {
    let nearbyEnemyCount = 0;
    const radiusSq = SUBMERGED_DAMAGE_RADIUS * SUBMERGED_DAMAGE_RADIUS;

    for (const enemy of enemies) {
        if (
            !enemy ||
            enemy.dead ||
            enemy.isBoss ||
            enemy.type === "hordeBomb"
        ) {
            continue;
        }

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        if (dx * dx + dy * dy <= radiusSq) {
            nearbyEnemyCount++;

            if (nearbyEnemyCount >= SUBMERGED_DAMAGE_MIN_ENEMIES) {
                return true;
            }
        }
    }

    return false;
}

function getSubmergedContactDamage(baseDamage, enemy) {
    if (
        !enemy ||
        enemy.isBoss ||
        enemy.type === "hordeBomb"
    ) {
        return baseDamage;
    }

    if (!isPlayerSubmerged()) {
        return baseDamage;
    }

    return baseDamage * SUBMERGED_DAMAGE_MULTIPLIER;
}

function updateEnemies(dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (!enemy || enemy.dead) {
            continue;
        }

        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
        
        if (enemy.type === "hordeBomb") {
            updateHordeBombEnemy(enemy, dt);
            continue;
        }

        if (enemy.type === "cowardShooter") {
            updateCowardShooterEnemy(enemy, dt);
        } else {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;

            enemy.x += (dx / len) * enemy.speed * dt;
            enemy.y += (dy / len) * enemy.speed * dt;
        }

        const hitDx = player.x - enemy.x;
        const hitDy = player.y - enemy.y;
        const hitRadius = player.radius + enemy.radius;

        if (hitDx * hitDx + hitDy * hitDy < hitRadius * hitRadius) {
            if (enemy.attackCooldown <= 0) {
                const contactDamage = getSubmergedContactDamage(enemy.damage, enemy);
                damagePlayer(contactDamage, enemy);
                enemy.attackCooldown = 0.65;
            }
        }
    }
}

function trimEnemyOverflow() {
    if (enemies.length <= MAX_ACTIVE_ENEMIES) {
        return;
    }
    enemies = enemies.filter((enemy) => enemy && !enemy.dead);
    if (enemies.length <= MAX_ACTIVE_ENEMIES) {
        return;
    }
    enemies.sort((a, b) => {
        return getEnemyDistanceSqToPlayer(a) - getEnemyDistanceSqToPlayer(b);
    });
    enemies.length = MAX_ACTIVE_ENEMIES;
}

function buildEnemyGrid() {
    enemyGrid.clear();
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (!enemy || enemy.dead) {
            continue;
        }
        const cellX = getEnemyGridCell(enemy.x);
        const cellY = getEnemyGridCell(enemy.y);
        const key = getEnemyGridKey(cellX, cellY);
        let bucket = enemyGrid.get(key);
        if (!bucket) {
            bucket = [];
            enemyGrid.set(key, bucket);
        }
        bucket.push(i);
    }
}

function forEachNearbyEnemyIndex(x, y, callback) {
    const cellX = getEnemyGridCell(x);
    const cellY = getEnemyGridCell(y);
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            const key = getEnemyGridKey(cellX + offsetX, cellY + offsetY);
            const bucket = enemyGrid.get(key);
            if (!bucket) {
                continue;
            }
            for (const enemyIndex of bucket) {
                const shouldStop = callback(enemyIndex);
                if (shouldStop) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getEnemyGridCell(value) {
    return Math.floor(value / ENEMY_GRID_SIZE);
}

function getEnemyGridKey(cellX, cellY) {
    return `${cellX};${cellY}`;
}

function updatePostBossRamp(dt) {
    postBossRampTimer = Math.max(0, postBossRampTimer - dt);
}

function getPostBossRampRatio() {
    if (postBossRampTimer <= 0) {
        return 1;
    }

    return 1 - postBossRampTimer / POST_BOSS_RAMP_DURATION;
}

function canSpawnDuringPostBossRamp() {
    return enemies.length < MAX_ACTIVE_ENEMIES;
}

function isPostBossRampActive() {
    return postBossRampTimer > 0;
}

function getPostBossRampRatio() {
    if (postBossRampTimer <= 0) {
        return 1;
    }

    return 1 - postBossRampTimer / POST_BOSS_RAMP_DURATION;
}

function getCurrentSpawnInterval(baseInterval) {
    if (!isPostBossRampActive()) {
        return baseInterval;
    }

    const ratio = getPostBossRampRatio();

    return Math.max(
        baseInterval,
        POST_BOSS_MIN_SPAWN_INTERVAL * (1 - ratio) + baseInterval * ratio
    );
}

function getMaxSpawnsThisTick(normalCount) {
    if (!isPostBossRampActive()) {
        return normalCount;
    }

    return POST_BOSS_MAX_SPAWNS_PER_TICK;
}

function fireCowardShooterProjectile(enemy, dirX, dirY) {
    enemyProjectiles.push({
        x: enemy.x + dirX * (enemy.radius + 6),
        y: enemy.y + dirY * (enemy.radius + 6),
        vx: dirX * COWARD_SHOOTER_PROJECTILE_SPEED,
        vy: dirY * COWARD_SHOOTER_PROJECTILE_SPEED,
        radius: COWARD_SHOOTER_PROJECTILE_RADIUS,
        damage: COWARD_SHOOTER_PROJECTILE_DAMAGE,
        color: "#ff9b2f",
        life: COWARD_SHOOTER_PROJECTILE_LIFETIME
    });
}

function updateCowardShooterEnemy(enemy, dt) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy) || 1;

    const dirX = dx / distanceToPlayer;
    const dirY = dy / distanceToPlayer;

    let moveX = 0;
    let moveY = 0;

    if (distanceToPlayer < COWARD_SHOOTER_TOO_CLOSE_DISTANCE) {
        moveX = -dirX;
        moveY = -dirY;
    } else if (distanceToPlayer < COWARD_SHOOTER_PREFERRED_DISTANCE) {
        moveX = -dirX * 0.75 + (-dirY * enemy.strafeDirection) * 0.35;
        moveY = -dirY * 0.75 + (dirX * enemy.strafeDirection) * 0.35;
    } else if (distanceToPlayer > COWARD_SHOOTER_LEASH_DISTANCE) {
        moveX = dirX * 0.3;
        moveY = dirY * 0.3;
    } else {
        moveX = -dirY * enemy.strafeDirection * 0.55;
        moveY = dirX * enemy.strafeDirection * 0.55;
    }

    const moveLength = Math.sqrt(moveX * moveX + moveY * moveY) || 1;

    enemy.x += (moveX / moveLength) * enemy.speed * dt;
    enemy.y += (moveY / moveLength) * enemy.speed * dt;

    enemy.x = Math.max(enemy.radius, Math.min(GAME_WIDTH - enemy.radius, enemy.x));
    enemy.y = Math.max(enemy.radius, Math.min(GAME_HEIGHT - enemy.radius, enemy.y));

    enemy.shootCooldown -= dt;

    if (
        enemy.shootCooldown <= 0 &&
        distanceToPlayer <= COWARD_SHOOTER_LEASH_DISTANCE + 50
    ) {
        fireCowardShooterProjectile(enemy, dirX, dirY);

        enemy.shootCooldown = randomBetween(
            COWARD_SHOOTER_FIRE_COOLDOWN_MIN,
            COWARD_SHOOTER_FIRE_COOLDOWN_MAX
        );
    }
}

function updateEnemyProjectiles(dt) {
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const projectile = enemyProjectiles[i];

        projectile.life -= dt;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        if (
            projectile.life <= 0 ||
            projectile.x < -30 ||
            projectile.x > GAME_WIDTH + 30 ||
            projectile.y < -30 ||
            projectile.y > GAME_HEIGHT + 30
        ) {
            enemyProjectiles.splice(i, 1);
            continue;
        }

        const dx = player.x - projectile.x;
        const dy = player.y - projectile.y;
        const hitRadius = player.radius + projectile.radius;

        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            damagePlayer(projectile.damage, projectile);

            createParticles(projectile.x, projectile.y, 12, projectile.color, 1.2);
            addFloatingText(
                player.x,
                player.y - player.radius - 18,
                "TIR",
                "#ffb347"
            );

            enemyProjectiles.splice(i, 1);
        }
    }
}

function canSpawnCowardShooter() {
    return triggeredBossIds.has("royal_slime");
}

function canSpawnHordeBomb() {
    return triggeredBossIds.has("royal_slime") && bossState === "none";
}

function updateHordeBombSpawn(dt) {
    if (!canSpawnHordeBomb()) {
        hordeBombSpawnTimer = HORDE_BOMB_SPAWN_INTERVAL;
        return;
    }

    const normalEnemyCount = enemies.filter((enemy) => {
        return enemy &&
            !enemy.dead &&
            !enemy.isBoss &&
            enemy.type !== "hordeBomb";
    }).length;

    if (normalEnemyCount < HORDE_BOMB_MIN_ENEMIES_TO_SPAWN) {
        hordeBombSpawnTimer = Math.min(hordeBombSpawnTimer, 4);
        return;
    }

    hordeBombSpawnTimer -= dt;

    if (hordeBombSpawnTimer <= 0) {
        spawnHordeBomb();
        hordeBombSpawnTimer = HORDE_BOMB_SPAWN_INTERVAL;
    }
}

function spawnHordeBomb() {
    const target = findBestHordeBombTarget();

    if (!target) {
        return false;
    }

    const side = Math.floor(Math.random() * 4);
    let x;
    let y;

    if (side === 0) {
        x = randomBetween(0, GAME_WIDTH);
        y = -50;
    } else if (side === 1) {
        x = GAME_WIDTH + 50;
        y = randomBetween(0, GAME_HEIGHT);
    } else if (side === 2) {
        x = randomBetween(0, GAME_WIDTH);
        y = GAME_HEIGHT + 50;
    } else {
        x = -50;
        y = randomBetween(0, GAME_HEIGHT);
    }

    enemies.push({
        type: "hordeBomb",
        x,
        y,
        targetX: target.x,
        targetY: target.y,
        radius: HORDE_BOMB_RADIUS,
        hp: HORDE_BOMB_HP,
        maxHp: HORDE_BOMB_HP,
        speed: HORDE_BOMB_SPEED,
        damage: 0,
        xp: 0,
        color: "#9ca3af",
        attackCooldown: 0,
        retargetTimer: 0,
        life: HORDE_BOMB_MAX_LIFE
    });

    return true;
}

function findBestHordeBombTarget() {
    let bestEnemy = null;
    let bestScore = 0;

    for (const enemy of enemies) {
        if (
            !enemy ||
            enemy.dead ||
            enemy.isBoss ||
            enemy.type === "hordeBomb"
        ) {
            continue;
        }

        let score = 0;

        for (const other of enemies) {
            if (
                !other ||
                other.dead ||
                other.isBoss ||
                other.type === "hordeBomb"
            ) {
                continue;
            }

            const dx = other.x - enemy.x;
            const dy = other.y - enemy.y;

            if (dx * dx + dy * dy <= HORDE_BOMB_TARGET_SEARCH_RADIUS * HORDE_BOMB_TARGET_SEARCH_RADIUS) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestEnemy = enemy;
        }
    }

    if (!bestEnemy) {
        return null;
    }

    return {
        x: bestEnemy.x,
        y: bestEnemy.y,
        score: bestScore
    };
}

function updateHordeBombEnemy(enemy, dt) {
    enemy.life -= dt;
    enemy.retargetTimer -= dt;

    if (enemy.retargetTimer <= 0) {
        const target = findBestHordeBombTarget();

        if (target) {
            enemy.targetX = target.x;
            enemy.targetY = target.y;
        }

        enemy.retargetTimer = 0.35;
    }

    const dx = enemy.targetX - enemy.x;
    const dy = enemy.targetY - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    enemy.x += (dx / distance) * enemy.speed * dt;
    enemy.y += (dy / distance) * enemy.speed * dt;

    if (
        distance <= HORDE_BOMB_DETONATE_DISTANCE ||
        enemy.life <= 0
    ) {
        explodeHordeBomb(enemy);
        enemy.dead = true;
    }
}

function explodeHordeBomb(bomb) {
    createParticles(bomb.x, bomb.y, 46, "#cbd5e1", 2.2);

    screenShake = Math.max(screenShake, 7);
    screenShakeTimer = Math.max(screenShakeTimer, 0.22);

    for (const enemy of enemies) {
        if (
            !enemy ||
            enemy.dead ||
            enemy.isBoss ||
            enemy.type === "hordeBomb"
        ) {
            continue;
        }

        const dx = enemy.x - bomb.x;
        const dy = enemy.y - bomb.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (distance > HORDE_BOMB_EXPLOSION_RADIUS) {
            continue;
        }

        const ratio = 1 - distance / HORDE_BOMB_EXPLOSION_RADIUS;
        const force = HORDE_BOMB_KNOCKBACK_FORCE * ratio;

        enemy.x += (dx / distance) * force;
        enemy.y += (dy / distance) * force;

        enemy.x = Math.max(enemy.radius, Math.min(GAME_WIDTH - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(GAME_HEIGHT - enemy.radius, enemy.y));
    }

    const playerDx = player.x - bomb.x;
    const playerDy = player.y - bomb.y;
    const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy) || 1;

    if (playerDistance <= HORDE_BOMB_EXPLOSION_RADIUS) {
        damagePlayerByHordeBomb();
    }

    addFloatingText(bomb.x, bomb.y - 28, "BOUM", "#cbd5e1");
}

function damagePlayerByHordeBomb() {
    const damage = Math.ceil(player.maxHp * HORDE_BOMB_PLAYER_DAMAGE_RATIO);

    player.hp = Math.max(0, player.hp - damage);
    player.hitFlashTimer = 0.16;
    player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer, 0.35);

    damageFlash = Math.max(damageFlash, 0.32);

    addFloatingText(
        player.x,
        player.y - player.radius - 22,
        `-${damage}`,
        "#cbd5e1"
    );

    if (player.hp <= 0) {
        endGame();
    }
}
