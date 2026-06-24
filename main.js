function bindMenuButtons() {
    playButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", startGame);
    resumeButton.addEventListener("click", resumeGame);

    openSkillTreeButton.addEventListener("click", () => openSkillTree("menu"));
    pauseSkillTreeButton.addEventListener("click", () => openSkillTree("paused"));
    gameOverSkillTreeButton.addEventListener("click", () => openSkillTree("gameover"));
    closeSkillTreeButton.addEventListener("click", closeSkillTree);

    window.addEventListener("beforeunload", () => {
        if (!player) {
            return;
        }

        finalizeScore();
    });
}

function bootGame() {
    loadMetaProgression();
    updateMetaCurrencyDisplays();
    resetGame();

    bindInputEvents();
    bindMenuButtons();

    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop);
    });
}

bootGame();