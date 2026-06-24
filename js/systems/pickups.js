function updatePowerUps(dt) {
    if (!arePickablePowerUpsAllowed()) {
        powerUps = [];
        return;
    }

    if (!powerUps) {
        powerUps = [];
    }
    powerUpSpawnTimer -= dt;
    if (powerUpSpawnTimer <= 0) {
        const hasDamageBoost = powerUps.some((powerUp) => powerUp.type === "damageBoost");
        const damageBoostActive = player.damageBoostTimer > 0;
        if (!hasDamageBoost && !damageBoostActive) {
            spawnDamageBoost();
        }
        powerUpSpawnTimer = randomBetween(18, 26);
    }
    shieldSpawnTimer -= dt;
    if (shieldSpawnTimer <= 0) {
        const hasShieldPowerUp = powerUps.some((powerUp) => powerUp.type === "shield");
        const shieldActive = player.shieldTimer > 0;
        if (!hasShieldPowerUp && !shieldActive) {
            spawnShieldPowerUp();
        }
        shieldSpawnTimer = randomBetween(28, 42);
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.life -= dt;
        powerUp.pulse += dt;
        const d = distance(player, powerUp);
        if (d < player.radius + powerUp.radius) {
            let activated = false;
            if (powerUp.type === "damageBoost") {
                activated = activateDamageBoost();
            }
            if (powerUp.type === "shield") {
                activated = activateShield();
            }
            if (activated) {
                const color = powerUp.type === "shield" ? "#d8dde8" : "#ffd86b";
                createParticles(powerUp.x, powerUp.y, 36, color, 2.4);
                powerUps.splice(i, 1);
            }
            continue;
        }
        if (powerUp.life <= 0) {
            const color = powerUp.type === "shield" ? "#d8dde8" : "#ffd86b";
            createParticles(powerUp.x, powerUp.y, 14, color, 1.1);
            powerUps.splice(i, 1);
        }
    }
}

function activateDamageBoost() {
    if (!arePickablePowerUpsAllowed()) {
        return false;
    }
    if (player.damageBoostTimer > 0) {
        return false;
    }
    player.damageMultiplier = 2;
    player.damageBoostTimer = 12;
    spikes = createSpikes();
    spikeCanvas = createSpikeCanvas(spikes);
    addFloatingText(player.x, player.y - player.radius - 34, "DÉGÂTS x2", "#ffd86b");
    createParticles(player.x, player.y, 48, "#ffd86b", 2.5);
    updateHud();
    return true;
}

function activateShield() {
    if (!arePickablePowerUpsAllowed()) {
        return false;
    }
    if (player.shieldTimer > 0) {
        return false;
    }
    player.shieldTimer = 8 + (player.shieldDurationBonus || 0);
    player.shieldBlockCooldown = 0;
    addFloatingText(player.x, player.y - player.radius - 34, "BOUCLIER", "#d8dde8");
    createParticles(player.x, player.y, 42, "#d8dde8", 2.1);
    updateHud();
    return true;
}

function disablePickableBuffsForBoss() {
    powerUps = [];

    player.damageBoostTimer = 0;
    player.damageMultiplier = 1;

    player.shieldTimer = 0;
    player.shieldBlockCooldown = 0;

    spikes = [];
    spikeCanvas = null;

    buffPanel.classList.add("hidden");
    shieldPanel.classList.add("hidden");
}

function arePickablePowerUpsAllowed() {
    return bossState === "none";
}

function createSpikes() {
    const result = [];
    const spacing = 38;
    const borderOffset = 18;
    for (let x = borderOffset; x <= GAME_WIDTH - borderOffset; x += spacing) {
        result.push({
            x,
            y: borderOffset,
            radius: 17,
            angle: Math.PI / 2,
            kind: "border"
        });
        result.push({
            x,
            y: GAME_HEIGHT - borderOffset,
            radius: 17,
            angle: -Math.PI / 2,
            kind: "border"
        });
    }
    for (let y = borderOffset; y <= GAME_HEIGHT - borderOffset; y += spacing) {
        result.push({
            x: borderOffset,
            y,
            radius: 17,
            angle: 0,
            kind: "border"
        });
        result.push({
            x: GAME_WIDTH - borderOffset,
            y,
            radius: 17,
            angle: Math.PI,
            kind: "border"
        });
    }
    const center = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2
    };
    const playerSafeZone = 80;
    let added = 0;
    let attempts = 0;
    while (added < 12 && attempts < 300) {
        attempts++;
        const x = randomBetween(120, GAME_WIDTH - 120);
        const y = randomBetween(110, GAME_HEIGHT - 110);
        if (distance({
                x,
                y
            }, center) < 180) {
            continue;
        }
        const dxPlayer = x - player.x;
        const dyPlayer = y - player.y;
        if (dxPlayer * dxPlayer + dyPlayer * dyPlayer < playerSafeZone * playerSafeZone) {
            continue;
        }
        if (isTooCloseToSpike(result, x, y, 95)) {
            continue;
        }
        result.push({
            x,
            y,
            radius: 18,
            angle: Math.random() * Math.PI * 2,
            kind: "field"
        });
        added++;
    }
    return result;
}

function updateSpikes() {
    if (!spikes || spikes.length === 0) {
        return;
    }
    if (player.damageBoostTimer <= 0) {
        return;
    }
    if (player.spikeInvulnerabilityTimer > 0) {
        return;
    }
    for (const spike of spikes) {
        const dx = player.x - spike.x;
        const dy = player.y - spike.y;
        const radius = player.radius + spike.radius;
        if (dx * dx + dy * dy < radius * radius) {
            damagePlayerFromSpike(spike);
            break;
        }
    }
}

function isTooCloseToSpike(spikeList, x, y, minDistance) {
    for (const spike of spikeList) {
        const dx = spike.x - x;
        const dy = spike.y - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDistance) {
            return true;
        }
    }
    return false;
}

function spawnDamageBoost() {
    for (let attempt = 0; attempt < 120; attempt++) {
        const x = randomBetween(90, GAME_WIDTH - 90);
        const y = randomBetween(90, GAME_HEIGHT - 90);
        if (distance({
                x,
                y
            }, player) < 180) {
            continue;
        }
        if (isTooCloseToSpike(spikes, x, y, 70)) {
            continue;
        }
        powerUps.push({
            type: "damageBoost",
            x,
            y,
            radius: 15,
            life: 18,
            pulse: 0
        });
        return;
    }
}

function spawnShieldPowerUp() {
    for (let attempt = 0; attempt < 120; attempt++) {
        const x = randomBetween(90, GAME_WIDTH - 90);
        const y = randomBetween(90, GAME_HEIGHT - 90);
        if (distance({
                x,
                y
            }, player) < 160) {
            continue;
        }
        if (isTooCloseToSpike(spikes, x, y, 70)) {
            continue;
        }
        powerUps.push({
            type: "shield",
            x,
            y,
            radius: 16,
            life: 18,
            pulse: 0
        });
        return;
    }
}
