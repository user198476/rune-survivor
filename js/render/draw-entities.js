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

function drawArcaneClone() {
    if (player.cloneTimer <= 0) {
        return;
    }
    const fade = Math.min(1, player.cloneTimer / 0.75);
    ctx.save();
    ctx.globalAlpha = 0.28 * fade;
    ctx.strokeStyle = "#b88cff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.cloneX, player.cloneY);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.72 * fade;
    ctx.translate(player.cloneX, player.cloneY);
    ctx.rotate(player.aimAngle);
    ctx.scale(0.86, 0.86);
    ctx.fillStyle = "rgba(66, 42, 120, 0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b88cff";
    ctx.shadowColor = "#b88cff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f7f0ff";
    ctx.beginPath();
    ctx.arc(7, -3, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(28, 18, 62, 0.96)";
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-27, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#e4d5ff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(31, 0);
    ctx.stroke();
    ctx.fillStyle = "#cfa7ff";
    ctx.shadowColor = "#b88cff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(35, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawEnemies() {
    for (const enemy of enemies) {
        if (!enemy || enemy.dead) {
            continue;
        }

        if (enemy.isBoss) {
            ctx.save();

            ctx.globalAlpha = 0.22;
            ctx.strokeStyle = enemy.color;
            ctx.lineWidth = 4;
            ctx.shadowColor = enemy.color;
            ctx.shadowBlur = 24;

            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius + 18 + Math.sin(performance.now() / 160) * 4, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        const sprite = getEnemySprite(enemy);
        ctx.drawImage(sprite.canvas, enemy.x - sprite.size / 2, enemy.y - sprite.size / 2);
        const shouldDrawHpBar = enemies.length < 120 || enemy.hp < enemy.maxHp;
        if (shouldDrawHpBar) {
            const hpWidth = enemy.radius * 2;
            const hpHeight = 5;
            const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 14, hpWidth, hpHeight);
            ctx.fillStyle = "#ff4066";
            ctx.fillRect(enemy.x - hpWidth / 2, enemy.y - enemy.radius - 14, hpWidth * hpPercent, hpHeight);
        }
    }
}

function drawProjectiles() {
    for (const projectile of projectiles) {
        const color = projectile.color || "#73ecff";

        ctx.save();

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 22;

        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.45;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            projectile.x - projectile.radius * 0.25,
            projectile.y - projectile.radius * 0.25,
            projectile.radius * 0.42,
            0,
            Math.PI * 2
        );
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
        const isHeal = powerUp.type === "heal";

        const color = isHeal ? "#35e07a" : isShield ? "#d8dde8" : "#ffd86b";
        const darkColor = isHeal ? "#062414" : isShield ? "#1c2028" : "#241209";
        const label = isHeal ? "+" : isShield ? "⛨" : "x2";
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
        } else if (isHeal) {
            const boxSize = radius * 1.75;

            ctx.beginPath();

            if (typeof ctx.roundRect === "function") {
                ctx.roundRect(
                    -boxSize / 2,
                    -boxSize / 2,
                    boxSize,
                    boxSize,
                    6
                );
            } else {
                ctx.rect(
                    -boxSize / 2,
                    -boxSize / 2,
                    boxSize,
                    boxSize
                );
            }

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-radius * 0.18, -radius * 0.62, radius * 0.36, radius * 1.24);
            ctx.fillRect(-radius * 0.62, -radius * 0.18, radius * 1.24, radius * 0.36);
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
        ctx.font = isHeal ? "bold 22px Arial" : isShield ? "bold 18px Arial" : "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, 1);
        ctx.restore();
    }
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
    } else if (enemy.type === "cowardShooter") {
        bctx.save();
        bctx.translate(cx, cy);

        bctx.shadowColor = "#ff9b2f";
        bctx.shadowBlur = 18;

        bctx.fillStyle = "#ff9b2f";
        bctx.beginPath();
        bctx.moveTo(0, -26);
        bctx.lineTo(22, 0);
        bctx.lineTo(0, 26);
        bctx.lineTo(-22, 0);
        bctx.closePath();
        bctx.fill();

        bctx.lineWidth = 3;
        bctx.strokeStyle = "#ff6a00";
        bctx.stroke();

        bctx.shadowBlur = 0;

        bctx.fillStyle = "#151327";
        bctx.beginPath();
        bctx.moveTo(0, -12);
        bctx.lineTo(10, 0);
        bctx.lineTo(0, 12);
        bctx.lineTo(-10, 0);
        bctx.closePath();
        bctx.fill();

        bctx.fillStyle = "#fff2cc";
        bctx.shadowColor = "#fff2cc";
        bctx.shadowBlur = 10;
        bctx.beginPath();
        bctx.arc(0, 0, 4, 0, Math.PI * 2);
        bctx.fill();

        bctx.restore();
    } else if (enemy.type === "hordeBomb") {
        bctx.save();
        bctx.translate(cx, cy);

        bctx.shadowColor = "#cbd5e1";
        bctx.shadowBlur = 18;

        bctx.fillStyle = "#9ca3af";
        bctx.beginPath();
        bctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        bctx.fill();

        bctx.strokeStyle = "#d1d5db";
        bctx.lineWidth = 4;

        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const inner = enemy.radius - 2;
            const outer = enemy.radius + 10;

            bctx.beginPath();
            bctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            bctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            bctx.stroke();
        }

        bctx.shadowBlur = 0;

        bctx.fillStyle = "#111827";
        bctx.beginPath();
        bctx.arc(-6, -4, 3, 0, Math.PI * 2);
        bctx.arc(6, -4, 3, 0, Math.PI * 2);
        bctx.fill();

        bctx.fillStyle = "#f8fafc";
        bctx.beginPath();
        bctx.arc(0, 5, 4, 0, Math.PI * 2);
        bctx.fill();

        bctx.restore();
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

function drawEnemyProjectiles() {
    for (const projectile of enemyProjectiles) {
        ctx.save();

        ctx.shadowColor = projectile.color;
        ctx.shadowBlur = 16;

        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(
            projectile.x - projectile.radius * 0.25,
            projectile.y - projectile.radius * 0.25,
            projectile.radius * 0.35,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }
}
