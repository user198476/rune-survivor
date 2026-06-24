function updateHud() {
    hpFill.style.width = `${(player.hp / player.maxHp) * 100}%`;
    xpFill.style.width = `${(player.xp / player.xpToNext) * 100}%`;
    levelText.textContent = player.level;
    killsText.textContent = player.kills;
    timerText.textContent = formatTime(gameTime);
    updateScoreState();
    scoreText.textContent = currentScore;
    bestScoreText.textContent = bestScore;
    if (newBestThisRun) {
        newBestBadge.classList.remove("hidden");
    } else {
        newBestBadge.classList.add("hidden");
    }
    if (player.damageBoostTimer > 0) {
        buffPanel.classList.remove("hidden");
        buffTimerText.textContent = `${Math.ceil(player.damageBoostTimer)}s`;
    } else {
        buffPanel.classList.add("hidden");
    }
    if (player.shieldTimer > 0) {
        shieldPanel.classList.remove("hidden");
        shieldTimerText.textContent = `${Math.ceil(player.shieldTimer)}s`;
    } else {
        shieldPanel.classList.add("hidden");
    }
    if (player.cloneTimer > 0) {
        clonePanel.classList.remove("hidden");
        cloneTimerText.textContent = `${Math.ceil(player.cloneTimer)}s`;
    } else {
        clonePanel.classList.add("hidden");
    }
}

function updatePauseMenuScore() {
    updateScoreState();
    pauseScoreText.textContent = currentScore;
    pauseBestScoreText.textContent = bestScore;
}

function updateMetaCurrencyDisplays() {
    if (menuCoinsText) {
        menuCoinsText.textContent = Math.floor(metaCoins);
    }
    if (skillTreeCoinsText) {
        skillTreeCoinsText.textContent = Math.floor(metaCoins);
    }
}
