const PROFILE_STORAGE_KEY = "runeSurvivor.profile";

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
        unlocked: true
    }, {
        id: "skin-royal",
        name: "Mage solaire",
        description: "Une variante dorée, future récompense du shop.",
        unlocked: false
    }, {
        id: "skin-void",
        name: "Mage du Néant",
        description: "Un skin violet sombre lié aux failles.",
        unlocked: false
    }],

    backgrounds: [{
        id: "bg-neon-city",
        name: "Cité néon",
        description: "Background principal actuel.",
        unlocked: true
    }, {
        id: "bg-void",
        name: "Abîme du Néant",
        description: "Un fond sombre et cosmique.",
        unlocked: false
    }, {
        id: "bg-forge",
        name: "Forge astrale",
        description: "Un décor chaud et volcanique.",
        unlocked: false
    }],

    projectiles: [{
        id: "projectile-blue",
        name: "Tir arcanique",
        description: "Projectile bleu classique.",
        unlocked: true
    }, {
        id: "projectile-gold",
        name: "Tir solaire",
        description: "Projectile doré premium.",
        unlocked: false
    }, {
        id: "projectile-purple",
        name: "Tir du Néant",
        description: "Projectile violet sombre.",
        unlocked: false
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

        card.className = "profile-item-card";

        if (!item.unlocked) {
            card.classList.add("locked");
        }

        if (item.id === equippedId) {
            card.classList.add("equipped");
        }

        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="profile-item-status">
                ${item.id === equippedId ? "Équipé" : item.unlocked ? "Disponible" : "Shop"}
            </div>
        `;

        card.addEventListener("click", () => selectProfileItem(item));

        profileItemsGrid.appendChild(card);
    }
}

function selectProfileItem(item) {
    updateProfileItemDetails(item);

    if (!item.unlocked) {
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

    profileItemDetails.innerHTML = `
        <span>${item.name}</span>
        <p>
            ${item.description}
            <br />
            ${item.unlocked ? "Cet élément peut être équipé." : "Cet élément sera débloquable via le futur shop."}
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
