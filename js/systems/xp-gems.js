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

