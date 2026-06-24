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
