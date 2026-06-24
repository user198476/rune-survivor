function drawBackground() {
    const tileSize = 64;
    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.strokeStyle = "rgba(142, 113, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < GAME_WIDTH; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < GAME_HEIGHT; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
    }
    ctx.save();
    ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    ctx.strokeStyle = "rgba(135, 91, 255, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 170, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const x = Math.cos(angle) * 215;
        const y = Math.sin(angle) * 215;
        ctx.fillStyle = "rgba(105, 218, 255, 0.16)";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}