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
        description: "Un skin doré premium.",
        price: 5000,
        defaultUnlocked: false
    }, {
        id: "skin-void",
        name: "Mage du Néant",
        description: "Un skin violet sombre lié aux failles.",
        price: 5000,
        defaultUnlocked: false
    }, {
        id: "skin-lime",
        name: "Mage RunatoR",
        description: "Un skin vert vif et acidulé.",
        price: 8000,
        defaultUnlocked: false
    }, {
        id: "skin-midnight-purple-gtr-r34",
        name: "Midnight Purple GT-R R34",
        description: "Un skin premium inspiré du Midnight Purple, avec reflets violets métalliques et style racing.",
        price: 5000,
        defaultUnlocked: false,
        previewImage: "assets/skins/skin-midnight-purple-gtr-r34.png",
        gameImage: "assets/skins/skin-midnight-purple-gtr-r34.png"
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
    updateProfileScore();
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

    const skinItem = getEquippedSkinItem();

    if (profileSkinImagePreview && profileMagePreview) {
        if (skinItem && skinItem.previewImage) {
            profileSkinImagePreview.src = skinItem.previewImage;
            profileSkinImagePreview.classList.remove("hidden");
            profileMagePreview.classList.add("hidden");
        } else {
            profileSkinImagePreview.classList.add("hidden");
            profileMagePreview.classList.remove("hidden");
            profileMagePreview.className = `profile-mage-preview ${profileCustomization.skin}`;
        }
    }

    if (profileProjectilePreview) {
        profileProjectilePreview.className = `profile-projectile-preview ${profileCustomization.projectile}`;
    }

    if (profileEquippedLabel) {
        profileEquippedLabel.textContent = skinItem ? skinItem.name : "Mage runique";
    }
}

function bindProfileMenuEvents() {
    profileBackButton?.addEventListener("click", closeProfileMenu);

    profileSkillTreeButton?.addEventListener("click", () => {
        profileOverlay.classList.add("hidden");
        openSkillTree("profile");
    });

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

function getEquippedSkinId() {
    return profileCustomization.skin || "skin-default";
}

function getEquippedBackgroundId() {
    return profileCustomization.background || "bg-neon-city";
}

function getEquippedProjectileId() {
    return profileCustomization.projectile || "projectile-blue";
}

function getPlayerSkinPalette() {
    const skinId = getEquippedSkinId();

    if (skinId === "skin-royal") {
        return {
            body: "#ffd86b",
            bodyGlow: "rgba(255, 216, 107, 0.72)",
            face: "#fff7d6",
            cape: "rgba(92, 54, 14, 0.96)",
            staff: "#fff0b8",
            orb: "#ffffff",
            orbGlow: "rgba(255, 216, 107, 0.9)"
        };
    }

    if (skinId === "skin-void") {
        return {
            body: "#b56dff",
            bodyGlow: "rgba(181, 109, 255, 0.72)",
            face: "#f4e8ff",
            cape: "rgba(28, 14, 56, 0.98)",
            staff: "#d9b4ff",
            orb: "#73ecff",
            orbGlow: "rgba(115, 236, 255, 0.9)"
        };
    }

    return {
        body: "#6ee6ff",
        bodyGlow: "rgba(110, 230, 255, 0.65)",
        face: "#f7f0ff",
        cape: "rgba(39, 33, 79, 0.96)",
        staff: "#d9c9ff",
        orb: "#ffdf6e",
        orbGlow: "rgba(255, 223, 110, 0.85)"
    };
}

function getProjectileCosmetic() {
    const projectileId = getEquippedProjectileId();

    if (projectileId === "projectile-gold") {
        return {
            color: "#ffd86b",
            glow: "rgba(255, 216, 107, 0.9)",
            trail: "rgba(255, 216, 107, 0.28)"
        };
    }

    if (projectileId === "projectile-purple") {
        return {
            color: "#b56dff",
            glow: "rgba(181, 109, 255, 0.9)",
            trail: "rgba(181, 109, 255, 0.28)"
        };
    }

    return {
        color: "#59dfff",
        glow: "rgba(89, 223, 255, 0.9)",
        trail: "rgba(89, 223, 255, 0.28)"
    };
}

function getGameBackgroundPalette() {
    const backgroundId = getEquippedBackgroundId();

    if (backgroundId === "bg-void") {
        return {
            top: "#090718",
            bottom: "#02020a",
            glowA: "rgba(181, 109, 255, 0.18)",
            glowB: "rgba(70, 30, 140, 0.14)",
            grid: "rgba(181, 109, 255, 0.12)",
            particles: "rgba(181, 109, 255, 0.35)"
        };
    }

    if (backgroundId === "bg-forge") {
        return {
            top: "#1c0e08",
            bottom: "#05020a",
            glowA: "rgba(255, 112, 55, 0.18)",
            glowB: "rgba(255, 216, 107, 0.10)",
            grid: "rgba(255, 112, 55, 0.12)",
            particles: "rgba(255, 216, 107, 0.32)"
        };
    }

    return {
        top: "#0e1024",
        bottom: "#070711",
        glowA: "rgba(80, 57, 160, 0.25)",
        glowB: "rgba(69, 215, 255, 0.10)",
        grid: "rgba(156, 119, 255, 0.10)",
        particles: "rgba(115, 236, 255, 0.30)"
    };
}

function updateProfileScore() {
    if (!profileBestScoreText) {
        return;
    }

    profileBestScoreText.textContent = Math.floor(bestScore || 0).toLocaleString("fr-FR");
}

const profileSkinImageCache = {};

function getProfileItemById(category, itemId) {
    const items = PROFILE_ITEMS[category] || [];
    return items.find((item) => item.id === itemId) || null;
}

function getEquippedSkinItem() {
    return getProfileItemById("skins", profileCustomization.skin || "skin-default");
}

function preloadProfileSkinImages() {
    const skins = PROFILE_ITEMS.skins || [];

    for (const skin of skins) {
        if (!skin.gameImage) {
            continue;
        }

        if (profileSkinImageCache[skin.id]) {
            continue;
        }

        const image = new Image();
        image.src = skin.gameImage;

        profileSkinImageCache[skin.id] = image;
    }
}

function getEquippedPlayerSkinImage() {
    const skin = getEquippedSkinItem();

    if (!skin || !skin.gameImage) {
        return null;
    }

    const image = profileSkinImageCache[skin.id];

    if (!image || !image.complete || image.naturalWidth === 0) {
        return null;
    }

    return image;
}
