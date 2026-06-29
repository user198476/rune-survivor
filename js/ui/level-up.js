function showLevelUp() {
    state = "levelup";

    const normalUpgrades = getRandomNormalUpgrades(3);
    const legendaryCards = getLegendaryCardsForLevelUp(2);

    currentUpgrades = [
        ...normalUpgrades,
        ...legendaryCards
    ];

    upgradeCards.innerHTML = "";

    const hasLegendaryCards = legendaryCards.length > 0;

    upgradeCards.classList.toggle("has-legendary", hasLegendaryCards);
    upgradeCards.classList.toggle("has-five-cards", currentUpgrades.length >= 5);

    currentUpgrades.forEach((upgrade, index) => {
        const isLegendary = upgrade.rarity === "legendary";
        const isLegendaryUpgrade = upgrade.rarity === "legendary-upgrade";

        const card = document.createElement("button");

        card.className = isLegendary || isLegendaryUpgrade
            ? "upgrade-card legendary-upgrade-card"
            : "upgrade-card";

        card.innerHTML = `
            ${isLegendary || isLegendaryUpgrade ? `
                <div class="legendary-sparks">
                    <span class="spark spark-1"></span>
                    <span class="spark spark-2"></span>
                    <span class="spark spark-3"></span>
                    <span class="spark spark-4"></span>
                    <span class="spark spark-5"></span>
                    <span class="spark spark-6"></span>
                </div>
                <div class="legendary-card-badge">
                    ${isLegendaryUpgrade ? "AMÉLIORATION LÉGENDAIRE" : "RUNE LÉGENDAIRE"}
                </div>
            ` : ""}

            <div class="upgrade-icon">${upgrade.icon}</div>
            <h2>${upgrade.title}</h2>
            <p>${upgrade.description}</p>

            <div class="upgrade-key">
                <kbd class="upgrade-keycap">${index + 1}</kbd>
            </div>
        `;

        card.addEventListener("click", () => chooseUpgrade(index));
        upgradeCards.appendChild(card);
    });

    levelUpOverlay.classList.remove("hidden");
}

function getRandomNormalUpgrades(count) {
    const pool = upgrades.filter((upgrade) => {
        return !upgrade.legendaryUpgradeFor && canUpgradeAppear(upgrade);
    });

    return pickRandomUniqueUpgrades(pool, count);
}

function getRandomLegendaryImprovementUpgrades(maxCount) {
    const activeLegendaryIds = getActiveLegendaryUpgradeIds();

    if (activeLegendaryIds.length === 0) {
        return [];
    }

    const selected = [];

    const shuffledLegendaryIds = [...activeLegendaryIds].sort(() => Math.random() - 0.5);

    for (const legendaryId of shuffledLegendaryIds) {
        if (selected.length >= maxCount) {
            break;
        }

        const pool = upgrades.filter((upgrade) => {
            return upgrade.legendaryUpgradeFor === legendaryId &&
                canUpgradeAppear(upgrade);
        });

        if (pool.length === 0) {
            continue;
        }

        const picked = pool[Math.floor(Math.random() * pool.length)];

        selected.push(picked);
    }

    return selected;
}

function pickRandomUniqueUpgrades(pool, count) {
    const selected = [];
    const available = [...pool];

    while (selected.length < count && available.length > 0) {
        const index = Math.floor(Math.random() * available.length);
        selected.push(available.splice(index, 1)[0]);
    }

    return selected;
}

function getActiveLegendaryUpgradeIds() {
    const active = [];

    if (player.guardianOrbUnlocked) {
        active.push("legendary_guardian_orb");
    }

    if (player.astralRainUnlocked) {
        active.push("legendary_astral_rain");
    }

    if (player.tripleEchoUnlocked) {
        active.push("legendary_triple_echo");
    }

    return active;
}

function canUpgradeAppear(upgrade) {
    if (typeof upgrade.canAppear === "function") {
        return upgrade.canAppear();
    }
    return true;
}

function chooseUpgrade(index) {
    if (state !== "levelup") {
        return;
    }
    const upgrade = currentUpgrades[index];
    if (!upgrade) {
        return;
    }
    upgrade.apply();
    clampPlayerStats();
    createParticles(player.x, player.y, 40, "#b88cff", 2.2);
    levelUpOverlay.classList.add("hidden");
    state = "playing";
    updateHud();
}

function shouldOfferLegendaryUpgrade() {
    if (!player || player.level <= 1) {
        return false;
    }

    return player.level % LEGENDARY_UPGRADE_INTERVAL === 0;
}

function getRandomLegendaryUpgrade() {
    if (!shouldOfferLegendaryUpgrade()) {
        return null;
    }

    const pool = legendaryUpgrades.filter((upgrade) => canUpgradeAppear(upgrade));

    if (pool.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * pool.length);

    return pool[index];
}

function getLegendaryCardsForLevelUp(maxCount) {
    const selected = [];

    const newLegendaryUpgrade = getRandomLegendaryUpgrade();

    if (newLegendaryUpgrade) {
        selected.push(newLegendaryUpgrade);
    }

    const remainingSlots = maxCount - selected.length;

    if (remainingSlots > 0) {
        const legendaryImprovementUpgrades = getRandomLegendaryImprovementUpgrades(remainingSlots);

        selected.push(...legendaryImprovementUpgrades);
    }

    return selected;
}
