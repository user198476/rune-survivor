function loadBestScore() {
    let loadedBest = 0;
    for (const key of BEST_SCORE_STORAGE_KEYS) {
        loadedBest = Math.max(loadedBest, parseStoredScore(safeLocalStorageGet(key)));
    }
    const statsRaw = safeLocalStorageGet(BEST_SCORE_STATS_KEY);
    if (statsRaw) {
        try {
            const stats = JSON.parse(statsRaw);
            loadedBest = Math.max(loadedBest, parseStoredScore(stats.bestScore));
        } catch (error) {
            // Stats corrompues : on ignore et on garde les autres clés.
        }
    }
    return loadedBest;
}

function saveBestScore(score) {
    const safeScore = Math.max(0, Math.floor(score));
    if (safeScore <= lastSavedBestScore) {
        return;
    }
    lastSavedBestScore = safeScore;
    for (const key of BEST_SCORE_STORAGE_KEYS) {
        safeLocalStorageSet(key, String(safeScore));
    }
    safeLocalStorageSet(BEST_SCORE_STATS_KEY, JSON.stringify({
        bestScore: safeScore,
        bestKills: player ? player.kills : 0,
        bestTime: Math.floor(gameTime),
        updatedAt: new Date().toISOString()
    }));
}

function saveCurrentRunScore(score) {
    const safeScore = Math.max(0, Math.floor(score));
    if (safeScore === lastSavedCurrentScore) {
        return;
    }
    lastSavedCurrentScore = safeScore;
    safeLocalStorageSet(CURRENT_RUN_STORAGE_KEY, JSON.stringify({
        score: safeScore,
        kills: player ? player.kills : 0,
        time: Math.floor(gameTime),
        level: player ? player.level : 1,
        savedAt: new Date().toISOString()
    }));
}

function getCurrentScore() {
    if (!player) {
        return 0;
    }
    return player.kills * 10 + Math.floor(gameTime);
}

function updateScoreState() {
    currentScore = getCurrentScore();
    saveCurrentRunScore(currentScore);
    if (currentScore > bestScore) {
        bestScore = currentScore;
        newBestThisRun = true;
        saveBestScore(bestScore);
    }
}

function finalizeScore() {
    updateScoreState();
    saveBestScore(bestScore);
    saveCurrentRunScore(currentScore);
}

function grantCoinsForRun() {
    if (runRewardGranted) {
        return;
    }
    metaCoins += currentScore;
    runRewardGranted = true;
    saveMetaProgression();
    updateMetaCurrencyDisplays();
}
