function isPauseKey(event) {
    return (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key.toLowerCase() === "p"
    );
}

function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (isPauseKey(event)) {
        event.preventDefault();

        if (!event.repeat) {
            togglePause();
        }

        return;
    }

    if (state === "playing") {
        keys.add(key);
    }

    if (state === "levelup") {
        if (event.key === "1") chooseUpgrade(0);
        if (event.key === "2") chooseUpgrade(1);
        if (event.key === "3") chooseUpgrade(2);
        if (event.key === "4") chooseUpgrade(3);
        if (event.key === "5") chooseUpgrade(4);
    }

    if (state === "gameover" && key === "r") {
        startGame();
    }
}

function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());

    if (event.key === " ") {
        keys.delete(" ");
    }
}

function bindInputEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    window.addEventListener("blur", () => {
        clearInputKeys();

        if (state === "playing") {
            pauseGame();
        }
    });

    document.addEventListener("visibilitychange", () => {
        clearInputKeys();

        if (document.hidden && state === "playing") {
            pauseGame();
        }
    });

    window.addEventListener("mouseleave", () => {
        clearInputKeys();
    });
}