let mainCanvas = document.createElement("canvas");
document.body.appendChild(mainCanvas);
mainCanvas.width = window.innerWidth;
mainCanvas.height = window.innerHeight;
let mainContext = mainCanvas.getContext("2d");

let backgroundCanvas = document.createElement("canvas");
document.body.appendChild(backgroundCanvas);
backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;
let backgroundContext = backgroundCanvas.getContext("2d");

let mousePos = new Point();
window.silentErrors = false;
const allowTouchEvents = false;

addEventListener("resize", function () {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    clearAll();
    drawBackground(backgroundContext);
    draw(mainContext);
});

addEventListener("DOMContentLoaded", function () {
    let isHoldClick = false;
    let timeout = null;

    if (!allowTouchEvents) {
        mainCanvas.addEventListener("click", function (event) {
            if (isHoldClick) {
                isHoldClick = false;
                return;
            }
            let position = new Point(event.clientX, event.clientY);
            if (window.click && typeof window.click === "function") window.click(position);
        });

    } else {
        mainCanvas.addEventListener("touchend", function (event) {
            if (!event.touches.length) return;
            if (isHoldClick) {
                isHoldClick = false;
                return;
            }
            let position = new Point(event.touches[0].clientX, event.touches[0].clientX);
            if (window.click && typeof window.click === "function") window.click(position);
        });
    }

    if (!allowTouchEvents) {
        mainCanvas.addEventListener("mousedown", function (event) {
            timeout = setTimeout(function () {
                isHoldClick = true;
                let position = new Point(event.clientX, event.clientY);
                if (window.rightClick && typeof window.rightClick === "function") window.rightClick(position);
            }, 500);
        });
    } else {
        mainCanvas.addEventListener("touchstart", function (event) {
            if (!event.touches.length) return;
            timeout = setTimeout(function () {
                isHoldClick = true;
                let position = new Point(event.touches[0].clientX, event.touches[0].clientY);
                if (window.rightClick && typeof window.rightClick === "function") window.rightClick(position);
            }, 500);
        });
    }

    if (!allowTouchEvents) {
        mainCanvas.addEventListener("mouseup", function (event) {
            if (timeout) clearTimeout(timeout);
            timeout = null;
        });
    } else {
        mainCanvas.addEventListener("touchend", function (event) {
            if (timeout) clearTimeout(timeout);
            timeout = null;
        });
    }

    if (!allowTouchEvents) {
        mainCanvas.addEventListener("contextmenu", function (event) {
            event.preventDefault();

            let position = new Point(event.clientX, event.clientY);
            if (window.rightClick && typeof window.rightClick === "function") window.rightClick(position);
        });
    } else {
        //No equivalent event. Using touchstart with 500ms hold as replacement
    }


    if (!allowTouchEvents) {
        mainCanvas.addEventListener("mousemove", function (event) {
            mousePos.x = event.x;
            mousePos.y = event.y
        });
    } else {
        mainCanvas.addEventListener("touchmove", function (event) {
            if (!event.touches.length) return;
            mousePos.x = event.touches[0].clientX;
            mousePos.y = event.touches[0].clientY;
        });
    }

    if (window.init && typeof window.init === "function") window.init();
    if (window.background && typeof window.background === "function") window.background(backgroundContext);
    if (window.draw && typeof window.draw === "function") window.draw(mainContext, mousePos);

    let timer = new GameTick({ debug: true, tps: 60 });
    window.timer = timer;
    timer.addEventListener("gameTick", function (event) {
        if (window.draw && typeof window.draw === "function") {
            window.clear();
            window.draw(mainContext, mousePos);
        }
    });
    timer.startGameTick();

});

window.drawBackground = function () {
    if (window.background && typeof window.background === "function") window.background(backgroundContext);
}

window.clear = function () {
    mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
};
window.clearBackground = function () {
    backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
};

window.clearAll = function () {
    clear();
    clearBackground();
};