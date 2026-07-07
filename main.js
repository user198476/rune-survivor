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
    pauseMainMenuButton?.addEventListener("click", returnToMainMenuFromPause);

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

    if (DEBUG_BOSS_TEST_ENABLED) {
        devMenuButton?.addEventListener("click", openDevBossModal);

        devBossModal?.addEventListener("click", (event) => {
            const clickedCloseButton = event.target.closest("#devBossCloseButton");
            const clickedBackdrop = event.target.classList.contains("dev-boss-modal-backdrop");

            if (clickedCloseButton || clickedBackdrop) {
                closeDevBossModal();
            }
        });

        devBoss1Button?.addEventListener("click", () => startDevBossTest("royal_slime"));
        devBoss2Button?.addEventListener("click", () => startDevBossTest("blood_bat"));
        devBoss3Button?.addEventListener("click", () => startDevBossTest("rune_brute"));
    }

    quitGameButton?.addEventListener("click", () => {
        window.close();

        setTimeout(() => {
            alert("Si l’onglet ne se ferme pas automatiquement, ferme-le manuellement.");
        }, 120);
    });

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

function openDevBossModal() {
    if (!DEBUG_BOSS_TEST_ENABLED) {
        console.warn("Mode Dev Boss désactivé. Mets DEBUG_BOSS_TEST_ENABLED à true.");
        return;
    }

    if (!devBossModal) {
        console.warn("Modal Dev Boss introuvable dans le HTML.");
        return;
    }

    devBossModal.classList.remove("hidden");
}

function closeDevBossModal() {
    if (!devBossModal) {
        return;
    }

    devBossModal.classList.add("hidden");
}

function startDevBossTest(bossId) {
    if (!DEBUG_BOSS_TEST_ENABLED) {
        return;
    }

    closeDevBossModal();

    if (typeof startBossTest !== "function") {
        console.warn("startBossTest est introuvable.");
        return;
    }

    startBossTest(bossId);
}

function returnToMainMenuFromPause() {
    if (typeof finalizeScore === "function") {
        finalizeScore();
    }

    if (typeof CURRENT_RUN_STORAGE_KEY !== "undefined") {
        localStorage.removeItem(CURRENT_RUN_STORAGE_KEY);
    }

    if (typeof keys !== "undefined") {
        keys.clear();
    }

    pauseOverlay?.classList.add("hidden");
    levelUpOverlay?.classList.add("hidden");
    skillTreeOverlay?.classList.add("hidden");
    gameOverOverlay?.classList.add("hidden");

    mainMenuOverlay?.classList.remove("hidden");

    if (typeof updateMetaCurrencyDisplays === "function") {
        updateMetaCurrencyDisplays();
    }

    state = "menu";
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