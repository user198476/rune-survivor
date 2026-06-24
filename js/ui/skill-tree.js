function renderSkillTree() {
    updateMetaCurrencyDisplays();
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
            const cost = getSkillCost(node);
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
    skillTreeOverlay.classList.remove("hidden");
    state = "skilltree";
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
