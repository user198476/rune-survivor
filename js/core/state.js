const keys = new Set();

let state = "menu";
let lastTime = 0;
let gameTime = 0;
let waveTime = 0;
let spawnTimer = 0;

let player;

let enemies = [];
let projectiles = [];
let enemyProjectiles = [];
let gems = [];
let powerUps = [];
let spikes = [];
let spikeCanvas = null;
let particles = [];
let floatingTexts = [];

let bossState = "none";
let currentBoss = null;
let bossDangerZones = [];
let bossLasers = [];
let bossMissiles = [];
let bossWallStrikes = [];

let enemyGrid = new Map();
const enemySpriteCache = new Map();

let postBossRampTimer = 0;
let hordeBombSpawnTimer = 20;
let healKitSpawnTimer = 0;

let metaCoins = 0;
let metaSkills = {};
let selectedSkillTier = 0;
let skillStatsPopoverOpen = false;
let runRewardGranted = false;
let skillTreeReturnState = "menu";

// LEGENDARY UPGRADE
let currentUpgrades = [];
let astralStrikes = [];