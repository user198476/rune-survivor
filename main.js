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
    playButton?.addEventListener("click", startGame);
    restartButton?.addEventListener("click", startGame);
    resumeButton?.addEventListener("click", resumeGame);

    openSkillTreeButton?.addEventListener("click", () => openSkillTree("menu"));
    pauseSkillTreeButton?.addEventListener("click", () => openSkillTree("paused"));
    gameOverSkillTreeButton?.addEventListener("click", () => openSkillTree("gameover"));
    closeSkillTreeButton?.addEventListener("click", closeSkillTree);

    skillTierPreviousButton?.addEventListener("click", selectPreviousSkillTier);
    skillTierNextButton?.addEventListener("click", selectNextSkillTier);

    resetProgressionButton?.addEventListener("click", openResetProgressionModal);
    cancelResetProgressionButton?.addEventListener("click", closeResetProgressionModal);
    confirmResetProgressionButton?.addEventListener("click", confirmResetProgression);

    skillTreeStatsToggleButton?.addEventListener("click", toggleSkillStatsPopover);

    profileMenuButton?.addEventListener("click", openProfileMenu);

    shopMenuButton?.addEventListener("click", openShopMenu);

    devMenuButton?.addEventListener("click", () => {
        if (DEBUG_BOSS_TEST_ENABLED && bossTestPanel) {
            bossTestPanel.classList.toggle("hidden");
            return;
        }
    });

    quitGameButton?.addEventListener("click", () => {
        window.close();

        setTimeout(() => {
            alert("Si l’onglet ne se ferme pas automatiquement, ferme-le manuellement.");
        }, 120);
    });

    if (bossTestPanel) {
        bossTestPanel.classList.toggle("hidden", !DEBUG_BOSS_TEST_ENABLED);
    }

    if (DEBUG_BOSS_TEST_ENABLED) {
        testBoss1Button?.addEventListener("click", () => {
            startBossTest("royal_slime");
        });

        testBoss2Button?.addEventListener("click", () => {
            startBossTest("blood_bat");
        });

        testBoss3Button?.addEventListener("click", () => {
            startBossTest("rune_brute");
        });
    }

    window.addEventListener("beforeunload", () => {
        if (!player) {
            return;
        }

        finalizeScore();
    });
}

function openResetProgressionModal() {
    resetScoreCheckbox.checked = false;
    resetProgressionModal.classList.remove("hidden");
}

function closeResetProgressionModal() {
    resetProgressionModal.classList.add("hidden");
}

function confirmResetProgression() {
    const resetScores = resetScoreCheckbox.checked;

    resetProgressionButKeepScores(resetScores);

    closeResetProgressionModal();
}

function bootGame() {
    loadMetaProgression();

    if (typeof loadProfileCustomization === "function") {
        loadProfileCustomization();
    }

    if (typeof loadProfileOwnership === "function") {
        loadProfileOwnership();
    }

    if (typeof preloadProfileSkinImages === "function") {
        preloadProfileSkinImages();
    }
    
    updateMetaCurrencyDisplays();
    loadGameVersion();
    resetGame();

    bindInputEvents();
    bindMenuButtons();
    bindProfileMenuEvents();
    bindShopMenuEvents();

    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop);
    });
}

bootGame();