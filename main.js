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

    devMenuButton?.addEventListener("click", openTrainingBossModal);

    devBossModal?.addEventListener("click", (event) => {
        const clickedCloseButton = event.target.closest("#devBossCloseButton");
        const clickedBackdrop = event.target.classList.contains("dev-boss-modal-backdrop");

        if (clickedCloseButton || clickedBackdrop) {
            closeTrainingBossModal();
        }
    });

    devBoss1Button?.addEventListener("click", () => startTrainingBossTest("royal_slime"));
    devBoss2Button?.addEventListener("click", () => startTrainingBossTest("blood_bat"));
    devBoss3Button?.addEventListener("click", () => startTrainingBossTest("rune_brute"));
    devBoss4Button?.addEventListener("click", () => startTrainingBossTest("coward_trickster"));

    trainingRestartButton?.addEventListener("click", restartTrainingSession);
    trainingMainMenuButton?.addEventListener("click", returnToMainMenuFromTraining);

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
    if (!trainingMode && typeof finalizeScore === "function") {
        finalizeScore();
    }

    trainingMode = false;

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

function openTrainingBossModal() {
    devBossModal?.classList.remove("hidden");
}

function closeTrainingBossModal() {
    devBossModal?.classList.add("hidden");
}

function startTrainingBossTest(bossId) {
    const bossDefinition = BOSS_WAVES.find((boss) => boss.id === bossId);

    if (!bossDefinition) {
        return;
    }

    resetGame();

    trainingMode = true;
    trainingBossId = bossId;
    trainingDamageTaken = 0;
    trainingDuration = 0;
    trainingPlayerDefeated = false;

    state = "playing";
    gameTime = 0;
    waveTime = bossDefinition.time;
    currentScore = 0;

    closeTrainingBossModal();

    mainMenuOverlay.classList.add("hidden");
    trainingResultOverlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    levelUpOverlay.classList.add("hidden");
    skillTreeOverlay.classList.add("hidden");

    triggeredBossIds = new Set(
        BOSS_WAVES
            .filter((boss) => boss.time < bossDefinition.time)
            .map((boss) => boss.id)
    );

    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    gems = [];
    powerUps = [];
    spikes = [];
    particles = [];
    floatingTexts = [];
    enemyGrid.clear();

    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT - 135;
    player.hp = player.maxHp;
    player.fireCooldown = 0;

    startBossIntro(bossDefinition);
    updateHud();
}

function registerTrainingDamage(amount) {
    if (!trainingMode || amount <= 0) {
        return;
    }

    trainingDamageTaken += amount;
}

function handlePlayerDefeat() {
    if (trainingMode) {
        endTrainingSession(true);
        return;
    }

    endGame();
}

function endTrainingSession(playerDefeated) {
    if (!trainingMode) {
        return;
    }

    trainingDuration = gameTime;
    trainingPlayerDefeated = playerDefeated;
    trainingMode = false;

    state = "trainingover";

    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    gems = [];
    powerUps = [];
    spikes = [];
    bossDangerZones = [];
    bossLasers = [];
    bossMissiles = [];
    bossWallStrikes = [];
    currentBoss = null;
    bossState = "none";
    enemyGrid.clear();

    trainingResultTitle.textContent = playerDefeated ? "Entraînement terminé" : "Boss vaincu";
    trainingDeathText.classList.toggle("hidden", !playerDefeated);
    trainingDurationText.textContent = formatTime(trainingDuration);
    trainingDamageTakenText.textContent = Math.ceil(trainingDamageTaken).toLocaleString("fr-FR");

    trainingResultOverlay.classList.remove("hidden");
}

function restartTrainingSession() {
    if (!trainingBossId) {
        returnToMainMenuFromTraining();
        return;
    }

    startTrainingBossTest(trainingBossId);
}

function returnToMainMenuFromTraining() {
    trainingMode = false;
    trainingResultOverlay.classList.add("hidden");
    resetGame();
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