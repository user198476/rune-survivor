function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function normalize(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
        return {
            x: 0,
            y: 0
        };
    }
    return {
        x: dx / len,
        y: dy / len
    };
}

function getShortestAngleDifference(from, to) {
    let diff = to - from;
    while (diff > Math.PI) {
        diff -= Math.PI * 2;
    }
    while (diff < -Math.PI) {
        diff += Math.PI * 2;
    }
    return diff;
}

function lerpAngle(from, to, speed, dt) {
    const diff = getShortestAngleDifference(from, to);
    return from + diff * Math.min(1, speed * dt);
}
