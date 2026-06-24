function getEnemyDistanceSqToPlayer(enemy) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    return dx * dx + dy * dy;
}

function countEnemiesNearPlayer(radius) {
    const radiusSq = radius * radius;
    const cellRadius = Math.ceil(radius / ENEMY_GRID_SIZE) + 1;
    const playerCellX = getEnemyGridCell(player.x);
    const playerCellY = getEnemyGridCell(player.y);
    let count = 0;
    for (let offsetY = -cellRadius; offsetY <= cellRadius; offsetY++) {
        for (let offsetX = -cellRadius; offsetX <= cellRadius; offsetX++) {
            const key = getEnemyGridKey(playerCellX + offsetX, playerCellY + offsetY);
            const bucket = enemyGrid.get(key);
            if (!bucket) {
                continue;
            }
            for (const enemyIndex of bucket) {
                const enemy = enemies[enemyIndex];
                if (!enemy || enemy.dead) {
                    continue;
                }
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (dx * dx + dy * dy <= radiusSq) {
                    count++;
                }
            }
        }
    }
    return count;
}

function updateHordePressure(dt) {
    const nearbyEnemies = countEnemiesNearPlayer(HORDE_PRESSURE_RADIUS);
    if (nearbyEnemies <= HORDE_PRESSURE_START) {
        return;
    }
    const extraEnemies = nearbyEnemies - HORDE_PRESSURE_START;
    player.healLockTimer = Math.max(player.healLockTimer || 0, HORDE_PRESSURE_HEAL_LOCK);
    if (player.hordeDamageTimer > 0) {
        return;
    }
    const damage = HORDE_PRESSURE_BASE_DAMAGE + extraEnemies * HORDE_PRESSURE_DAMAGE_PER_EXTRA_ENEMY;
    damagePlayerByHordePressure(damage, nearbyEnemies);
    player.hordeDamageTimer = HORDE_PRESSURE_TICK;
}
