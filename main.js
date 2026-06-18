const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hpFill = document.getElementById("hpFill");
const xpFill = document.getElementById("xpFill");
const levelText = document.getElementById("levelText");
const killsText = document.getElementById("killsText");
const timerText = document.getElementById("timerText");
const levelUpOverlay = document.getElementById("levelUpOverlay");
const upgradeCards = document.getElementById("upgradeCards");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalTimeText = document.getElementById("finalTimeText");
const finalKillsText = document.getElementById("finalKillsText");
const restartButton = document.getElementById("restartButton");
const mainMenuOverlay = document.getElementById("mainMenuOverlay");
const playButton = document.getElementById("playButton");
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeButton = document.getElementById("resumeButton");
const buffPanel = document.getElementById("buffPanel");
const buffTimerText = document.getElementById("buffTimerText");
const shieldPanel = document.getElementById("shieldPanel");
const shieldTimerText = document.getElementById("shieldTimerText");
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const keys = new Set();
let state = "menu";
let lastTime = 0;
let gameTime = 0;
let spawnTimer = 0;
let screenShake = 0;
let screenShakeTimer = 0;
let damageFlash = 0;
let player;
let enemies = [];
let projectiles = [];
let gems = [];
let powerUps = [];
let spikes = [];
let spikeCanvas = null;
let particles = [];
let floatingTexts = [];
let currentUpgrades = [];
let powerUpSpawnTimer = 0;
let shieldSpawnTimer = 0;
const upgrades = [{
    id: "damage",
    icon: "✦",
    title: "Rune de puissance",
    description: "+25% dégâts des projectiles.",
    apply() {
        player.damage *= 1.25;
    }
}, {
    id: "fireRate",
    icon: "✹",
    title: "Rune de cadence",
    description: "Tire plus rapidement.",
    apply() {
        player.fireRate *= 0.86;
        player.fireRate = Math.max(0.12, player.fireRate);
    }
}, {
    id: "moveSpeed",
    icon: "➤",
    title: "Rune de célérité",
    description: "+15% vitesse de déplacement.",
    apply() {
        player.speed *= 1.15;
    }
}, {
    id: "projectileCount",
    icon: "☄",
    title: "Rune multiple",
    description: "+1 projectile à chaque attaque.",
    apply() {
        player.projectileCount += 1;
    }
}, {
    id: "projectileSize",
    icon: "●",
    title: "Rune colossale",
    description: "Les projectiles deviennent plus gros.",
    apply() {
        player.projectileRadius += 2;
    }
}, {
    id: "projectileSpeed",
    icon: "◆",
    title: "Rune véloce",
    description: "+30% vitesse des projectiles.",
    apply() {
        player.projectileSpeed *= 1.3;
    }
}, {
    id: "magnet",
    icon: "✧",
    title: "Rune d’attraction",
    description: "Attire l’XP de plus loin.",
    apply() {
        player.magnetRadius *= 1.45;
    }
}, {
    id: "maxHp",
    icon: "♥",
    title: "Rune vitale",
    description: "+25 PV max et soigne 25 PV.",
    apply() {
        player.maxHp += 25;
        player.hp = Math.min(player.maxHp, player.hp + 25);
    }
}, {
    id: "projectileBounce",
    icon: "↯",
    title: "Rune de ricochet",
    description: "Tes projectiles rebondissent 1 fois sur les murs. Permanent.",
    canAppear() {
        return player.projectileBounces === 0;
    },
    apply() {
        player.projectileBounces = 1;
    }
}, {
    id: "lifeSteal",
    icon: "✚",
    title: "Rune vampirique",
    description: "+5% de vol de vie. Les dégâts infligés te rendent des PV.",
    canAppear() {
        return player.lifeSteal < 0.25;
    },
    apply() {
        player.lifeSteal = Math.min(0.25, Number((player.lifeSteal + 0.05).toFixed(2)));
    }
}];

function resetGame() {
    state = "menu";
    gameTime = 0;
    spawnTimer = 0;
    screenShake = 0;
    screenShakeTimer = 0;
    damageFlash = 0;
    // objet player (player object)
    player = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        radius: 18,
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
        shieldTimer: 0,
        shieldBlockCooldown: 0,
        lifeSteal: 0,
        lifeStealBuffer: 0,
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
        knockbackY: 0
    };
    enemies = [];
    projectiles = [];
    gems = [];
    powerUps = [];
    spikes = [];
    spikeCanvas = null;
    particles = [];
    floatingTexts = [];
    powerUpSpawnTimer = 6;
    shieldSpawnTimer = 12;
    levelUpOverlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    mainMenuOverlay.classList.remove("hidden");
    updateHud();
}

function startGame() {
    resetGame();
    state = "playing";
    mainMenuOverlay.classList.add("hidden");
}

function pauseGame() {
    if (state !== "playing") {
        return;
    }
    state = "paused";
    pauseOverlay.classList.remove("hidden");
}

function resumeGame() {
    if (state !== "paused") {
        return;
    }
    state = "playing";
    pauseOverlay.classList.add("hidden");
}

function togglePause() {
    if (state === "playing") {
        pauseGame();
        return;
    }
    if (state === "paused") {
        resumeGame();
    }
}

function isPauseKey(event) {
    return (event.key === "Escape" || event.key === "Enter" || event.key === " " || event.key.toLowerCase() === "p");
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function normalize(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
        return {
            x: 0,
            y: 0
        };
    }
    return {
        x: dx / len,
        y: dy / len
    };
}

function spawnEnemy() {
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
    const difficulty = 1 + gameTime / 80;
    const typeRoll = Math.random();
    let enemy;
    if (gameTime > 60 && typeRoll > 0.82) {
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
    } else if (gameTime > 25 && typeRoll > 0.65) {
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
}

function findNearestEnemy() {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const enemy of enemies) {
        const d = distance(player, enemy);
        if (d < nearestDistance && d <= player.range) {
            nearest = enemy;
            nearestDistance = d;
        }
    }
    return nearest;
}

function shootAt(target) {
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
    const count = player.projectileCount;
    const spread = count === 1 ? 0 : 0.18;
    for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * spread;
        const angle = baseAngle + offset;
        projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * player.projectileSpeed,
            vy: Math.sin(angle) * player.projectileSpeed,
            radius: player.projectileRadius,
            damage: player.damage * player.damageMultiplier,
            life: 1.8,
            bouncesLeft: player.projectileBounces
        });
    }
    createParticles(player.x, player.y, 8, "#59dfff", 2.5);
}

function createParticles(x, y, count, color, speed = 1) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = randomBetween(60, 160) * speed;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            radius: randomBetween(2, 5),
            color,
            life: randomBetween(0.25, 0.55),
            maxLife: 0.55
        });
    }
}

function addFloatingText(x, y, text, color = "white") {
    floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 0.8,
        maxLife: 0.8
    });
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

function dropGem(x, y, value) {
    gems.push({
        x,
        y,
        value,
        radius: 8,
        vx: randomBetween(-60, 60),
        vy: randomBetween(-60, 60)
    });
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
    const playerSafeZone = 50;
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
        if (distance({
                x,
                y
            }, player) < playerSafeZone) {
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

function updatePowerUps(dt) {
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
    if (player.shieldTimer > 0) {
        return false;
    }
    player.shieldTimer = 8;
    player.shieldBlockCooldown = 0;
    addFloatingText(player.x, player.y - player.radius - 34, "BOUCLIER", "#d8dde8");
    createParticles(player.x, player.y, 42, "#d8dde8", 2.1);
    updateHud();
    return true;
}

function addXp(amount) {
    player.xp += amount;
    if (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level += 1;
        player.xpToNext = Math.floor(player.xpToNext * 1.35 + 10);
        showLevelUp();
    }
}

function showLevelUp() {
    state = "levelup";
    currentUpgrades = getRandomUpgrades(3);
    upgradeCards.innerHTML = "";
    currentUpgrades.forEach((upgrade, index) => {
        const card = document.createElement("button");
        card.className = "upgrade-card";
        card.innerHTML = ` <div class="upgrade-icon">${upgrade.icon}</div> <h2>${upgrade.title}</h2> <p>${upgrade.description}</p> <div class="upgrade-key">Touche ${index + 1}</div> `;
        card.addEventListener("click", () => chooseUpgrade(index));
        upgradeCards.appendChild(card);
    });
    levelUpOverlay.classList.remove("hidden");
}

function canUpgradeAppear(upgrade) {
    if (typeof upgrade.canAppear === "function") {
        return upgrade.canAppear();
    }
    return true;
}

function getRandomUpgrades(count) {
    const selected = [];
    const priorityUpgrade = upgrades.find((upgrade) => {
        return upgrade.id === "projectileBounce" && canUpgradeAppear(upgrade);
    });
    if (priorityUpgrade) {
        selected.push(priorityUpgrade);
    }
    const pool = upgrades.filter((upgrade) => {
        return upgrade !== priorityUpgrade && canUpgradeAppear(upgrade);
    });
    while (selected.length < count && pool.length > 0) {
        const index = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(index, 1)[0]);
    }
    return selected;
}

function chooseUpgrade(index) {
    if (state !== "levelup") {
        return;
    }
    const upgrade = currentUpgrades[index];
    if (!upgrade) {
        return;
    }
    upgrade.apply();
    createParticles(player.x, player.y, 40, "#b88cff", 2.2);
    levelUpOverlay.classList.add("hidden");
    state = "playing";
    updateHud();
}

function update(dt) {
    gameTime += dt;
    updatePlayer(dt);
    updateSpikes();
    updatePowerUps(dt);
    updateSpawns(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updateGems(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updateHud();
}

function updateVisualEffects(dt) {
    if (screenShakeTimer > 0) {
        screenShakeTimer -= dt;
        if (screenShakeTimer <= 0) {
            screenShakeTimer = 0;
            screenShake = 0;
        }
    } else {
        screenShake = 0;
    }
    damageFlash = Math.max(0, damageFlash - dt * 2.8);
}

function updatePlayer(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowup") || keys.has("w") || keys.has("z")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
    if (keys.has("arrowleft") || keys.has("a") || keys.has("q")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    const dir = normalize(dx, dy);
    player.x += dir.x * player.speed * dt;
    player.y += dir.y * player.speed * dt;
    player.x += player.knockbackX * dt;
    player.y += player.knockbackY * dt;
    player.knockbackX *= Math.pow(0.02, dt);
    player.knockbackY *= Math.pow(0.02, dt);
    player.x = Math.max(player.radius, Math.min(GAME_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(GAME_HEIGHT - player.radius, player.y));
    player.fireCooldown -= dt;
    if (player.fireCooldown <= 0) {
        const target = findNearestEnemy();
        if (target) {
            shootAt(target);
            player.fireCooldown = player.fireRate;
        }
    }
    player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);
    player.spikeInvulnerabilityTimer = Math.max(0, player.spikeInvulnerabilityTimer - dt);
    player.hitFlashTimer = Math.max(0, player.hitFlashTimer - dt);
    player.shieldTimer = Math.max(0, player.shieldTimer - dt);
    player.shieldBlockCooldown = Math.max(0, player.shieldBlockCooldown - dt);
    player.damageBoostTimer = Math.max(0, player.damageBoostTimer - dt);
    if (player.damageBoostTimer <= 0) {
        player.damageMultiplier = 1;
        if (spikes.length > 0) {
            spikes = [];
            spikeCanvas = null;
        }
    }
}

function updateSpawns(dt) {
    spawnTimer -= dt;
    const spawnInterval = Math.max(0.22, 1.05 - gameTime / 160);
    if (spawnTimer <= 0) {
        spawnEnemy();
        if (gameTime > 35 && Math.random() > 0.72) {
            spawnEnemy();
        }
        if (gameTime > 90 && Math.random() > 0.78) {
            spawnEnemy();
        }
        spawnTimer = spawnInterval;
    }
}

function updateEnemies(dt) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
        const dir = normalize(player.x - enemy.x, player.y - enemy.y);
        enemy.x += dir.x * enemy.speed * dt;
        enemy.y += dir.y * enemy.speed * dt;
        const d = distance(player, enemy);
        if (d < player.radius + enemy.radius) {
            if (enemy.attackCooldown <= 0) {
                damagePlayer(enemy.damage, enemy);
                enemy.attackCooldown = 0.65;
            }
        }
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
        createParticles(projectile.x, projectile.y, 10, "#ffd86b", 1.2);
    }
    return bounced;
}

function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;
        projectile.life -= dt;
        let projectileRemoved = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const d = distance(projectile, enemy);
            if (d < projectile.radius + enemy.radius) {
                const damageDealt = Math.min(projectile.damage, enemy.hp);
                enemy.hp -= projectile.damage;
                applyLifeSteal(damageDealt);
                addFloatingText(enemy.x, enemy.y - enemy.radius, Math.floor(projectile.damage), "#ffe6ff");
                createParticles(projectile.x, projectile.y, 12, "#75e8ff", 1.3);
                projectiles.splice(i, 1);
                projectileRemoved = true;
                if (enemy.hp <= 0) {
                    player.kills += 1;
                    dropGem(enemy.x, enemy.y, enemy.xp);
                    createParticles(enemy.x, enemy.y, 22, enemy.color, 1.7);
                    enemies.splice(j, 1);
                }
                break;
            }
        }
        if (projectileRemoved) {
            continue;
        }
        handleProjectileBounce(projectile);
        const outside = projectile.x < -100 || projectile.x > GAME_WIDTH + 100 || projectile.y < -100 || projectile.y > GAME_HEIGHT + 100;
        if (projectile.life <= 0 || outside) {
            projectiles.splice(i, 1);
        }
    }
}

function applyLifeSteal(damageDealt) {
    if (player.lifeSteal <= 0) {
        return;
    }
    if (damageDealt <= 0) {
        return;
    }
    player.lifeStealBuffer += damageDealt * player.lifeSteal;
    const healAmount = Math.floor(player.lifeStealBuffer);
    if (healAmount <= 0) {
        return;
    }
    player.lifeStealBuffer -= healAmount;
    healPlayer(healAmount);
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
    const actualHeal = Math.floor(player.hp - previousHp);
    if (actualHeal <= 0) {
        return;
    }
    addFloatingText(player.x, player.y - player.radius - 34, `+${actualHeal}`, "#68ff96");
    createParticles(player.x, player.y, 8, "#68ff96", 1.1);
    updateHud();
}

function updateGems(dt) {
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];
        gem.x += gem.vx * dt;
        gem.y += gem.vy * dt;
        gem.vx *= 0.92;
        gem.vy *= 0.92;
        const d = distance(player, gem);
        if (d < player.magnetRadius) {
            const dir = normalize(player.x - gem.x, player.y - gem.y);
            const pullSpeed = 280 + (player.magnetRadius - d) * 5;
            gem.x += dir.x * pullSpeed * dt;
            gem.y += dir.y * pullSpeed * dt;
        }
        if (d < player.radius + gem.radius) {
            addXp(gem.value);
            createParticles(gem.x, gem.y, 10, "#48dfff", 1.2);
            gems.splice(i, 1);
        }
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.life -= dt;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const text = floatingTexts[i];
        text.y -= 45 * dt;
        text.life -= dt;
        if (text.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function updateHud() {
    hpFill.style.width = `${(player.hp / player.maxHp) * 100}%`;
    xpFill.style.width = `${(player.xp / player.xpToNext) * 100}%`;
    levelText.textContent = player.level;
    killsText.textContent = player.kills;
    timerText.textContent = formatTime(gameTime);
    if (player.damageBoostTimer > 0) {
        buffPanel.classList.remove("hidden");
        buffTimerText.textContent = `${Math.ceil(player.damageBoostTimer)}s`;
    } else {
        buffPanel.classList.add("hidden");
    }
    if (player.shieldTimer > 0) {
        shieldPanel.classList.remove("hidden");
        shieldTimerText.textContent = `${Math.ceil(player.shieldTimer)}s`;
    } else {
        shieldPanel.classList.add("hidden");
    }
}

function endGame() {
    state = "gameover";
    finalTimeText.textContent = formatTime(gameTime);
    finalKillsText.textContent = player.kills;
    gameOverOverlay.classList.remove("hidden");
}

function render() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.save();
    if (screenShake > 0) {
        ctx.translate(randomBetween(-screenShake, screenShake), randomBetween(-screenShake, screenShake));
    }
    drawBackground();
    drawSpikes();
    drawGems();
    drawPowerUps();
    drawProjectiles();
    drawEnemies();
    drawPlayer();
    drawParticles();
    drawFloatingTexts();
    ctx.restore();
    drawDamageOverlay();
}

function drawBackground() {
    const tileSize = 64;
    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.strokeStyle = "rgba(142, 113, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < GAME_WIDTH; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < GAME_HEIGHT; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
    }
    ctx.save();
    ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.strokeStyle = "rgba(135, 91, 255, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 170, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const x = Math.cos(angle) * 215;
        const y = Math.sin(angle) * 215;
        ctx.fillStyle = "rgba(105, 218, 255, 0.16)";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawSpikes() {
    if (!spikes || spikes.length === 0) {
        return;
    }
    if (!player || player.damageBoostTimer <= 0) {
        return;
    }
    if (!spikeCanvas) {
        spikeCanvas = createSpikeCanvas(spikes);
    }
    ctx.drawImage(spikeCanvas, 0, 0);
}

function createSpikeCanvas(spikeList) {
    const buffer = document.createElement("canvas");
    buffer.width = GAME_WIDTH;
    buffer.height = GAME_HEIGHT;
    const bufferCtx = buffer.getContext("2d");
    for (const spike of spikeList) {
        drawSingleSpike(bufferCtx, spike);
    }
    return buffer;
}

function drawSingleSpike(drawCtx, spike) {
    drawCtx.save();
    drawCtx.translate(spike.x, spike.y);
    drawCtx.rotate(spike.angle);
    const r = spike.radius;
    drawCtx.shadowColor = spike.kind === "border" ? "#ff365d" : "#ff9b6b";
    drawCtx.shadowBlur = spike.kind === "border" ? 9 : 12;
    drawCtx.fillStyle = spike.kind === "border" ? "#7d7182" : "#9d8580";
    drawCtx.strokeStyle = spike.kind === "border" ? "#ff365d" : "#ff9b6b";
    drawCtx.lineWidth = 2;
    drawCtx.beginPath();
    drawCtx.moveTo(r + 9, 0);
    drawCtx.lineTo(-r, -r * 0.78);
    drawCtx.lineTo(-r, r * 0.78);
    drawCtx.closePath();
    drawCtx.fill();
    drawCtx.stroke();
    drawCtx.shadowBlur = 0;
    drawCtx.fillStyle = "rgba(255, 255, 255, 0.35)";
    drawCtx.beginPath();
    drawCtx.moveTo(r + 4, 0);
    drawCtx.lineTo(-r * 0.25, -r * 0.25);
    drawCtx.lineTo(-r * 0.1, 0);
    drawCtx.closePath();
    drawCtx.fill();
    drawCtx.restore();
}

function drawDamageOverlay() {
    if (damageFlash <= 0) {
        return;
    }
    const alpha = Math.min(0.42, damageFlash);
    ctx.save();
    ctx.fillStyle = `rgba(255, 20, 55, ${alpha * 0.18})`;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const gradient = ctx.createRadialGradient(GAME_WIDTH / 2, GAME_HEIGHT / 2, 130, GAME_WIDTH / 2, GAME_HEIGHT / 2, 620);
    gradient.addColorStop(0, "rgba(255, 20, 55, 0)");
    gradient.addColorStop(1, `rgba(255, 20, 55, ${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.restore();
}

function drawPlayer() {
    ctx.save();
    const isHit = player.hitFlashTimer > 0;
    const isBlinking = player.invulnerabilityTimer > 0 && !isHit && Math.floor(gameTime * 24) % 2 === 0;
    if (isBlinking) {
        ctx.globalAlpha = 0.55;
    }
    ctx.fillStyle = "#27214f";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isHit ? "#ffffff" : "#6ee6ff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isHit ? "#ff365d" : "#f7f0ff";
    ctx.beginPath();
    ctx.arc(player.x, player.y - 5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9c9ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(player.x + 14, player.y + 14);
    ctx.lineTo(player.x + 28, player.y - 22);
    ctx.stroke();
    ctx.fillStyle = "#ffdf6e";
    ctx.beginPath();
    ctx.arc(player.x + 29, player.y - 24, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 16;
        if (enemy.type === "bat") {
            ctx.beginPath();
            ctx.ellipse(enemy.x, enemy.y, enemy.radius + 8, enemy.radius, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1b1028";
            ctx.beginPath();
            ctx.arc(enemy.x - 5, enemy.y - 2, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + 5, enemy.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (enemy.type === "brute") {
            ctx.beginPath();
            ctx.roundRect(enemy.x - enemy.radius, enemy.y - enemy.radius, enemy.radius * 2, enemy.radius * 2, 10);
            ctx.fill();
            ctx.fillStyle = "#371010";
            ctx.beginPath();
            ctx.arc(enemy.x - 8, enemy.y - 5, 3, 0, Math.PI * 2);
            ctx.arc(enemy.x + 8, enemy.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1b1028";
            ctx.beginPath();
            ctx.arc(enemy.x - 6, enemy.y - 4, 3, 0, Math.PI * 2);
            ctx.arc(enemy.x + 6, enemy.y - 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        const hpWidth = enemy.radius * 2;
        const hpHeight = 5;
        const hpPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 14, hpWidth, hpHeight);
        ctx.fillStyle = "#ff4066";
        ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 14, hpWidth * hpPercent, hpHeight);
        ctx.restore();
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        ctx.save();
        ctx.fillStyle = "#73ecff";
        ctx.shadowColor = "#73ecff";
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawGems() {
    for (const gem of gems) {
        ctx.save();
        ctx.translate(gem.x, gem.y);
        ctx.rotate(gameTime * 3);
        ctx.fillStyle = "#45dfff";
        ctx.shadowColor = "#45dfff";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(0, -gem.radius);
        ctx.lineTo(gem.radius, 0);
        ctx.lineTo(0, gem.radius);
        ctx.lineTo(-gem.radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function drawPowerUps() {
    if (!powerUps || powerUps.length === 0) {
        return;
    }
    for (const powerUp of powerUps) {
        const isShield = powerUp.type === "shield";
        const color = isShield ? "#d8dde8" : "#ffd86b";
        const darkColor = isShield ? "#1c2028" : "#241209";
        const label = isShield ? "⛨" : "x2";
        const pulse = Math.sin(powerUp.pulse * 7) * 0.18 + 1;
        const radius = powerUp.radius * pulse;
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        ctx.rotate(gameTime * 2.2);
        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 52);
        glow.addColorStop(0, isShield ? "rgba(216, 221, 232, 0.48)" : "rgba(255, 216, 107, 0.55)");
        glow.addColorStop(1, isShield ? "rgba(216, 221, 232, 0)" : "rgba(255, 216, 107, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = color;
        ctx.shadowBlur = 22;
        ctx.fillStyle = color;
        if (isShield) {
            ctx.beginPath();
            ctx.moveTo(0, -radius);
            ctx.quadraticCurveTo(radius, -radius * 0.65, radius * 0.72, radius * 0.35);
            ctx.quadraticCurveTo(radius * 0.35, radius, 0, radius * 1.15);
            ctx.quadraticCurveTo(-radius * 0.35, radius, -radius * 0.72, radius * 0.35);
            ctx.quadraticCurveTo(-radius, -radius * 0.65, 0, -radius);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(0, -radius);
            ctx.lineTo(radius, 0);
            ctx.lineTo(0, radius);
            ctx.lineTo(-radius, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.rotate(-gameTime * 2.2);
        ctx.fillStyle = darkColor;
        ctx.font = isShield ? "bold 18px Arial" : "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, 1);
        ctx.restore();
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawFloatingTexts() {
    ctx.save();
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    for (const text of floatingTexts) {
        const alpha = Math.max(0, text.life / text.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = text.color;
        ctx.fillText(text.text, text.x, text.y);
    }
    ctx.restore();
}

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
window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (isPauseKey(event)) {
        event.preventDefault();
        if (!event.repeat) {
            togglePause();
        }
        return;
    }
    keys.add(key);
    if (state === "levelup") {
        if (key === "1") chooseUpgrade(0);
        if (key === "2") chooseUpgrade(1);
        if (key === "3") chooseUpgrade(2);
    }
    if (state === "gameover" && key === "r") {
        startGame();
    }
});
window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
});
playButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
resumeButton.addEventListener("click", resumeGame);
resetGame();
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
});