function renderSkillTree() {
    clampSelectedSkillTier();
    updateSkillTierHeader();
    updateMetaCurrencyDisplays();
    renderSkillTotalStats();
    updateSkillStatsPopoverVisibility();
    skillTreeBranches.className = "skill-tree-branches skill-tree-map";
    skillTreeBranches.innerHTML = "";
    const orderedBranches = ["damage", "speed", "defense"];
    const origin = SKILL_TREE_LAYOUT.origin;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "skill-map-svg");
    svg.setAttribute("viewBox", `0 0 100 ${SKILL_TREE_MAP_HEIGHT}`);
    svg.setAttribute("preserveAspectRatio", "none");
    skillTreeBranches.appendChild(svg);
    const totalBought = SKILL_TREE.reduce((sum, branch) => {
        return sum + branch.nodes.reduce((branchSum, node) => {
            return branchSum + getSkillLevel(node.id);
        }, 0);
    }, 0);
    const originElement = document.createElement("div");
    originElement.className = "skill-map-origin";
    originElement.style.left = `${origin.x}%`;
    /* on aligne visuellement le CENTRE de la boule avec le point de convergence */
    originElement.style.top = `${origin.y - 40}px`;
    originElement.innerHTML = `
        <div class="skill-map-origin-core">
            <span>✦</span>
        </div>
        <div class="skill-map-origin-value">${totalBought}</div>
        <div class="skill-map-origin-title">NOYAU RUNIQUE</div>
    `;
    skillTreeBranches.appendChild(originElement);
    for (const branchId of orderedBranches) {
        const branch = SKILL_TREE.find((entry) => entry.id === branchId);
        if (!branch) {
            continue;
        }
        const layout = SKILL_TREE_LAYOUT.branches[branch.id];
        if (!layout) {
            continue;
        }
        const {
            totalLevels,
            maxLevels
        } = getBranchProgress(branch);
        const branchLabel = document.createElement("div");
        branchLabel.className = `skill-map-branch-label ${branch.className}`;
        branchLabel.style.left = `${layout.label.x}%`;
        branchLabel.style.top = `${layout.label.y}px`;
        branchLabel.innerHTML = `
            <span>${branch.label}</span>
            <strong>${totalLevels} / ${maxLevels}</strong>
        `;
        skillTreeBranches.appendChild(branchLabel);
        let previousPoint = origin;
        branch.nodes.forEach((node, index) => {
            const point = layout.nodes[index];
            const activeLink = getBranchNodeActivation(branch, node, index);
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", buildSkillLinkPath(previousPoint, point, layout.bend));
            path.setAttribute("class", `skill-map-link ${branch.className} ${activeLink ? "active" : "inactive"}`);
            svg.appendChild(path);
            previousPoint = point;
        });
        branch.nodes.forEach((node, index) => {
            const point = layout.nodes[index];
            const nodeState = getSkillNodeState(node);
            let visualState = "locked";
            if (nodeState.maxed) {
                visualState = "maxed";
            } else if (nodeState.available) {
                visualState = "available";
            } else if (nodeState.unlocked) {
                visualState = "unlocked";
            }
            const cost = getSkillCost(node, selectedSkillTier);
            const buttonLabel = nodeState.maxed ? "MAX" : nodeState.available ? `Acheter ${cost}` : nodeState.requirementsMet ? `${cost} pièces` : "Verrouillé";
            const buttonClass = nodeState.available ? `skill-map-buy ${branch.className}` : "skill-map-buy disabled";
            const nodeElement = document.createElement("div");
            nodeElement.className = `skill-map-node ${branch.className} ${visualState} card-${point.card}`;
            nodeElement.style.left = `${point.x}%`;
            nodeElement.style.top = `${point.y}px`;
            nodeElement.style.setProperty("--card-offset-y", `${point.cardOffsetY || 0}px`);
            nodeElement.innerHTML = `
                <div class="skill-map-node-core">
                    <span>${node.nodeIcon || branch.icon}</span>
                </div>

                <div class="skill-map-node-level">${nodeState.currentLevel}/${node.maxLevel}</div>

                <div class="skill-map-card ${branch.className} card-${point.card}">
                    <div class="skill-map-card-title">${node.title}</div>
                    <div class="skill-map-card-desc">${node.desc}</div>

                    <button class="${buttonClass}" ${nodeState.available ? "" : "disabled"}>
                        ${buttonLabel}
                    </button>

                    ${
                        !nodeState.requirementsMet
                            ? `<div class="skill-map-card-lock">Prérequis non remplis</div>`
                            : ""
                    }
                </div>
            `;
            const button = nodeElement.querySelector("button");
            if (nodeState.available) {
                button.addEventListener("click", (event) => {
                    event.stopPropagation();
                    event.currentTarget.blur();
                    buySkill(node.id);
                });
            }
            skillTreeBranches.appendChild(nodeElement);
        });
    }
}

function getBranchProgress(branch) {
    const totalLevels = branch.nodes.reduce((sum, node) => sum + getSkillLevel(node.id), 0);
    const maxLevels = branch.nodes.reduce((sum, node) => sum + node.maxLevel, 0);
    return {
        totalLevels,
        maxLevels
    };
}

function getSkillNodeState(node) {
    const currentLevel = getSkillLevel(node.id);
    const maxed = currentLevel >= node.maxLevel;
    const requirementsMet = areRequirementsMet(node);
    const affordable = metaCoins >= getSkillCost(node);
    const available = !maxed && requirementsMet && affordable;
    const unlocked = requirementsMet;
    return {
        currentLevel,
        maxed,
        requirementsMet,
        affordable,
        available,
        unlocked
    };
}

function getBranchNodeActivation(branch, node, index) {
    const state = getSkillNodeState(node);
    if (state.currentLevel > 0 || state.maxed) {
        return true;
    }
    if (index === 0 && state.requirementsMet) {
        return true;
    }
    if (index > 0) {
        const previousNode = branch.nodes[index - 1];
        if (getSkillLevel(previousNode.id) > 0 && state.requirementsMet) {
            return true;
        }
    }
    return false;
}

function buildSkillLinkPath(from, to, bend = 0) {
    const dy = from.y - to.y;
    const c1x = from.x + bend;
    const c1y = from.y - dy * 0.32;
    const c2x = to.x + bend;
    const c2y = to.y + dy * 0.32;
    return `
        M ${from.x} ${from.y}
        C ${c1x} ${c1y},
          ${c2x} ${c2y},
          ${to.x} ${to.y}
    `;
}

function openSkillTree(fromState = state) {
    skillTreeReturnState = fromState;
    if (fromState === "menu") {
        mainMenuOverlay.classList.add("hidden");
    }
    if (fromState === "paused") {
        pauseOverlay.classList.add("hidden");
    }
    if (fromState === "gameover") {
        gameOverOverlay.classList.add("hidden");
    }
    closeSkillStatsPopover();
    
    skillTreeOverlay.classList.remove("hidden");
    state = "skilltree";

    clampSelectedSkillTier();
    renderSkillTree();
}

function closeSkillTree() {
    skillTreeOverlay.classList.add("hidden");
    state = skillTreeReturnState;
    if (skillTreeReturnState === "menu") {
        mainMenuOverlay.classList.remove("hidden");
    }
    if (skillTreeReturnState === "paused") {
        pauseOverlay.classList.remove("hidden");
    }
    if (skillTreeReturnState === "gameover") {
        gameOverOverlay.classList.remove("hidden");
    }
}

function updateSkillTierHeader() {
    const highestUnlockedTier = getHighestUnlockedSkillTier();
    const nextTier = highestUnlockedTier + 1;

    if (selectedSkillTier <= 0) {
        skillTierLabel.textContent = "Palier de base";
    } else {
        skillTierLabel.textContent = `Palier ${selectedSkillTier}`;
    }

    if (selectedSkillTier <= highestUnlockedTier) {
        if (nextTier <= MAX_VISIBLE_SKILL_TIER) {
            const requiredScore = getSkillTierUnlockBestScore(nextTier);

            skillTierStatus.textContent =
                `Prochain palier : ${requiredScore.toLocaleString("fr-FR")} score`;
        } else {
            skillTierStatus.textContent = "Tous les paliers sont débloqués";
        }
    }

    skillTierPreviousButton.disabled = selectedSkillTier <= 0;
    skillTierNextButton.disabled = selectedSkillTier >= highestUnlockedTier;
}

function selectPreviousSkillTier() {
    if (selectedSkillTier <= 0) {
        return;
    }

    selectedSkillTier -= 1;
    renderSkillTree();
}

function selectNextSkillTier() {
    const highestUnlockedTier = getHighestUnlockedSkillTier();

    if (selectedSkillTier >= highestUnlockedTier) {
        return;
    }

    selectedSkillTier += 1;
    renderSkillTree();
}

function formatPermanentPercent(value) {
    return `${Math.round(value * 100)}%`;
}

function formatPermanentDecimal(value, decimals = 1) {
    return Number(value).toFixed(decimals).replace(".", ",");
}

function getTotalBoughtSkillLevels() {
    let total = 0;
    const highestUnlockedTier = getHighestUnlockedSkillTier();

    for (let tier = 0; tier <= highestUnlockedTier; tier++) {
        for (const branch of SKILL_TREE) {
            for (const node of branch.nodes) {
                total += getSkillLevel(node.id, tier);
            }
        }
    }

    return total;
}

function getTotalMaxSkillLevelsForCompletedTiers() {
    let total = 0;
    const highestUnlockedTier = getHighestUnlockedSkillTier();

    for (let tier = 0; tier <= highestUnlockedTier; tier++) {
        for (const branch of SKILL_TREE) {
            for (const node of branch.nodes) {
                total += node.maxLevel;
            }
        }
    }

    return total;
}

function renderSkillTotalStats() {
    if (!skillTreeTotalStats) {
        return;
    }

    const bonuses = getPermanentBonuses();

    const effectiveFireRateReduction = Math.min(0.65, bonuses.fireRateReduction);

    const totalBought = getTotalBoughtSkillLevels();
    const totalPossible = getTotalMaxSkillLevelsForCompletedTiers();
    const highestUnlockedTier = getHighestUnlockedSkillTier();

    skillTreeTotalStats.innerHTML = `
        <div class="skill-total-stats-title">Stats permanentes cumulées</div>

        <div class="skill-total-stats-summary">
            <span>Niveaux achetés : <strong>${totalBought}</strong></span>
            <span>Palier max : <strong>${getSkillTierName(highestUnlockedTier)}</strong></span>
        </div>

        <div class="skill-total-stats-grid">
            <div>
                <span>Dégâts</span>
                <strong>+${formatPermanentPercent(bonuses.damagePercent)}</strong>
            </div>

            <div>
                <span>Cadence</span>
                <strong>-${formatPermanentPercent(effectiveFireRateReduction)}</strong>
            </div>

            <div>
                <span>Vitesse projectiles</span>
                <strong>+${formatPermanentPercent(bonuses.projectileSpeedPercent)}</strong>
            </div>

            <div>
                <span>PV max</span>
                <strong>+${Math.round(bonuses.maxHpFlat)}</strong>
            </div>

            <div>
                <span>Soin trousses</span>
                <strong>+${formatPermanentPercent(bonuses.healKitPowerPercent || 0)}</strong>
            </div>

            <div>
                <span>Bouclier</span>
                <strong>+${formatPermanentDecimal(bonuses.shieldDurationFlat)}s</strong>
            </div>

            <div>
                <span>Vitesse</span>
                <strong>+${formatPermanentPercent(bonuses.moveSpeedPercent)}</strong>
            </div>

            <div>
                <span>Aspiration XP</span>
                <strong>+${Math.round(bonuses.magnetFlat)}</strong>
            </div>

            <div>
                <span>Gain XP</span>
                <strong>+${formatPermanentPercent(bonuses.xpGainPercent)}</strong>
            </div>
        </div>
    `;
}

function updateSkillStatsPopoverVisibility() {
    if (!skillTreeTotalStats || !skillTreeStatsToggleButton) {
        return;
    }

    skillTreeTotalStats.classList.toggle("hidden", !skillStatsPopoverOpen);
    skillTreeStatsToggleButton.classList.toggle("active", skillStatsPopoverOpen);
}

function toggleSkillStatsPopover() {
    skillStatsPopoverOpen = !skillStatsPopoverOpen;
    updateSkillStatsPopoverVisibility();
}

function closeSkillStatsPopover() {
    skillStatsPopoverOpen = false;
    updateSkillStatsPopoverVisibility();
}
