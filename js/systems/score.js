function loadBestScore() {
    const keys = [
        BEST_SCORE_STORAGE_KEY,
        ...LEGACY_BEST_SCORE_STORAGE_KEYS
    ];

    let loadedBestScore = 0;

    for (const key of keys) {
        const value = Number(localStorage.getItem(key));

        if (!Number.isNaN(value)) {
            loadedBestScore = Math.max(loadedBestScore, value);
        }
    }

    // Migration vers la clé propre unique
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(loadedBestScore));

    // Nettoyage des anciennes clés
    for (const legacyKey of LEGACY_BEST_SCORE_STORAGE_KEYS) {
        localStorage.removeItem(legacyKey);
    }

    return loadedBestScore;
}

function saveBestScore(value) {
    const cleanValue = Math.max(0, Math.floor(Number(value) || 0));

    localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(cleanValue));

    for (const legacyKey of LEGACY_BEST_SCORE_STORAGE_KEYS) {
        localStorage.removeItem(legacyKey);
    }
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
