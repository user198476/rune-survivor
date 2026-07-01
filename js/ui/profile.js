const PROFILE_STORAGE_KEY = "runeSurvivor.profile";
const PROFILE_OWNERSHIP_STORAGE_KEY = "runeSurvivor.profile.owned";
let profileOwnership = {
    skins: ["skin-default"],
    backgrounds: ["bg-neon-city"],
    projectiles: ["projectile-blue"]
};

let selectedProfileCategory = "skins";

let profileCustomization = {
    skin: "skin-default",
    background: "bg-neon-city",
    projectile: "projectile-blue"
};

const PROFILE_ITEMS = {
    skins: [{
        id: "skin-default",
        name: "Mage runique",
        description: "Le skin classique du survivant.",
        price: 0,
        defaultUnlocked: true
    }, {
        id: "skin-royal",
        name: "Mage solaire",
        description: "Une variante dorée, future récompense du shop.",
        price: 5000,
        defaultUnlocked: false
    }, {
        id: "skin-void",
        name: "Mage du Néant",
        description: "Un skin violet sombre lié aux failles.",
        price: 10000,
        defaultUnlocked: false
    }],

    backgrounds: [{
        id: "bg-neon-city",
        name: "Cité néon",
        description: "Background principal actuel.",
        price: 0,
        defaultUnlocked: true
    }, {
        id: "bg-void",
        name: "Abîme du Néant",
        description: "Un fond sombre et cosmique.",
        price: 5000,
        defaultUnlocked: false
    }, {
        id: "bg-forge",
        name: "Forge astrale",
        description: "Un décor chaud et volcanique.",
        price: 10000,
        defaultUnlocked: false
    }],

    projectiles: [{
        id: "projectile-blue",
        name: "Tir arcanique",
        description: "Projectile bleu classique.",
        price: 0,
        defaultUnlocked: true
    }, {
        id: "projectile-gold",
        name: "Tir solaire",
        description: "Projectile doré premium.",
        price: 5000,
        defaultUnlocked: false
    }, {
        id: "projectile-purple",
        name: "Tir du Néant",
        description: "Projectile violet sombre.",
        price: 10000,
        defaultUnlocked: false
    }]
};

function loadProfileCustomization() {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
        return;
    }

    try {
        const parsed = JSON.parse(raw);

        profileCustomization = {
            ...profileCustomization,
            ...parsed
        };
    } catch (error) {
        profileCustomization = {
            skin: "skin-default",
            background: "bg-neon-city",
            projectile: "projectile-blue"
        };
    }
}

function saveProfileCustomization() {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileCustomization));
}

function openProfileMenu() {
    loadProfileCustomization();
    loadProfileOwnership();

    if (typeof state !== "undefined") {
        state = "profile";
    }

    mainMenuOverlay.classList.add("hidden");
    profileOverlay.classList.remove("hidden");

    renderProfileMenu();
}

function closeProfileMenu() {
    profileOverlay.classList.add("hidden");
    mainMenuOverlay.classList.remove("hidden");

    if (typeof state !== "undefined") {
        state = "menu";
    }
}

function renderProfileMenu() {
    updateProfileCoins();
    renderProfileTabs();
    renderProfileItems();
    renderProfilePreview();
}

function updateProfileCoins() {
    if (!profileCoinsText) {
        return;
    }

    profileCoinsText.textContent = Math.floor(metaCoins || 0).toLocaleString("fr-FR");
}

function renderProfileTabs() {
    const tabs = document.querySelectorAll(".profile-tab");

    tabs.forEach((tab) => {
        tab.classList.toggle(
            "active",
            tab.dataset.profileCategory === selectedProfileCategory
        );
    });

    if (profileCategoryTitle) {
        if (selectedProfileCategory === "skins") {
            profileCategoryTitle.textContent = "Skins";
        }

        if (selectedProfileCategory === "backgrounds") {
            profileCategoryTitle.textContent = "Backgrounds";
        }

        if (selectedProfileCategory === "projectiles") {
            profileCategoryTitle.textContent = "Tirs";
        }
    }
}

function renderProfileItems() {
    if (!profileItemsGrid) {
        return;
    }

    const items = PROFILE_ITEMS[selectedProfileCategory] || [];
    const equippedId = getEquippedProfileItemId(selectedProfileCategory);

    profileItemsGrid.innerHTML = "";

    for (const item of items) {
        const card = document.createElement("button");
        const unlocked = isProfileItemUnlocked(selectedProfileCategory, item.id);

        card.className = "profile-item-card";

        if (!unlocked) {
            card.classList.add("locked");
        }

        if (item.id === equippedId) {
            card.classList.add("equipped");
        }

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="profile-item-status">
                ${item.id === equippedId ? "Équipé" : unlocked ? "Disponible" : `${item.price.toLocaleString("fr-FR")} pièces`}
            </div>
        `;

        card.addEventListener("click", () => selectProfileItem(item));

        profileItemsGrid.appendChild(card);
    }
}

function selectProfileItem(item) {
    updateProfileItemDetails(item);

    if (!isProfileItemUnlocked(selectedProfileCategory, item.id)) {
        return;
    }

    if (selectedProfileCategory === "skins") {
        profileCustomization.skin = item.id;
    }

    if (selectedProfileCategory === "backgrounds") {
        profileCustomization.background = item.id;
    }

    if (selectedProfileCategory === "projectiles") {
        profileCustomization.projectile = item.id;
    }

    saveProfileCustomization();
    renderProfileMenu();
}

function updateProfileItemDetails(item) {
    if (!profileItemDetails) {
        return;
    }

    const unlocked = isProfileItemUnlocked(selectedProfileCategory, item.id);

    profileItemDetails.innerHTML = `
        <span>${item.name}</span>
        <p>
            ${item.description}
            <br />
            ${
                unlocked
                    ? "Cet élément peut être équipé."
                    : `Disponible au shop pour ${item.price.toLocaleString("fr-FR")} pièces.`
            }
        </p>
    `;
}

function getEquippedProfileItemId(category) {
    if (category === "skins") {
        return profileCustomization.skin;
    }

    if (category === "backgrounds") {
        return profileCustomization.background;
    }

    if (category === "projectiles") {
        return profileCustomization.projectile;
    }

    return "";
}

function renderProfilePreview() {
    if (profilePreviewStage) {
        profilePreviewStage.className = `profile-preview-stage ${profileCustomization.background}`;
    }

    if (profileMagePreview) {
        profileMagePreview.className = `profile-mage-preview ${profileCustomization.skin}`;
    }

    if (profileProjectilePreview) {
        profileProjectilePreview.className = `profile-projectile-preview ${profileCustomization.projectile}`;
    }

    if (profileEquippedLabel) {
        const skin = PROFILE_ITEMS.skins.find((item) => item.id === profileCustomization.skin);

        profileEquippedLabel.textContent = skin ? skin.name : "Mage runique";
    }
}

function bindProfileMenuEvents() {
    profileBackButton?.addEventListener("click", closeProfileMenu);

    const tabs = document.querySelectorAll(".profile-tab");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            selectedProfileCategory = tab.dataset.profileCategory;
            renderProfileMenu();
        });
    });
}

function loadProfileOwnership() {
    const raw = localStorage.getItem(PROFILE_OWNERSHIP_STORAGE_KEY);

    if (!raw) {
        saveProfileOwnership();
        return;
    }

    try {
        const parsed = JSON.parse(raw);

        profileOwnership = {
            skins: Array.isArray(parsed.skins) ? parsed.skins : ["skin-default"],
            backgrounds: Array.isArray(parsed.backgrounds) ? parsed.backgrounds : ["bg-neon-city"],
            projectiles: Array.isArray(parsed.projectiles) ? parsed.projectiles : ["projectile-blue"]
        };
    } catch (error) {
        profileOwnership = {
            skins: ["skin-default"],
            backgrounds: ["bg-neon-city"],
            projectiles: ["projectile-blue"]
        };
    }

    ensureDefaultProfileItemsUnlocked();
}

function saveProfileOwnership() {
    localStorage.setItem(PROFILE_OWNERSHIP_STORAGE_KEY, JSON.stringify(profileOwnership));
}

function ensureDefaultProfileItemsUnlocked() {
    for (const category of Object.keys(PROFILE_ITEMS)) {
        if (!profileOwnership[category]) {
            profileOwnership[category] = [];
        }

        for (const item of PROFILE_ITEMS[category]) {
            if (item.defaultUnlocked && !profileOwnership[category].includes(item.id)) {
                profileOwnership[category].push(item.id);
            }
        }
    }

    saveProfileOwnership();
}

function isProfileItemUnlocked(category, itemId) {
    return Boolean(
        profileOwnership[category] &&
        profileOwnership[category].includes(itemId)
    );
}

function unlockProfileItem(category, itemId) {
    if (!profileOwnership[category]) {
        profileOwnership[category] = [];
    }

    if (!profileOwnership[category].includes(itemId)) {
        profileOwnership[category].push(itemId);
        saveProfileOwnership();
    }
}
