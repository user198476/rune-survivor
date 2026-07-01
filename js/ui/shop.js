let selectedShopCategory = "skins";

function openShopMenu() {
    loadProfileOwnership();
    loadProfileCustomization();

    if (typeof state !== "undefined") {
        state = "shop";
    }

    mainMenuOverlay.classList.add("hidden");
    shopOverlay.classList.remove("hidden");

    renderShopMenu();
}

function closeShopMenu() {
    shopOverlay.classList.add("hidden");
    mainMenuOverlay.classList.remove("hidden");

    if (typeof state !== "undefined") {
        state = "menu";
    }
}

function renderShopMenu() {
    renderShopTabs();
    renderShopCoins();
    renderShopItems();
}

function renderShopCoins() {
    if (!shopCoinsText) {
        return;
    }

    shopCoinsText.textContent = Math.floor(metaCoins || 0).toLocaleString("fr-FR");
}

function renderShopTabs() {
    const tabs = document.querySelectorAll(".shop-tab");

    tabs.forEach((tab) => {
        tab.classList.toggle(
            "active",
            tab.dataset.shopCategory === selectedShopCategory
        );
    });

    if (shopCategoryTitle) {
        if (selectedShopCategory === "skins") {
            shopCategoryTitle.textContent = "Skins";
        }

        if (selectedShopCategory === "backgrounds") {
            shopCategoryTitle.textContent = "Backgrounds";
        }

        if (selectedShopCategory === "projectiles") {
            shopCategoryTitle.textContent = "Tirs";
        }
    }
}

function renderShopItems() {
    if (!shopItemsGrid) {
        return;
    }

    const items = PROFILE_ITEMS[selectedShopCategory] || [];

    shopItemsGrid.innerHTML = "";

    for (const item of items) {
        const owned = isProfileItemUnlocked(selectedShopCategory, item.id);
        const equipped = getEquippedProfileItemId(selectedShopCategory) === item.id;
        const canBuy = !owned && metaCoins >= item.price;

        const card = document.createElement("article");
        card.className = "shop-item-card";

        if (owned) {
            card.classList.add("owned");
        }

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>

            <div class="shop-item-price">
                ${owned ? "Possédé" : `${item.price.toLocaleString("fr-FR")} pièces`}
            </div>

            <div class="shop-item-actions">
                ${
                    owned
                        ? `<button data-action="equip">${equipped ? "Équipé" : "Équiper"}</button>`
                        : `<button data-action="buy" ${canBuy ? "" : "disabled"}>Acheter</button>`
                }
            </div>
        `;

        card.addEventListener("click", () => {
            updateShopItemDetails(item, owned, equipped);
        });

        const actionButton = card.querySelector("button");

        actionButton?.addEventListener("click", (event) => {
            event.stopPropagation();

            if (owned) {
                equipShopItem(item);
                return;
            }

            buyShopItem(item);
        });

        shopItemsGrid.appendChild(card);
    }
}

function updateShopItemDetails(item, owned, equipped) {
    if (!shopItemDetails) {
        return;
    }

    shopItemDetails.innerHTML = `
        <span>${item.name}</span>
        <p>
            ${item.description}
            <br />
            ${
                owned
                    ? equipped
                        ? "Cet élément est actuellement équipé."
                        : "Cet élément est acheté et peut être équipé."
                    : `Prix : ${item.price.toLocaleString("fr-FR")} pièces.`
            }
        </p>
    `;
}

function buyShopItem(item) {
    if (isProfileItemUnlocked(selectedShopCategory, item.id)) {
        return;
    }

    if (metaCoins < item.price) {
        updateShopItemDetails(item, false, false);
        return;
    }

    metaCoins -= item.price;

    unlockProfileItem(selectedShopCategory, item.id);
    saveMetaProgression();
    updateMetaCurrencyDisplays();

    equipShopItem(item);

    renderShopMenu();
}

function equipShopItem(item) {
    if (!isProfileItemUnlocked(selectedShopCategory, item.id)) {
        return;
    }

    if (selectedShopCategory === "skins") {
        profileCustomization.skin = item.id;
    }

    if (selectedShopCategory === "backgrounds") {
        profileCustomization.background = item.id;
    }

    if (selectedShopCategory === "projectiles") {
        profileCustomization.projectile = item.id;
    }

    saveProfileCustomization();

    renderShopMenu();

    if (typeof renderProfileMenu === "function" && profileOverlay && !profileOverlay.classList.contains("hidden")) {
        renderProfileMenu();
    }
}

function bindShopMenuEvents() {
    shopBackButton?.addEventListener("click", closeShopMenu);

    const tabs = document.querySelectorAll(".shop-tab");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            selectedShopCategory = tab.dataset.shopCategory;
            renderShopMenu();
        });
    });
}
