function drawBossInterface() {
    if (bossState === "intro" && currentBossDefinition) {
        drawBossIntroBanner();
    }

    if (bossState === "active" && currentBoss && !currentBoss.dead) {
        drawBossHealthBar();
    }

    if (bossState === "reward" && currentBossDefinition) {
        drawBossRewardBanner();
    }
}

function drawBossIntroBanner() {
    const progress = 1 - bossIntroTimer / BOSS_INTRO_DURATION;
    const pulse = 0.5 + Math.sin(performance.now() / 90) * 0.5;

    ctx.save();

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "rgba(4, 4, 12, 0.74)";
    ctx.fillRect(0, GAME_HEIGHT / 2 - 78, GAME_WIDTH, 156);

    ctx.strokeStyle = currentBossDefinition.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = currentBossDefinition.color;
    ctx.shadowBlur = 18 + pulse * 10;

    ctx.beginPath();
    ctx.moveTo(160, GAME_HEIGHT / 2 - 78);
    ctx.lineTo(GAME_WIDTH - 160, GAME_HEIGHT / 2 - 78);
    ctx.moveTo(160, GAME_HEIGHT / 2 + 78);
    ctx.lineTo(GAME_WIDTH - 160, GAME_HEIGHT / 2 + 78);
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px Arial";
    ctx.fillText("UN BOSS APPROCHE", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16);

    ctx.fillStyle = currentBossDefinition.color;
    ctx.font = "900 28px Arial";
    ctx.fillText(currentBossDefinition.name.toUpperCase(), GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34);

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = currentBossDefinition.color;
    ctx.fillRect(0, GAME_HEIGHT / 2 + 74, GAME_WIDTH * progress, 4);

    ctx.restore();
}

function drawBossRewardBanner() {
    ctx.save();

    ctx.globalAlpha = 0.86;
    ctx.fillStyle = "rgba(4, 4, 12, 0.52)";
    ctx.fillRect(0, 96, GAME_WIDTH, 76);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd86b";
    ctx.font = "900 30px Arial";
    ctx.fillText("BOSS VAINCU", GAME_WIDTH / 2, 132);

    ctx.fillStyle = "#d9d2ff";
    ctx.font = "700 16px Arial";
    ctx.fillText(
        gems.length > 0
            ? "Ramasse les cristaux d’XP avant la reprise des vagues"
            : "Les vagues reprennent...",
        GAME_WIDTH / 2,
        156
    );

    ctx.restore();
}

function drawBossHealthBar() {
    const boss = currentBoss;
    const ratio = Math.max(0, boss.hp / boss.maxHp);

    const barWidth = 760;
    const barHeight = 18;
    const x = GAME_WIDTH / 2 - barWidth / 2;
    const y = 46;

    ctx.save();

    ctx.textAlign = "center";
    ctx.font = "900 22px Arial";
    ctx.fillStyle = "#f4f0ff";
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 16;
    ctx.fillText(boss.bossName.toUpperCase(), GAME_WIDTH / 2, 31);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(x - 4, y - 4, barWidth + 8, barHeight + 8);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 4, y - 4, barWidth + 8, barHeight + 8);

    ctx.fillStyle = "rgba(80, 12, 24, 0.92)";
    ctx.fillRect(x, y, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    gradient.addColorStop(0, "#7c1024");
    gradient.addColorStop(0.5, "#d9213f");
    gradient.addColorStop(1, "#ff6f52");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * ratio, barHeight);

    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, barWidth * ratio, 4);

    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.font = "700 13px Arial";
    ctx.fillStyle = "#e8d8d8";
    ctx.fillText(`${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`, GAME_WIDTH / 2, y + 38);

    ctx.restore();
}

function drawRoyalSlimeAura() {
    if (
        bossState !== "active" ||
        !currentBoss ||
        currentBoss.dead ||
        currentBoss.bossId !== "royal_slime"
    ) {
        return;
    }

    const pulse = 0.55 + Math.sin(performance.now() / 130) * 0.18;
    const auraRadius = BOSS_SLIME_AURA_RADIUS + pulse * 10;

    ctx.save();

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#8b5cff";
    ctx.beginPath();
    ctx.arc(currentBoss.x, currentBoss.y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = bossPullTimer > 0 ? 0.85 : 0.52;
    ctx.strokeStyle = bossPullTimer > 0 ? "#ff5fef" : "#b88cff";
    ctx.lineWidth = bossPullTimer > 0 ? 5 : 3;
    ctx.setLineDash(bossPullTimer > 0 ? [14, 8] : [8, 10]);
    ctx.shadowColor = "#b88cff";
    ctx.shadowBlur = bossPullTimer > 0 ? 28 : 16;

    ctx.beginPath();
    ctx.arc(currentBoss.x, currentBoss.y, auraRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawBossMissiles() {
    for (const missile of bossMissiles) {
        const angle = Math.atan2(missile.vy, missile.vx);

        ctx.save();

        ctx.translate(missile.x, missile.y);
        ctx.rotate(angle);

        ctx.globalAlpha = missile.locked ? 0.95 : 0.78;

        ctx.shadowColor = missile.color;
        ctx.shadowBlur = missile.locked ? 16 : 24;

        ctx.fillStyle = missile.locked ? "#ffb3d7" : missile.color;

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 0.45;
        ctx.fillStyle = missile.color;

        ctx.beginPath();
        ctx.arc(-18, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.save();

        ctx.globalAlpha = missile.locked ? 0.16 : 0.24;
        ctx.strokeStyle = missile.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 7]);

        ctx.beginPath();
        ctx.arc(missile.x, missile.y, BOSS_MISSILE_LOCK_DISTANCE, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

function drawBossDangerZones() {
    for (const zone of bossDangerZones) {
        ctx.save();

        if (zone.warning > 0) {
            const progress = 1 - zone.warning / zone.maxWarning;
            const pulse = 0.55 + Math.sin(performance.now() / 70) * 0.22;
            const currentRadius = zone.radius * (0.55 + progress * 0.45);

            ctx.globalAlpha = 0.22 + pulse * 0.24;
            ctx.fillStyle = zone.color;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 8]);
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = zone.color;
            ctx.lineWidth = 5;
            ctx.shadowColor = zone.color;
            ctx.shadowBlur = 24;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, currentRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.textAlign = "center";
            ctx.font = "900 18px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = zone.color;
            ctx.shadowBlur = 12;
            ctx.fillText("!", zone.x, zone.y + 6);
        } else {
            const pulse = 0.65 + Math.sin(performance.now() / 90) * 0.18;

            ctx.globalAlpha = 0.38 + pulse * 0.16;
            ctx.fillStyle = zone.color;
            ctx.shadowColor = zone.color;
            ctx.shadowBlur = 28;

            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = zone.color;
            ctx.lineWidth = 9;

            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function drawBossLasers() {
    for (const laser of bossLasers) {
        ctx.save();

        ctx.translate(laser.x, laser.y);
        ctx.rotate(laser.angle);

        if (laser.warning > 0) {
            const progress = 1 - laser.warning / BOSS_LASER_WARNING_DURATION;
            const warningWidth = 10 + progress * BOSS_LASER_WIDTH;

            ctx.globalAlpha = 0.25 + progress * 0.35;
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = warningWidth;
            ctx.setLineDash([26, 16]);
            ctx.shadowColor = laser.color;
            ctx.shadowBlur = 22;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(BOSS_LASER_LENGTH, 0);
            ctx.stroke();

            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, 8 + progress * 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = BOSS_LASER_WIDTH;
            ctx.shadowColor = laser.color;
            ctx.shadowBlur = 38;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(BOSS_LASER_LENGTH, 0);
            ctx.stroke();

            ctx.globalAlpha = 1;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = Math.max(8, BOSS_LASER_WIDTH * 0.32);
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 18;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(BOSS_LASER_LENGTH, 0);
            ctx.stroke();

            ctx.globalAlpha = 0.45;
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = BOSS_LASER_WIDTH * 1.7;
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(BOSS_LASER_LENGTH, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}
