function loadGameVersion() {
    if (!gameVersionText) {
        return;
    }

    fetch("version.txt", {
        cache: "no-store"
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("version.txt introuvable");
            }

            return response.text();
        })
        .then((version) => {
            const cleanVersion = version.trim();

            if (!cleanVersion) {
                gameVersionText.textContent = "Version inconnue";
                return;
            }

            gameVersionText.textContent = `Version ${cleanVersion}`;
        })
        .catch(() => {
            gameVersionText.textContent = "Version inconnue";
        });
}

function bindMenuButtons() {
    playButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", startGame);
    resumeButton.addEventListener("click", resumeGame);

    openSkillTreeButton.addEventListener("click", () => openSkillTree("menu"));
    pauseSkillTreeButton.addEventListener("click", () => openSkillTree("paused"));
    gameOverSkillTreeButton.addEventListener("click", () => openSkillTree("gameover"));
    closeSkillTreeButton.addEventListener("click", closeSkillTree);
    skillTierPreviousButton.addEventListener("click", selectPreviousSkillTier);
    skillTierNextButton.addEventListener("click", selectNextSkillTier); 
    resetProgressionButton.addEventListener("click", resetProgressionButKeepScores);
    skillTreeStatsToggleButton.addEventListener("click", toggleSkillStatsPopover);

    if (DEBUG_BOSS_TEST_ENABLED) {
        bossTestPanel.classList.remove("hidden");

        testBoss1Button.addEventListener("click", () => {
            startBossTest("royal_slime");
        });

        testBoss2Button.addEventListener("click", () => {
            startBossTest("blood_bat");
        });

        testBoss3Button.addEventListener("click", () => {
            startBossTest("rune_brute");
        });
    } else {
        bossTestPanel.classList.add("hidden");
    }

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
    loadGameVersion();
    resetGame();

    bindInputEvents();
    bindMenuButtons();

    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop);
    });
}

bootGame();