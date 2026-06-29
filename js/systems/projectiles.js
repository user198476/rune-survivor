function shootAt(target) {
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);

    player.targetAimAngle = baseAngle;

    fireProjectileVolley(player.x, player.y, baseAngle, 1, "#59dfff");

    if (
        player.tripleEchoTimer > 0 &&
        player.tripleEchoClones &&
        player.tripleEchoClones.length > 0
    ) {
        for (const clone of player.tripleEchoClones) {
            const cloneAngle = Math.atan2(
                target.y - clone.y,
                target.x - clone.x
            );

            fireProjectileVolley(
                clone.x,
                clone.y,
                cloneAngle,
                TRIPLE_ECHO_DAMAGE_RATIO,
                "#d7b4ff"
            );
        }
    } else if (player.cloneTimer > 0) {
        const cloneAngle = Math.atan2(
            target.y - player.cloneY,
            target.x - player.cloneX
        );

        fireProjectileVolley(
            player.cloneX,
            player.cloneY,
            cloneAngle,
            ARCANE_CLONE_DAMAGE_RATIO,
            "#b88cff"
        );
    }

    if (projectiles.length > MAX_ACTIVE_PROJECTILES) {
        projectiles.splice(0, projectiles.length - MAX_ACTIVE_PROJECTILES);
    }
}

function fireProjectileVolley(x, y, baseAngle, damageRatio = 1, particleColor = "#59dfff") {
    const count = player.projectileCount;
    const spread = count === 1 ? 0 : 0.18;
    for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * spread;
        const angle = baseAngle + offset;
        projectiles.push({
            x,
            y,
            vx: Math.cos(angle) * player.projectileSpeed,
            vy: Math.sin(angle) * player.projectileSpeed,
            radius: player.projectileRadius,
            damage: player.damage * player.damageMultiplier * damageRatio,
            life: 1.8,
            bouncesLeft: player.projectileBounces,
            color: particleColor
        });
    }
    createParticles(x, y, 6, particleColor, 2.2);
}

function updateProjectiles(dt) {
    let enemiesNeedCleanup = false;
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        projectile.life -= dt;
        let projectileRemoved = false;
        forEachNearbyEnemyIndex(projectile.x, projectile.y, (enemyIndex) => {
            const enemy = enemies[enemyIndex];
            if (!enemy || enemy.dead) {
                return false;
            }
            const dx = projectile.x - enemy.x;
            const dy = projectile.y - enemy.y;
            const radius = projectile.radius + enemy.radius;
            if (dx * dx + dy * dy < radius * radius) {
                const damageDealt = Math.min(projectile.damage, enemy.hp);
                enemy.hp -= projectile.damage;
                if (typeof applyLifeSteal === "function") {
                    applyLifeSteal(damageDealt);
                }
                addFloatingText(enemy.x, enemy.y - enemy.radius, Math.floor(projectile.damage), "#ffe6ff");
                createParticles(projectile.x, projectile.y, 12, projectile.color || "#75e8ff", 1.3);
                projectiles.splice(i, 1);
                projectileRemoved = true;
                if (enemy.hp <= 0 && !enemy.dead) {
                    enemy.dead = true;
                    enemiesNeedCleanup = true;
                    player.kills += 1;

                    if (!enemy.isBoss && enemy.xp > 0) {
                        dropGem(enemy.x, enemy.y, enemy.xp);
                    }

                    createParticles(enemy.x, enemy.y, enemy.isBoss ? 48 : 22, enemy.color, enemy.isBoss ? 2.4 : 1.7);
                }
                return true;
            }
            return false;
        });
        if (projectileRemoved) {
            continue;
        }
        handleProjectileBounce(projectile);
        const outside = projectile.x < -100 || projectile.x > GAME_WIDTH + 100 || projectile.y < -100 || projectile.y > GAME_HEIGHT + 100;
        if (projectile.life <= 0 || outside) {
            projectiles.splice(i, 1);
        }
    }
    if (enemiesNeedCleanup) {
        enemies = enemies.filter((enemy) => !enemy.dead);
    }
}

function handleProjectileBounce(projectile) {
    if (projectile.bouncesLeft <= 0) {
        return false;
    }
    let bounced = false;
    if (projectile.x - projectile.radius <= 0) {
        projectile.x = projectile.radius;
        projectile.vx *= -1;
        bounced = true;
    } else if (projectile.x + projectile.radius >= GAME_WIDTH) {
        projectile.x = GAME_WIDTH - projectile.radius;
        projectile.vx *= -1;
        bounced = true;
    }
    if (projectile.y - projectile.radius <= 0) {
        projectile.y = projectile.radius;
        projectile.vy *= -1;
        bounced = true;
    } else if (projectile.y + projectile.radius >= GAME_HEIGHT) {
        projectile.y = GAME_HEIGHT - projectile.radius;
        projectile.vy *= -1;
        bounced = true;
    }
    if (bounced) {
        projectile.bouncesLeft -= 1;
        createParticles(projectile.x, projectile.y, 10, projectile.color || "#ffd86b", 1.2);
    }
    return bounced;
}

function findNearestEnemy() {
    let nearest = null;
    let nearestDistanceSq = Infinity;
    const rangeSq = player.range * player.range;
    for (const enemy of enemies) {
        if (!enemy || enemy.dead) {
            continue;
        }
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < nearestDistanceSq && dSq <= rangeSq) {
            nearest = enemy;
            nearestDistanceSq = dSq;
        }
    }
    return nearest;
}