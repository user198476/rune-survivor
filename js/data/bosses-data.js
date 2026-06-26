const BOSS_INTRO_DURATION = 3.2;
const BOSS_REWARD_DELAY = 2.2;

const BOSS_WAVES = [
    {
        id: "royal_slime",
        time: 90, // 1:30
        name: "Slime royal",
        type: "slime",
        color: "#8b5cff",
        radius: 56,
        hp: 3600,
        speed: 82,
        damage: 30,
        rewardXp: 260,
        rewardGemCount: 22
    },
    {
        id: "blood_bat",
        time: 180, // 3:00
        name: "Reine chauve-souris",
        type: "bat",
        color: "#ff4d8d",
        radius: 48,
        hp: 7100,
        speed: 126,
        damage: 45,
        rewardXp: 420,
        rewardGemCount: 28
    },
    {
        id: "rune_brute",
        time: 300, // 5:00
        name: "Brute runique",
        type: "brute",
        color: "#aaf737",
        radius: 64,
        hp: 13200,
        speed: 76,
        damage: 70,
        rewardXp: 650,
        rewardGemCount: 34
    }
];
const BOSS_PULL_COOLDOWN = 4.4;
const BOSS_PULL_FORCE = 1800;
const BOSS_PULL_DURATION = 0.8;
const BOSS_PULL_CONTACT_DAMAGE = 38;
const BOSS_PULL_CONTACT_RADIUS_BONUS = 18;
const BOSS_PULL_CONTACT_COOLDOWN = 0.7;

const BOSS_SLIME_AURA_RADIUS = 145;
const BOSS_SLIME_AURA_DAMAGE = 22;
const BOSS_SLIME_AURA_TICK = 0.4;
const BOSS_SLIME_AURA_PULL_MULTIPLIER = 1.25;
const BOSS_SLIME_AURA_SLOW_MULTIPLIER = 0.58;
const BOSS_SLIME_AURA_SLOW_DURATION = 0.68;

const BOSS_LASER_COOLDOWN = 4.6;
const BOSS_LASER_WARNING_DURATION = 1.05;
const BOSS_LASER_ACTIVE_DURATION = 0.65;
const BOSS_LASER_DAMAGE = 48;
const BOSS_LASER_WIDTH = 42;
const BOSS_LASER_LENGTH = 1700;
const BOSS_LASER_FIXED_COUNT = 4;

const BOSS_ZONE_COOLDOWN = 3.2;
const BOSS_ZONE_WARNING_DURATION = 0.95;
const BOSS_ZONE_ACTIVE_DURATION = 2.6;
const BOSS_ZONE_DAMAGE = 38;
const BOSS_ZONE_DAMAGE_TICK = 0.34;
const BOSS_ZONE_RADIUS = 86;
const BOSS_ZONE_COUNT = 10;
const BOSS_ZONE_SPREAD_X = 430;
const BOSS_ZONE_SPREAD_Y = 280;

const BOSS_WALL_DANGER_MARGIN = 135;
const BOSS_WALL_WARNING_DURATION = 0.55;
const BOSS_WALL_ACTIVE_DURATION = 0.35;
const BOSS_WALL_DAMAGE = 42;
const BOSS_WALL_PUSH_FORCE = 380;
const BOSS_WALL_COOLDOWN = 0.85;

const BOSS_MISSILE_COOLDOWN = 3.2;
const BOSS_MISSILE_COUNT = 4;
const BOSS_MISSILE_SPEED = 360;
const BOSS_MISSILE_TURN_SPEED = 7.5;
const BOSS_MISSILE_LOCK_DISTANCE = 150; // distance ou on arrete de target le joeur et donc creer fenetre evitemment
const BOSS_MISSILE_TRACK_DURATION = 1.25;
const BOSS_MISSILE_RADIUS = 13;
const BOSS_MISSILE_DAMAGE = 34;
const BOSS_MISSILE_LIFE = 9;

const POST_BOSS_RAMP_DURATION = 12;
const POST_BOSS_MIN_SPAWN_INTERVAL = 0.55;
const POST_BOSS_MAX_SPAWNS_PER_TICK = 1;