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
const scoreText = document.getElementById("scoreText");
const bestScoreText = document.getElementById("bestScoreText");
const newBestBadge = document.getElementById("newBestBadge");
const finalScoreText = document.getElementById("finalScoreText");
const finalBestScoreText = document.getElementById("finalBestScoreText");
const finalNewBestBadge = document.getElementById("finalNewBestBadge");
const pauseScoreText = document.getElementById("pauseScoreText");
const pauseBestScoreText = document.getElementById("pauseBestScoreText");
const openSkillTreeButton = document.getElementById("openSkillTreeButton");
const pauseSkillTreeButton = document.getElementById("pauseSkillTreeButton");
const gameOverSkillTreeButton = document.getElementById("gameOverSkillTreeButton");
const closeSkillTreeButton = document.getElementById("closeSkillTreeButton");
const menuCoinsText = document.getElementById("menuCoinsText");
const skillTreeCoinsText = document.getElementById("skillTreeCoinsText");
const skillTreeOverlay = document.getElementById("skillTreeOverlay");
const skillTreeBranches = document.getElementById("skillTreeBranches");
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
const BEST_SCORE_STORAGE_KEYS = ["runeSurvivorBestScore", "runeSurvivor.bestScore", "RuneSurvivor_BEST_SCORE"];
const BEST_SCORE_STATS_KEY = "runeSurvivor.stats";
const CURRENT_RUN_STORAGE_KEY = "runeSurvivor.currentRun";
let bestScore = 0;
let currentScore = 0;
let newBestThisRun = false;
let lastSavedCurrentScore = -1;
let lastSavedBestScore = -1;
const ENEMY_GRID_SIZE = 140;
const MAX_PARTICLES = 450;
const MAX_FLOATING_TEXTS = 90;
const MAX_ACTIVE_ENEMIES = 150;
const MAX_ACTIVE_PROJECTILES = 260;
const HORDE_PRESSURE_RADIUS = 155;
const HORDE_PRESSURE_START = 12;
const HORDE_PRESSURE_TICK = 0.22;
const HORDE_PRESSURE_BASE_DAMAGE = 4;
const HORDE_PRESSURE_DAMAGE_PER_EXTRA_ENEMY = 1.15;
const HORDE_PRESSURE_HEAL_LOCK = 0.45;
let enemyGrid = new Map();
const enemySpriteCache = new Map();
const LIFE_STEAL_MAX_HEAL_PER_SECOND_RATIO = 0.10;
const LIFE_STEAL_MIN_HEAL_PER_SECOND = 8;
const HIT_HEAL_LOCK_DURATION = 0.22;
const SPIKE_HEAL_LOCK_DURATION = 1.15;
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
    description: "+3% de vol de vie. Maximum 15%.",
    canAppear() {
        return player.lifeSteal < 0.15;
    },
    apply() {
        player.lifeSteal = Math.min(0.15, Number((player.lifeSteal + 0.03).toFixed(2)));
    }
}];
const META_STORAGE_KEYS = {
    coins: "runeSurvivor.meta.coins",
    skills: "runeSurvivor.meta.skills"
};
let metaCoins = 0;
let metaSkills = {};
let runRewardGranted = false;
let skillTreeReturnState = "menu";
const SKILL_TREE = [{
    id: "damage",
    label: "Dégâts",
    icon: "✦",
    className: "damage",
    nodes: [{
        id: "damage_power",
        nodeIcon: "✦",
        title: "Puissance brute",
        desc: "+5% dégâts par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "damagePercent",
        effectValue: 0.05
    }, {
        id: "damage_rate",
        nodeIcon: "✹",
        title: "Cadence runique",
        desc: "-4% de cooldown de tir par niveau.",
        maxLevel: 5,
        baseCost: 320,
        costStep: 170,
        requires: [{
            id: "damage_power",
            level: 1
        }],
        effectType: "fireRateReduction",
        effectValue: 0.04
    }, {
        id: "damage_proj",
        nodeIcon: "➶",
        title: "Projectiles véloces",
        desc: "+8% vitesse des projectiles par niveau.",
        maxLevel: 5,
        baseCost: 480,
        costStep: 220,
        requires: [{
            id: "damage_rate",
            level: 1
        }],
        effectType: "projectileSpeedPercent",
        effectValue: 0.08
    }]
}, {
    id: "defense",
    label: "Vie / Défense",
    icon: "❤",
    className: "defense",
    nodes: [{
        id: "defense_hp",
        nodeIcon: "♥",
        title: "Vitalité",
        desc: "+15 PV max par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "maxHpFlat",
        effectValue: 15
    }, {
        id: "defense_lifesteal",
        nodeIcon: "✚",
        title: "Sang ancien",
        desc: "+1% vol de vie permanent par niveau.",
        maxLevel: 5,
        baseCost: 360,
        costStep: 190,
        requires: [{
            id: "defense_hp",
            level: 1
        }],
        effectType: "lifeStealPercent",
        effectValue: 0.01
    }, {
        id: "defense_shield",
        nodeIcon: "⛨",
        title: "Maîtrise du bouclier",
        desc: "+0.75s de durée de bouclier par niveau.",
        maxLevel: 4,
        baseCost: 520,
        costStep: 260,
        requires: [{
            id: "defense_lifesteal",
            level: 1
        }],
        effectType: "shieldDurationFlat",
        effectValue: 0.75
    }]
}, {
    id: "speed",
    nodeIcon: "➜",
    label: "Vitesse",
    icon: "➜",
    className: "speed",
    nodes: [{
        id: "speed_move",
        nodeIcon: "➜",
        title: "Célérité",
        desc: "+5% vitesse de déplacement par niveau.",
        maxLevel: 5,
        baseCost: 200,
        costStep: 120,
        effectType: "moveSpeedPercent",
        effectValue: 0.05
    }, {
        id: "speed_magnet",
        nodeIcon: "◌",
        title: "Attraction",
        desc: "+14 de rayon d’aspiration XP par niveau.",
        maxLevel: 5,
        baseCost: 300,
        costStep: 160,
        requires: [{
            id: "speed_move",
            level: 1
        }],
        effectType: "magnetFlat",
        effectValue: 14
    }, {
        id: "speed_xp",
        nodeIcon: "✧",
        title: "Instinct",
        desc: "+5% d’XP gagnée par niveau.",
        maxLevel: 5,
        baseCost: 460,
        costStep: 210,
        requires: [{
            id: "speed_magnet",
            level: 1
        }],
        effectType: "xpGainPercent",
        effectValue: 0.05
    }]
}];
const SKILL_TREE_MAP_HEIGHT = 680;

const SKILL_TREE_LAYOUT = {
    origin: {
        x: 50,
        y: 610
    },

    branches: {
        damage: {
            label: { x: 10, y: 28 },
            bend: -8,
            nodes: [
                { x: 40, y: 520, card: "left", cardOffsetY: 34 },
                { x: 30, y: 392, card: "left", cardOffsetY: -8 },
                { x: 24, y: 256, card: "right", cardOffsetY: -34 }
            ]
        },

        speed: {
            label: { x: 50, y: 28 },
            bend: 0,
            nodes: [
                { x: 50, y: 500, card: "right", cardOffsetY: 8 },
                { x: 50, y: 360, card: "left", cardOffsetY: -10 },
                { x: 50, y: 220, card: "right", cardOffsetY: -26 }
            ]
        },

        defense: {
            label: { x: 82, y: 28 },
            bend: 8,
            nodes: [
                { x: 60, y: 520, card: "right", cardOffsetY: 34 },
                { x: 70, y: 392, card: "right", cardOffsetY: -8 },
                { x: 76, y: 256, card: "left", cardOffsetY: -34 }
            ]
        }
    }
};

function resetGame() {
    state = "menu";
    gameTime = 0;
    spawnTimer = 0;
    screenShake = 0;
    screenShakeTimer = 0;
    damageFlash = 0;
    bestScore = loadBestScore();
    currentScore = 0;
    newBestThisRun = false;
    lastSavedCurrentScore = -1;
    lastSavedBestScore = bestScore;
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
        shieldTimer: 0,
        shieldBlockCooldown: 0,
        shieldDurationBonus: 0,
        lifeSteal: 0,
        lifeStealBuffer: 0,
        lifeStealPopupBuffer: 0,
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
        knockbackY: 0
    };
    applyPermanentBonusesToPlayer();
    enemies = [];
    projectiles = [];
    gems = [];
    powerUps = [];
    spikes = [];
    spikeCanvas = null;
    particles = [];
    floatingTexts = [];
    enemyGrid.clear();
    powerUpSpawnTimer = 6;
    shieldSpawnTimer = 12;
    runRewardGranted = false;
    levelUpOverlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    mainMenuOverlay.classList.remove("hidden");
    updateHud();
    updateMetaCurrencyDisplays();
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
    clearInputKeys();
    updatePauseMenuScore();
    state = "paused";
    pauseOverlay.classList.remove("hidden");
}

function resumeGame() {
    if (state !== "paused") {
        return;
    }
    clearInputKeys();
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

function safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Si le navigateur bloque localStorage, le jeu continue quand même.
    }
}

function parseStoredScore(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    return Math.max(0, Math.floor(parsed));
}

function loadBestScore() {
    let loadedBest = 0;
    for (const key of BEST_SCORE_STORAGE_KEYS) {
        loadedBest = Math.max(loadedBest, parseStoredScore(safeLocalStorageGet(key)));
    }
    const statsRaw = safeLocalStorageGet(BEST_SCORE_STATS_KEY);
    if (statsRaw) {
        try {
            const stats = JSON.parse(statsRaw);
            loadedBest = Math.max(loadedBest, parseStoredScore(stats.bestScore));
        } catch (error) {
            // Stats corrompues : on ignore et on garde les autres clés.
        }
    }
    return loadedBest;
}

function saveBestScore(score) {
    const safeScore = Math.max(0, Math.floor(score));
    if (safeScore <= lastSavedBestScore) {
        return;
    }
    lastSavedBestScore = safeScore;
    for (const key of BEST_SCORE_STORAGE_KEYS) {
        safeLocalStorageSet(key, String(safeScore));
    }
    safeLocalStorageSet(BEST_SCORE_STATS_KEY, JSON.stringify({
        bestScore: safeScore,
        bestKills: player ? player.kills : 0,
        bestTime: Math.floor(gameTime),
        updatedAt: new Date().toISOString()
    }));
}

function saveCurrentRunScore(score) {
    const safeScore = Math.max(0, Math.floor(score));
    if (safeScore === lastSavedCurrentScore) {
        return;
    }
    lastSavedCurrentScore = safeScore;
    safeLocalStorageSet(CURRENT_RUN_STORAGE_KEY, JSON.stringify({
        score: safeScore,
        kills: player ? player.kills : 0,
        time: Math.floor(gameTime),
        level: player ? player.level : 1,
        savedAt: new Date().toISOString()
    }));
}

function getCurrentScore() {
    if (!player) {
        return 0;
    }
    return player.kills * 10 + Math.floor(gameTime);
}

function updateScoreState() {
    currentScore = getCurrentScore();
    saveCurrentRunScore(currentScore);
    if (currentScore > bestScore) {
        bestScore = currentScore;
        newBestThisRun = true;
        saveBestScore(bestScore);
    }
}

function finalizeScore() {
    updateScoreState();
    saveBestScore(bestScore);
    saveCurrentRunScore(currentScore);
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

function getShortestAngleDifference(from, to) {
    let diff = to - from;
    while (diff > Math.PI) {
        diff -= Math.PI * 2;
    }
    while (diff < -Math.PI) {
        diff += Math.PI * 2;
    }
    return diff;
}

function lerpAngle(from, to, speed, dt) {
    const diff = getShortestAngleDifference(from, to);
    return from + diff * Math.min(1, speed * dt);
}

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
    return true;
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

function shootAt(target) {
    const baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
    player.targetAimAngle = baseAngle;
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
    if (projectiles.length > MAX_ACTIVE_PROJECTILES) {
        projectiles.splice(0, projectiles.length - MAX_ACTIVE_PROJECTILES);
    }
    createParticles(player.x, player.y, 8, "#59dfff", 2.5);
}

function createParticles(x, y, count, color, speed = 1) {
    let adjustedCount = count;
    if (enemies.length > 140) {
        adjustedCount = Math.ceil(count * 0.35);
    } else if (enemies.length > 100) {
        adjustedCount = Math.ceil(count * 0.5);
    } else if (enemies.length > 70) {
        adjustedCount = Math.ceil(count * 0.7);
    }
    adjustedCount = Math.max(1, adjustedCount);
    const overflow = particles.length + adjustedCount - MAX_PARTICLES;
    if (overflow > 0) {
        particles.splice(0, overflow);
    }
    for (let i = 0; i < adjustedCount; i++) {
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
    if (floatingTexts.length >= MAX_FLOATING_TEXTS) {
        floatingTexts.splice(0, floatingTexts.length - MAX_FLOATING_TEXTS + 1);
    }
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
    player.shieldTimer = 8 + (player.shieldDurationBonus || 0);
    player.shieldBlockCooldown = 0;
    addFloatingText(player.x, player.y - player.radius - 34, "BOUCLIER", "#d8dde8");
    createParticles(player.x, player.y, 42, "#d8dde8", 2.1);
    updateHud();
    return true;
}

function addXp(amount) {
    const adjustedAmount = amount * (player.xpGainMultiplier || 1);
    player.xp += adjustedAmount;
    while (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext;
        player.level += 1;
        player.xpToNext = Math.floor(player.xpToNext * 1.35 + 10);
        showLevelUp();
        break;
    }
}

function showLevelUp() {
    state = "levelup";
    currentUpgrades = getRandomUpgrades(3);
    upgradeCards.innerHTML = "";
    currentUpgrades.forEach((upgrade, index) => {
        const card = document.createElement("button");
        card.className = "upgrade-card";
        card.innerHTML = `
		<div class="upgrade-icon">${upgrade.icon}</div>
		<h2>${upgrade.title}</h2>
		<p>${upgrade.description}</p>

		<div class="upgrade-key">
			<kbd class="upgrade-keycap">${index + 1}</kbd>
		</div>
	`;
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
    const pool = upgrades.filter((upgrade) => canUpgradeAppear(upgrade));
    const selected = [];
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
    clampPlayerStats();
    createParticles(player.x, player.y, 40, "#b88cff", 2.2);
    levelUpOverlay.classList.add("hidden");
    state = "playing";
    updateHud();
}

function getEnemyDistanceSqToPlayer(enemy) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    return dx * dx + dy * dy;
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

    player.healLockTimer = Math.max(
        player.healLockTimer || 0,
        HORDE_PRESSURE_HEAL_LOCK
    );

    if (player.hordeDamageTimer > 0) {
        return;
    }

    const damage =
        HORDE_PRESSURE_BASE_DAMAGE +
        extraEnemies * HORDE_PRESSURE_DAMAGE_PER_EXTRA_ENEMY;

    damagePlayerByHordePressure(damage, nearbyEnemies);

    player.hordeDamageTimer = HORDE_PRESSURE_TICK;
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
    player.healLockTimer = Math.max(
        player.healLockTimer || 0,
        HORDE_PRESSURE_HEAL_LOCK
    );

    damageFlash = Math.max(damageFlash, 0.24);
    screenShake = 1.8;
    screenShakeTimer = 0.045;

    if (player.hordeWarningTimer <= 0) {
        addFloatingText(
            player.x,
            player.y - player.radius - 42,
            `SUBMERGÉ -${Math.ceil(amount)}`,
            "#ff5f75"
        );

        player.hordeWarningTimer = 0.65;
    }

    if (player.hp <= 0) {
        player.hp = 0;
        endGame();
    }

    updateHud();
}

function update(dt) {
    gameTime += dt;
    updatePlayer(dt);
    updateSpikes();
    updatePowerUps(dt);
    updateSpawns(dt);
    updateEnemies(dt);
    trimEnemyOverflow();
    buildEnemyGrid();
    updateHordePressure(dt);
    updateProjectiles(dt);
    updateLifeStealHealing(dt);
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
    const target = findNearestEnemy();
    if (target) {
        player.targetAimAngle = Math.atan2(target.y - player.y, target.x - player.x);
    }
    player.aimAngle = lerpAngle(player.aimAngle, player.targetAimAngle, player.aimTurnSpeed, dt);
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
    if (player.damageBoostTimer <= 0) {
        player.damageMultiplier = 1;
        if (spikes.length > 0) {
            spikes = [];
            spikeCanvas = null;
        }
    }
}

function updateSpawns(dt) {
    if (enemies.length >= MAX_ACTIVE_ENEMIES) {
        spawnTimer = Math.max(spawnTimer, 0.35);
        return;
    }

    spawnTimer -= dt;

    const spawnInterval = Math.max(0.22, 1.05 - gameTime / 160);

    if (spawnTimer <= 0) {
        spawnEnemy();

        if (enemies.length < MAX_ACTIVE_ENEMIES && gameTime > 35 && Math.random() > 0.72) {
            spawnEnemy();
        }

        if (enemies.length < MAX_ACTIVE_ENEMIES && gameTime > 90 && Math.random() > 0.78) {
            spawnEnemy();
        }

        spawnTimer = spawnInterval;
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

function getEnemyGridCell(value) {
    return Math.floor(value / ENEMY_GRID_SIZE);
}

function getEnemyGridKey(cellX, cellY) {
    return `${cellX};${cellY}`;
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
                createParticles(projectile.x, projectile.y, 12, "#75e8ff", 1.3);
                projectiles.splice(i, 1);
                projectileRemoved = true;
                if (enemy.hp <= 0 && !enemy.dead) {
                    enemy.dead = true;
                    enemiesNeedCleanup = true;
                    player.kills += 1;
                    dropGem(enemy.x, enemy.y, enemy.xp);
                    createParticles(enemy.x, enemy.y, 22, enemy.color, 1.7);
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
    updateScoreState();
    scoreText.textContent = currentScore;
    bestScoreText.textContent = bestScore;
    if (newBestThisRun) {
        newBestBadge.classList.remove("hidden");
    } else {
        newBestBadge.classList.add("hidden");
    }
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

function updatePauseMenuScore() {
    updateScoreState();
    pauseScoreText.textContent = currentScore;
    pauseBestScoreText.textContent = bestScore;
}

function endGame() {
    finalizeScore();
    grantCoinsForRun();
    state = "gameover";
    finalTimeText.textContent = formatTime(gameTime);
    finalKillsText.textContent = player.kills;
    finalScoreText.textContent = currentScore;
    finalBestScoreText.textContent = bestScore;
    if (newBestThisRun) {
        finalNewBestBadge.classList.remove("hidden");
    } else {
        finalNewBestBadge.classList.add("hidden");
    }
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
    ctx.translate(player.x, player.y);
    ctx.rotate(player.aimAngle);
    if (isBlinking) {
        ctx.globalAlpha = 0.55;
    }
    // Ombre / base sombre
    ctx.fillStyle = "#27214f";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 4, 0, Math.PI * 2);
    ctx.fill();
    // Corps du mage
    ctx.fillStyle = isHit ? "#ffffff" : "#6ee6ff";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    // Petit visage / capuche orientée vers l’avant
    ctx.fillStyle = isHit ? "#ff365d" : "#f7f0ff";
    ctx.beginPath();
    ctx.arc(7, -3, 8, 0, Math.PI * 2);
    ctx.fill();
    // Petite cape arrière pour rendre l’orientation lisible
    ctx.fillStyle = "rgba(39, 33, 79, 0.95)";
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-27, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
    // Baguette magique orientée vers l’avant
    ctx.strokeStyle = "#d9c9ff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(31, 0);
    ctx.stroke();
    // Orbe au bout de la baguette
    ctx.fillStyle = "#ffdf6e";
    ctx.shadowColor = "#ffdf6e";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(35, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function getEnemySprite(enemy) {
    const key = `${enemy.type}_${enemy.color}_${enemy.radius}`;
    let sprite = enemySpriteCache.get(key);
    if (!sprite) {
        sprite = createEnemySprite(enemy);
        enemySpriteCache.set(key, sprite);
    }
    return sprite;
}

function createEnemySprite(enemy) {
    const padding = 32;
    const size = Math.ceil((enemy.radius + padding) * 2);
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const bctx = buffer.getContext("2d");
    const cx = size / 2;
    const cy = size / 2;
    bctx.save();
    bctx.fillStyle = enemy.color;
    bctx.shadowColor = enemy.color;
    bctx.shadowBlur = 16;
    if (enemy.type === "bat") {
        bctx.beginPath();
        bctx.ellipse(cx, cy, enemy.radius + 8, enemy.radius, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.shadowBlur = 0;
        bctx.fillStyle = "#1b1028";
        bctx.beginPath();
        bctx.arc(cx - 5, cy - 2, 2, 0, Math.PI * 2);
        bctx.arc(cx + 5, cy - 2, 2, 0, Math.PI * 2);
        bctx.fill();
    } else if (enemy.type === "brute") {
        bctx.beginPath();
        if (typeof bctx.roundRect === "function") {
            bctx.roundRect(cx - enemy.radius, cy - enemy.radius, enemy.radius * 2, enemy.radius * 2, 10);
        } else {
            bctx.rect(cx - enemy.radius, cy - enemy.radius, enemy.radius * 2, enemy.radius * 2);
        }
        bctx.fill();
        bctx.shadowBlur = 0;
        bctx.fillStyle = "#371010";
        bctx.beginPath();
        bctx.arc(cx - 8, cy - 5, 3, 0, Math.PI * 2);
        bctx.arc(cx + 8, cy - 5, 3, 0, Math.PI * 2);
        bctx.fill();
    } else {
        bctx.beginPath();
        bctx.arc(cx, cy, enemy.radius, 0, Math.PI * 2);
        bctx.fill();
        bctx.shadowBlur = 0;
        bctx.fillStyle = "#1b1028";
        bctx.beginPath();
        bctx.arc(cx - 6, cy - 4, 3, 0, Math.PI * 2);
        bctx.arc(cx + 6, cy - 4, 3, 0, Math.PI * 2);
        bctx.fill();
    }
    bctx.restore();
    return {
        canvas: buffer,
        size
    };
}

function drawEnemies() {
    for (const enemy of enemies) {
        if (!enemy || enemy.dead) {
            continue;
        }
        const sprite = getEnemySprite(enemy);
        ctx.drawImage(sprite.canvas, enemy.x - sprite.size / 2, enemy.y - sprite.size / 2);
        const shouldDrawHpBar = enemies.length < 120 || enemy.hp < enemy.maxHp;

        if (shouldDrawHpBar) {
            const hpWidth = enemy.radius * 2;
            const hpHeight = 5;
            const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);

            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(
                enemy.x - hpWidth / 2,
                enemy.y - enemy.radius - 14,
                hpWidth,
                hpHeight
            );

            ctx.fillStyle = "#ff4066";
            ctx.fillRect(
                enemy.x - hpWidth / 2,
                enemy.y - enemy.radius - 14,
                hpWidth * hpPercent,
                hpHeight
            );
        }
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

function loadMetaProgression() {
    try {
        metaCoins = Math.max(0, Number(localStorage.getItem(META_STORAGE_KEYS.coins)) || 0);
    } catch (error) {
        metaCoins = 0;
    }
    try {
        metaSkills = JSON.parse(localStorage.getItem(META_STORAGE_KEYS.skills) || "{}");
    } catch (error) {
        metaSkills = {};
    }
}

function saveMetaProgression() {
    try {
        localStorage.setItem(META_STORAGE_KEYS.coins, String(Math.floor(metaCoins)));
        localStorage.setItem(META_STORAGE_KEYS.skills, JSON.stringify(metaSkills));
    } catch (error) {
        // on ignore si localStorage bloque
    }
}

function getSkillLevel(skillId) {
    return metaSkills[skillId] || 0;
}

function getSkillCost(node) {
    const currentLevel = getSkillLevel(node.id);
    return node.baseCost + node.costStep * currentLevel;
}

function areRequirementsMet(node) {
    if (!node.requires || node.requires.length === 0) {
        return true;
    }
    return node.requires.every((requirement) => {
        return getSkillLevel(requirement.id) >= requirement.level;
    });
}

function canBuySkill(node) {
    const currentLevel = getSkillLevel(node.id);
    if (currentLevel >= node.maxLevel) {
        return false;
    }
    if (!areRequirementsMet(node)) {
        return false;
    }
    return metaCoins >= getSkillCost(node);
}

function updateMetaCurrencyDisplays() {
    if (menuCoinsText) {
        menuCoinsText.textContent = Math.floor(metaCoins);
    }
    if (skillTreeCoinsText) {
        skillTreeCoinsText.textContent = Math.floor(metaCoins);
    }
}

function getPermanentBonuses() {
    const bonuses = {
        damagePercent: 0,
        fireRateReduction: 0,
        projectileSpeedPercent: 0,
        maxHpFlat: 0,
        lifeStealPercent: 0,
        shieldDurationFlat: 0,
        moveSpeedPercent: 0,
        magnetFlat: 0,
        xpGainPercent: 0
    };
    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            const level = getSkillLevel(node.id);
            if (level <= 0) {
                continue;
            }
            bonuses[node.effectType] += node.effectValue * level;
        }
    }
    return bonuses;
}

function grantCoinsForRun() {
    if (runRewardGranted) {
        return;
    }
    metaCoins += currentScore;
    runRewardGranted = true;
    saveMetaProgression();
    updateMetaCurrencyDisplays();
}

function applyPermanentBonusesToPlayer() {
    const bonuses = getPermanentBonuses();
    player.damage *= 1 + bonuses.damagePercent;
    player.fireRate *= Math.max(0.35, 1 - bonuses.fireRateReduction);
    player.projectileSpeed *= 1 + bonuses.projectileSpeedPercent;
    player.maxHp += bonuses.maxHpFlat;
    player.hp = player.maxHp;
    player.lifeSteal = Math.min(0.15, player.lifeSteal + bonuses.lifeStealPercent);
    player.shieldDurationBonus = bonuses.shieldDurationFlat;
    player.speed *= 1 + bonuses.moveSpeedPercent;
    player.magnetRadius += bonuses.magnetFlat;
    player.xpGainMultiplier = 1 + bonuses.xpGainPercent;
}

function clampPlayerStats() {
    player.lifeSteal = Math.min(0.15, Math.max(0, player.lifeSteal));
}

function getBranchProgress(branch) {
    const totalLevels = branch.nodes.reduce((sum, node) => sum + getSkillLevel(node.id), 0);
    const maxLevels = branch.nodes.reduce((sum, node) => sum + node.maxLevel, 0);

    return {
        totalLevels,
        maxLevels
    };
}

function getSkillNodeState(node) {
    const currentLevel = getSkillLevel(node.id);
    const maxed = currentLevel >= node.maxLevel;
    const requirementsMet = areRequirementsMet(node);
    const affordable = metaCoins >= getSkillCost(node);
    const available = !maxed && requirementsMet && affordable;
    const unlocked = requirementsMet;

    return {
        currentLevel,
        maxed,
        requirementsMet,
        affordable,
        available,
        unlocked
    };
}

function getBranchNodeActivation(branch, node, index) {
    const state = getSkillNodeState(node);

    if (state.currentLevel > 0 || state.maxed) {
        return true;
    }

    if (index === 0 && state.requirementsMet) {
        return true;
    }

    if (index > 0) {
        const previousNode = branch.nodes[index - 1];
        if (getSkillLevel(previousNode.id) > 0 && state.requirementsMet) {
            return true;
        }
    }

    return false;
}

function buildSkillLinkPath(from, to, bend = 0) {
    const dy = from.y - to.y;

    const c1x = from.x + bend;
    const c1y = from.y - dy * 0.32;

    const c2x = to.x + bend;
    const c2y = to.y + dy * 0.32;

    return `
        M ${from.x} ${from.y}
        C ${c1x} ${c1y},
          ${c2x} ${c2y},
          ${to.x} ${to.y}
    `;
}

function renderSkillTree() {
    updateMetaCurrencyDisplays();

    skillTreeBranches.className = "skill-tree-branches skill-tree-map";
    skillTreeBranches.innerHTML = "";

    const orderedBranches = ["damage", "speed", "defense"];
    const origin = SKILL_TREE_LAYOUT.origin;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "skill-map-svg");
    svg.setAttribute("viewBox", `0 0 100 ${SKILL_TREE_MAP_HEIGHT}`);
    svg.setAttribute("preserveAspectRatio", "none");

    skillTreeBranches.appendChild(svg);

    const totalBought = SKILL_TREE.reduce((sum, branch) => {
        return sum + branch.nodes.reduce((branchSum, node) => {
            return branchSum + getSkillLevel(node.id);
        }, 0);
    }, 0);

    const originElement = document.createElement("div");
    originElement.className = "skill-map-origin";
    originElement.style.left = `${origin.x}%`;

    /* on aligne visuellement le CENTRE de la boule avec le point de convergence */
    originElement.style.top = `${origin.y - 40}px`;

    originElement.innerHTML = `
        <div class="skill-map-origin-core">
            <span>✦</span>
        </div>
        <div class="skill-map-origin-value">${totalBought}</div>
        <div class="skill-map-origin-title">NOYAU RUNIQUE</div>
    `;

    skillTreeBranches.appendChild(originElement);

    for (const branchId of orderedBranches) {
        const branch = SKILL_TREE.find((entry) => entry.id === branchId);

        if (!branch) {
            continue;
        }

        const layout = SKILL_TREE_LAYOUT.branches[branch.id];

        if (!layout) {
            continue;
        }

        const { totalLevels, maxLevels } = getBranchProgress(branch);

        const branchLabel = document.createElement("div");
        branchLabel.className = `skill-map-branch-label ${branch.className}`;
        branchLabel.style.left = `${layout.label.x}%`;
        branchLabel.style.top = `${layout.label.y}px`;
        branchLabel.innerHTML = `
            <span>${branch.label}</span>
            <strong>${totalLevels} / ${maxLevels}</strong>
        `;
        skillTreeBranches.appendChild(branchLabel);

        let previousPoint = origin;

        branch.nodes.forEach((node, index) => {
            const point = layout.nodes[index];
            const activeLink = getBranchNodeActivation(branch, node, index);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", buildSkillLinkPath(previousPoint, point, layout.bend));
            path.setAttribute(
                "class",
                `skill-map-link ${branch.className} ${activeLink ? "active" : "inactive"}`
            );

            svg.appendChild(path);
            previousPoint = point;
        });

        branch.nodes.forEach((node, index) => {
            const point = layout.nodes[index];
            const nodeState = getSkillNodeState(node);

            let visualState = "locked";

            if (nodeState.maxed) {
                visualState = "maxed";
            } else if (nodeState.available) {
                visualState = "available";
            } else if (nodeState.unlocked) {
                visualState = "unlocked";
            }

            const cost = getSkillCost(node);

            const buttonLabel = nodeState.maxed
                ? "MAX"
                : nodeState.available
                ? `Acheter ${cost}`
                : nodeState.requirementsMet
                ? `${cost} pièces`
                : "Verrouillé";

            const buttonClass = nodeState.available
                ? `skill-map-buy ${branch.className}`
                : "skill-map-buy disabled";

            const nodeElement = document.createElement("div");
            nodeElement.className = `skill-map-node ${branch.className} ${visualState} card-${point.card}`;
            nodeElement.style.left = `${point.x}%`;
            nodeElement.style.top = `${point.y}px`;
            nodeElement.style.setProperty("--card-offset-y", `${point.cardOffsetY || 0}px`);

            nodeElement.innerHTML = `
                <div class="skill-map-node-core">
                    <span>${node.nodeIcon || branch.icon}</span>
                </div>

                <div class="skill-map-node-level">${nodeState.currentLevel}/${node.maxLevel}</div>

                <div class="skill-map-card ${branch.className} card-${point.card}">
                    <div class="skill-map-card-title">${node.title}</div>
                    <div class="skill-map-card-desc">${node.desc}</div>

                    <button class="${buttonClass}" ${nodeState.available ? "" : "disabled"}>
                        ${buttonLabel}
                    </button>

                    ${
                        !nodeState.requirementsMet
                            ? `<div class="skill-map-card-lock">Prérequis non remplis</div>`
                            : ""
                    }
                </div>
            `;

            const button = nodeElement.querySelector("button");

            if (nodeState.available) {
                button.addEventListener("click", (event) => {
                    event.stopPropagation();
                    event.currentTarget.blur();
                    buySkill(node.id);
                });
            }

            skillTreeBranches.appendChild(nodeElement);
        });
    }
}

function findSkillNodeById(skillId) {
    for (const branch of SKILL_TREE) {
        for (const node of branch.nodes) {
            if (node.id === skillId) {
                return node;
            }
        }
    }
    return null;
}

function buySkill(skillId) {
    const node = findSkillNodeById(skillId);
    if (!node) {
        return;
    }
    if (!canBuySkill(node)) {
        return;
    }
    metaCoins -= getSkillCost(node);
    metaSkills[skillId] = getSkillLevel(skillId) + 1;
    saveMetaProgression();
    updateMetaCurrencyDisplays();
    renderSkillTree();
}

function openSkillTree(fromState = state) {
    skillTreeReturnState = fromState;
    if (fromState === "menu") {
        mainMenuOverlay.classList.add("hidden");
    }
    if (fromState === "paused") {
        pauseOverlay.classList.add("hidden");
    }
    if (fromState === "gameover") {
        gameOverOverlay.classList.add("hidden");
    }
    skillTreeOverlay.classList.remove("hidden");
    state = "skilltree";
    renderSkillTree();
}

function closeSkillTree() {
    skillTreeOverlay.classList.add("hidden");
    state = skillTreeReturnState;
    if (skillTreeReturnState === "menu") {
        mainMenuOverlay.classList.remove("hidden");
    }
    if (skillTreeReturnState === "paused") {
        pauseOverlay.classList.remove("hidden");
    }
    if (skillTreeReturnState === "gameover") {
        gameOverOverlay.classList.remove("hidden");
    }
}

function clearInputKeys() {
    keys.clear();
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
    if (state === "playing") {
        keys.add(key);
    }
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
    if (event.key === " ") {
        keys.delete(" ");
    }
});
window.addEventListener("blur", () => {
    clearInputKeys();
    if (state === "playing") {
        pauseGame();
    }
});
document.addEventListener("visibilitychange", () => {
    clearInputKeys();
    if (document.hidden && state === "playing") {
        pauseGame();
    }
});
window.addEventListener("mouseleave", () => {
    clearInputKeys();
});
playButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
resumeButton.addEventListener("click", resumeGame);
openSkillTreeButton.addEventListener("click", () => openSkillTree("menu"));
pauseSkillTreeButton.addEventListener("click", () => openSkillTree("paused"));
gameOverSkillTreeButton.addEventListener("click", () => openSkillTree("gameover"));
closeSkillTreeButton.addEventListener("click", closeSkillTree);
window.addEventListener("beforeunload", () => {
    if (!player) {
        return;
    }
    finalizeScore();
});
loadMetaProgression();
updateMetaCurrencyDisplays();
resetGame();
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
});