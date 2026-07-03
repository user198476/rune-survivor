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
    },
    {
        id: "coward_trickster",
        time: 420, // 7:00
        name: "Couard illusionniste",
        type: "cowardBoss",
        color: "#ff9b2f",
        radius: 48,
        hp: 21250,
        speed: 150,
        damage: 42,
        rewardXp: 1200,
        rewardGemCount: 42
    }
];

// Boss 1 abilities // Royal slime
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

// Boss 2 abilities // Blood bat
const BOSS_LASER_COOLDOWN = 4.8;
const BOSS_LASER_WARNING_DURATION = 1.00;
const BOSS_LASER_ACTIVE_DURATION = 0.7;
const BOSS_LASER_DAMAGE = 48;
const BOSS_LASER_WIDTH = 42;
const BOSS_LASER_LENGTH = 1700;
const BOSS_LASER_FIXED_COUNT = 8;

const BOSS_MISSILE_COOLDOWN = 3.2;
const BOSS_MISSILE_COUNT = 3;
const BOSS_MISSILE_SPEED = 280;
const BOSS_MISSILE_TURN_SPEED = 5.5;
const BOSS_MISSILE_TRACK_DURATION = 2.5;
const BOSS_MISSILE_RADIUS = 9;
const BOSS_MISSILE_DAMAGE = 25;
const BOSS_MISSILE_LIFE = 5.0;

// Boss 3 abilities // Rune brute
const BOSS_ZONE_COOLDOWN = 3.2;
const BOSS_ZONE_WARNING_DURATION = 0.95;
const BOSS_ZONE_ACTIVE_DURATION = 2.6;
const BOSS_ZONE_DAMAGE = 38;
const BOSS_ZONE_DAMAGE_TICK = 0.34;
const BOSS_ZONE_RADIUS = 86;
const BOSS_ZONE_COUNT = 10;
const BOSS_ZONE_SPREAD_X = 430;
const BOSS_ZONE_SPREAD_Y = 280;

const BOSS_WALL_DANGER_MARGIN = 100;
const BOSS_WALL_WARNING_DURATION = 0.8;
const BOSS_WALL_ACTIVE_DURATION = 0.4;
const BOSS_WALL_DAMAGE = 38;
const BOSS_WALL_PUSH_FORCE = 380;
const BOSS_WALL_COOLDOWN = 0.85;

// Boss 4 abilities // Coward Trickster
const COWARD_TRICKSTER_CLONE_COOLDOWN = 6.2;
const COWARD_TRICKSTER_CLONE_COUNT_MIN = 3;
const COWARD_TRICKSTER_CLONE_COUNT_MAX = 4;
const COWARD_TRICKSTER_CLONE_DISTANCE = 165;

const COWARD_TRICKSTER_SWAP_COOLDOWN = 4.4;
const COWARD_TRICKSTER_SWAP_WARNING_DURATION = 0.75;

const COWARD_TRICKSTER_BOSS_PREFERRED_DISTANCE = 340;
const COWARD_TRICKSTER_CLONE_PREFERRED_DISTANCE = 285;
const COWARD_TRICKSTER_TOO_CLOSE_DISTANCE = 190;
const COWARD_TRICKSTER_LEASH_DISTANCE = 520;

const COWARD_TRICKSTER_CLONE_CONTACT_DAMAGE = 18;
const COWARD_TRICKSTER_FAKE_HIT_SLOW_DURATION = 1.15;
const COWARD_TRICKSTER_FAKE_HIT_SLOW_MULTIPLIER = 0.62;
const COWARD_TRICKSTER_FAKE_HIT_COOLDOWN = 0.45;

const COWARD_TRICKSTER_PROJECTILE_SPEED = 360;
const COWARD_TRICKSTER_PROJECTILE_RADIUS = 8;
const COWARD_TRICKSTER_PROJECTILE_DAMAGE = 18;
const COWARD_TRICKSTER_PROJECTILE_LIFETIME = 4.2;
const COWARD_TRICKSTER_PROJECTILE_RANGE = 620;
const COWARD_TRICKSTER_PROJECTILE_COOLDOWN_MIN = 0.95;
const COWARD_TRICKSTER_PROJECTILE_COOLDOWN_MAX = 1.45;

// After boss const
const POST_BOSS_RAMP_DURATION = 12;
const POST_BOSS_MIN_SPAWN_INTERVAL = 0.55;
const POST_BOSS_MAX_SPAWNS_PER_TICK = 1;