function updateHud() {
    const currentHp = Math.max(0, Math.ceil(player.hp || 0));
    const maxHp = Math.max(1, Math.ceil(player.maxHp || 1));

    const currentXp = Math.max(0, Math.floor(player.xp || 0));
    const maxXp = Math.max(1, Math.floor(player.xpToNext || 1));

    hpFill.style.width = `${Math.min(100, Math.max(0, (currentHp / maxHp) * 100))}%`;
    xpFill.style.width = `${Math.min(100, Math.max(0, (currentXp / maxXp) * 100))}%`;

    if (hpValueText) {
        hpValueText.textContent = `${currentHp.toLocaleString("fr-FR")} / ${maxHp.toLocaleString("fr-FR")}`;
    }

    if (xpValueText) {
        xpValueText.textContent = `${currentXp.toLocaleString("fr-FR")} / ${maxXp.toLocaleString("fr-FR")}`;
    }

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
