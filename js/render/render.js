function render() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.save();
    if (screenShake > 0) {
        ctx.translate(randomBetween(-screenShake, screenShake), randomBetween(-screenShake, screenShake));
    }
    drawBackground();
    drawSpikes();

    drawRoyalSlimeAura();
    drawBossDangerZones();

    drawGems();
    drawPowerUps();
    drawProjectiles();

    drawBossMissiles();
    drawBossLasers();

    drawEnemies();
    drawEnemyProjectiles();
    drawArcaneClone();
    drawPlayer();
    drawParticles();
    drawFloatingTexts();

    ctx.restore();

    drawDamageOverlay();
    drawBossInterface();
}