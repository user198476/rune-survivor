function showLevelUp() {
    state = "levelup";

    currentUpgrades = getRandomUpgrades(3);

    const legendaryUpgrade = getRandomLegendaryUpgrade();

    if (legendaryUpgrade) {
        currentUpgrades.push(legendaryUpgrade);
    }

    upgradeCards.innerHTML = "";
    upgradeCards.classList.toggle("has-legendary", !!legendaryUpgrade);

    currentUpgrades.forEach((upgrade, index) => {
        const isLegendary = upgrade.rarity === "legendary";

        const card = document.createElement("button");
        card.className = isLegendary
            ? "upgrade-card legendary-upgrade-card"
            : "upgrade-card";

        card.innerHTML = `
            ${isLegendary ? `<div class="legendary-card-badge">RUNE LÉGENDAIRE</div>` : ""}

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

function getRandomUpgrades(count) {
    const pool = upgrades.filter((upgrade) => canUpgradeAppear(upgrade));
    const selected = [];
    while (selected.length < count && pool.length > 0) {
        const index = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(index, 1)[0]);
    }
    return selected;
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
