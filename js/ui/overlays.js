function startGame() {
    resetGame();
    state = "playing";
    mainMenuOverlay.classList.add("hidden");
}

function pauseGame() {
    if (state !== "playing") {
        return;
    }
    clearInputKeys();
    updatePauseMenuScore();
    state = "paused";
    pauseOverlay.classList.remove("hidden");
}

function resumeGame() {
    if (state !== "paused") {
        return;
    }
    clearInputKeys();
    state = "playing";
    pauseOverlay.classList.add("hidden");
}

function togglePause() {
    if (state === "playing") {
        pauseGame();
        return;
    }
    if (state === "paused") {
        resumeGame();
    }
}

function endGame() {
    finalizeScore();
    grantCoinsForRun();
    state = "gameover";
    finalTimeText.textContent = formatTime(gameTime);
    finalKillsText.textContent = player.kills;
    finalScoreText.textContent = currentScore;
    finalBestScoreText.textContent = bestScore;
    if (newBestThisRun) {
        finalNewBestBadge.classList.remove("hidden");
    } else {
        finalNewBestBadge.classList.add("hidden");
    }
    gameOverOverlay.classList.remove("hidden");
}

function clearInputKeys() {
    keys.clear();
}
