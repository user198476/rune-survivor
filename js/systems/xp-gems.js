function clampGemSpawnPosition(x, y, radius = 10) {
    const margin = radius + 8;

    return {
        x: Math.max(margin, Math.min(GAME_WIDTH - margin, x)),
        y: Math.max(margin, Math.min(GAME_HEIGHT - margin, y))
    };
}

function dropGem(x, y, value) {
    const spawnPosition = clampGemSpawnPosition(x, y, 10);

    x = spawnPosition.x + randomBetween(-6, 6);
    y = spawnPosition.y + randomBetween(-6, 6);

    x = Math.max(10, Math.min(GAME_WIDTH - 10, x));
    y = Math.max(10, Math.min(GAME_HEIGHT - 10, y));

    gems.push({
        x,
        y,
        value,
        radius: 8,
        vx: randomBetween(-60, 60),
        vy: randomBetween(-60, 60)
    });
}

function updateGems(dt) {
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];
        const velocityDamping = Math.pow(0.92, dt * 60);
        gem.x += gem.vx * dt;
        gem.y += gem.vy * dt;
        gem.vx *= velocityDamping;
        gem.vy *= velocityDamping;
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

