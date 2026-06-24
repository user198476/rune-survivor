function safeLocalStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        // Si le navigateur bloque localStorage, le jeu continue quand même.
    }
}

function parseStoredScore(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    return Math.max(0, Math.floor(parsed));
}
