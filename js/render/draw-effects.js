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
