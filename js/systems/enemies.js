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
    if (waveTime > 60 && typeRoll > 0.82) {
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

function updateEnemies(dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy || enemy.dead) {
            continue;
        }
        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * enemy.speed * dt;
        enemy.y += (dy / len) * enemy.speed * dt;
        const hitDx = player.x - enemy.x;
        const hitDy = player.y - enemy.y;
        const hitRadius = player.radius + enemy.radius;
        if (hitDx * hitDx + hitDy * hitDy < hitRadius * hitRadius) {
            if (enemy.attackCooldown <= 0) {
                damagePlayer(enemy.damage, enemy);
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
