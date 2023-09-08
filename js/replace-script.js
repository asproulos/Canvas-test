if (true) {
    addEventListener("DOMContentLoaded", function (event) {
        let vectorsScript = `
class Point {
    x = 0;
    y = 0;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        if (typeof x !== "number" || isNaN(x)) x = 0;
        if (typeof y !== "number" || isNaN(y)) y = 0;

        this.x = x;
        this.y = y;
    }

    /**
     * @param {Point} point 
     * @returns {boolean}
     */
    equals = (point) => {
        if (!point || !(point instanceof Point)) return false;
        return (this.x === point.x) && (this.y === point.y);
    }

    isNaN = () => {
        return isNaN(this.x) || isNaN(this.y);
    }

    toString = () => {
        return \`[\${this.x}, \${this.y}]\`;
    }

    /**
     * @param {CanvasRenderingContext2D} context2D 
     */
    draw(context2D) {
        if (!context2D) context2D = context;
        if (!context2D) context2D = window.context;
        if (!context2D) return;

        let posX = this.x + (context2D.lineWidth / 2);
        let posY = this.y + (context2D.lineWidth / 2);
        const circle = new Path2D();
        circle.arc(posX, posY, context2D.lineWidth, 0, 2 * Math.PI);

        context2D.fill(circle);
        context2D.stroke();
    }

    /**
     * Returns a copy of the point
     * @returns {Point}
     */
    copy = () => {
        return new Point(this.x, this.y);
    }
}

class Vector {
    /** @type {Point} */
    start = null;
    /** @type {Point} */
    end = null;

    /**
     * @param {Point} start 
     * @param {Point} end 
     */
    constructor(start, end) {
        if (!(start instanceof Point)) start = new Point();
        if (!(end instanceof Point)) end = new Point();
        if (!window.silentErrors && start.equals(end)) console.warn("Vector is length 0. Angle is NaN. Change start or end point to fix this.");

        this.start = start.copy();
        this.end = end.copy();
    }

    /**
     * @param {Point} point 
     */
    setStart = (point) => {
        if (!point) return;
        if (!window.silentErrors && this.end.equals(point)) console.warn("Vector is length 0. Angle is NaN. Change start or end point to fix this.");

        this.start = point;
    }

    /**
     * @param {Point} point 
     */
    setEnd = (point) => {
        if (!point) return;
        if (!window.silentErrors && this.start.equals(point)) console.warn("Vector is length 0. Angle is NaN. Change start or end point to fix this.");

        this.end = point.copy();
    }

    /**
     * @returns {number}
     */
    length = () => {
        let length = Math.sqrt(Math.pow((this.end.y - this.start.y), 2) + Math.pow((this.end.x - this.start.x), 2))
        return length;
    }

    /**
     * Changes the end Point of the Vector so that the length is equal to the one requested.
     * @param {number} newLength 
     * @returns {number} the new length
     */
    setLength = (newLength) => {
        if (!newLength) return this.length();

        let isNegative = Math.sign(newLength) ? Math.sign(newLength) : 1;

        let baseLength = Math.abs(newLength * Math.cos(this.angle()));
        let directionX = Math.sign(this.end.x - this.start.x);
        directionX = directionX * isNegative;
        let newX = this.start.x + (directionX * baseLength);

        let heightLength = Math.abs(newLength * Math.sin(this.angle()));
        let directionY = Math.sign(this.end.y - this.start.y);
        directionY = directionY * isNegative;
        let newY = this.start.y + (directionY * heightLength);

        this.end.x = newX;
        this.end.y = newY;

        return this.length();
    }

    /**
     * Returns the angle (in radians) of vector relative to the vector parallel to the x axis. Angle is measured from the x axis.
     * Counterclockwise => positive (up to Math.PI rad), clockwise => negative (down to -Math.PI rad)
     * @param {Vector} vectorA
     * @param {Vector} vectorB
     * @returns {number}
     */
    angle = (vectorA, vectorB) => {
        if (!vectorA) vectorA = new Vector(new Point(0, 0), new Point(1, 0));
        if (!vectorB) vectorB = this;

        let ADotB = vectorB.dot(vectorA);
        let angle = Math.acos(ADotB / (vectorA.length() * vectorB.length()));

        angle = Math.sign(((vectorA.end.y - vectorA.start.y) - (vectorB.end.y - vectorB.start.y))) * angle;

        return angle;
    }

    /**
     * Changes the end Point of the Vector so that the angle is equal to the one requested.
     * @param {number} newAngle 
     * @returns {number} The new angle in radians
     */
    setAngle = (newAngle) => {
        if (!newAngle && newAngle !== 0) return this.angle();

        let baseLength = this.length() * Math.cos(newAngle);
        let newX = this.start.x + baseLength;

        let heightLength = this.length() * Math.sin(newAngle);
        let newY = this.start.y - heightLength;

        this.end.x = newX;
        this.end.y = newY;

        return this.angle();
    }

    /**
     * Get the dot product of two vectors.
     * @param {Vector} vectorA
     * @returns {number}
     */
    dot = (vectorA) => {
        if (!vectorA) return NaN;

        let aX = (vectorA.end.x - vectorA.start.x);
        let aY = (vectorA.end.y - vectorA.start.y);
        let bX = (this.end.x - this.start.x);
        let bY = (this.end.y - this.start.y);
        let product = (aX * bX) + (aY * bY);

        return product;
    }

    /**
     * Displace current vector so that it starts on the provided Point. Length and angle remain the same.
     * @param {Point} point 
     */
    moveStartTo = (point) => {
        if (!point) point = new Point(0, 0);
        // if (this.start.isNaN()) console.log(this)

        let diffX = this.end.x - this.start.x;
        let diffY = this.end.y - this.start.y;

        this.start.x = point.x;
        this.start.y = point.y;
        this.end.x = this.start.x + diffX;
        this.end.y = this.start.y + diffY;
    }

    /**
     * Adds a vector to the currect vector.
     * @param {Vector} vectorA 
     */
    add = (vectorA) => {
        if (!(vectorA instanceof Vector)) return;

        let copyA = vectorA.copy();
        copyA.moveStartTo(this.end);
        this.setEnd(copyA.end);
    }

    /**
     * Gets the point where two vectors intersect. If vectors are parallel null is returned instead.
     * @param {Vector} vectorA 
     * @param {boolean} extend If true extends the vectors infinitely before checking for the intersection 
     * @returns {Point | null}
     */
    findIntersection = (vectorA, extend) => {
        if (!vectorA) return null;
        if (vectorA.parallel(this)) return null;
        let vectorB = this;

        let intersection = null;
        // Error margin allows to include decimal places in the rounding.
        // Rounding is necessary because while 400 and 400.000000000000003 are technically different they should be treated as equal.
        // Error margin helps with the case of 50.4 and 49.6
        let errorMargin = 10;
        // If one of the vectors is parallel to the y axis then we get an "a" of Infinity so we handle it as a special case.
        // Also, being parallel to the y axis means that x = constant so we use that to our advantage.
        if ((Math.round(vectorB.end.x * errorMargin) - Math.round(vectorB.start.x * errorMargin)) !== 0 &&
            (Math.round(vectorA.end.x * errorMargin) - Math.round(vectorA.start.x * errorMargin)) !== 0) {
            // With 2 points we can create a line with an equation of this type: y=a*x + b
            // So for each vector we have:
            let a1 = (vectorB.end.y - vectorB.start.y) / (vectorB.end.x - vectorB.start.x);
            let b1 = vectorB.start.y - (a1 * vectorB.start.x);

            let a2 = (vectorA.end.y - vectorA.start.y) / (vectorA.end.x - vectorA.start.x);
            let b2 = vectorA.start.y - (a2 * vectorA.start.x);

            let intersectionX = (b1 - b2) / (a2 - a1);
            let intersectionY = (a1 * intersectionX) + b1

            intersection = new Point(intersectionX, intersectionY)
        } else {
            let verticalVector = null;
            let otherVector = null;
            if ((Math.round(vectorA.end.x * errorMargin) - Math.round(vectorA.start.x * errorMargin)) !== 0 === 0) {
                verticalVector = vectorA;
                otherVector = vectorB;
            }
            else {
                verticalVector = vectorB;
                otherVector = vectorA;
            }
            let intersectionX = verticalVector.start.x;

            let a = (otherVector.end.y - otherVector.start.y) / (otherVector.end.x - otherVector.start.x);
            let b = otherVector.start.y - (a * otherVector.start.x);
            let intersectionY = (a * intersectionX) + b;

            intersection = new Point(intersectionX, intersectionY)
        }

        if (!extend) {
            let xyCoordsA = vectorA.getXYOrdered();
            let isContainedA = (xyCoordsA.smallX <= intersection.x && intersection.x <= xyCoordsA.bigX) &&
                (xyCoordsA.smallY <= intersection.y && intersection.y <= xyCoordsA.bigY);

            let xyCoordsB = vectorB.getXYOrdered();
            let isContainedB = (xyCoordsB.smallX <= intersection.x && intersection.x <= xyCoordsB.bigX) &&
                (xyCoordsB.smallY <= intersection.y && intersection.y <= xyCoordsB.bigY);

            // if extend == false then the intersection is only valid if it is contained in both vectors
            if (!isContainedA || !isContainedB) {
                intersection = null;
            }
        }

        return intersection;
    }

    /**
     * @returns {{
     *  smallX: number,
     *  bigX: number,
     *  smallY: number,
     *  bigY: number
     * }}
     */
    getXYOrdered = () => {
        let result = {
            smallX: null,
            bigX: null,
            smallY: null,
            bigY: null
        }
        // find X
        if (this.start.x >= this.end.x) {
            result.bigX = this.start.x;
            result.smallX = this.end.x;
        } else {
            result.smallX = this.start.x;
            result.bigX = this.end.x;
        }

        // find Y
        if (this.start.y >= this.end.y) {
            result.bigY = this.start.y;
            result.smallY = this.end.y;
        } else {
            result.smallY = this.start.y;
            result.bigY = this.end.y;
        }

        return result;
    }

    /**
     * Is true if the vectors are EXACTLY the same (same start and end).
     * If @argument similar is true then returns true if the vectors have the same angle and length (if they had the same start they would also have the same end).
     * @param {Vector} vectorA 
     * @param {boolean} similar 
     * @returns {boolean}
     */
    equals = (vectorA, similar) => {
        if (!vectorA) return false;

        if (!similar) return (vectorA.start.equals(this.start) && vectorA.end.equals(this.end));
        else return (vectorA.length() === this.length() && vectorA.angle() === this.angle());
    }

    /**
     * Is true if the vectors are parallel.
     * @param {Vector} vectorA 
     * @returns {boolean}
     */
    parallel = (vectorA) => {
        if (!vectorA) return false;

        return (vectorA.angle() === this.angle());
    }



    toString = () => {
        return \`{start: \${this.start.toString()}, end: \${this.end.toString()}}\`;
    }

    /**
     * Returns a copy of the vector
     * @returns {Vector}
     */
    copy = () => {
        return new Vector(this.start.copy(), this.end.copy());
    }

    /**
     * Draws the vector on a 2D canvas context
     * @param {CanvasRenderingContext2D} context2D 
     */
    draw(context2D) {
        if (!context2D) context2D = context;
        if (!context2D) context2D = window.context;
        if (!context2D) return;

        const line = new Path2D();
        line.moveTo(this.start.x, this.start.y);
        line.lineTo(this.end.x, this.end.y);

        context2D.stroke(line);
    }
}

class VectorPath {
    /** @type {Vector} */
    #direction = null;
    #currentIndex = 0;
    /** @type {number} */
    #stepSize = 10;
    /** @type {Point} */
    publicStep = new Point();

    /**
     * @param {Array<Point | Vector> | Point | Vector | null} array 
     */
    constructor(array) {
        /** @type {Array<Point>} */
        this.Points = [];
        if (array) {
            this.add(array);
        }
        if (this.Points.length > 1) {
            this.#direction = new Vector(this.Points[0], this.Points[1]);
            this.#direction.setLength(this.#stepSize);
        }
    }

    /**
     * @param {Array<Point | Vector> | Point | Vector | null} item 
     */
    add = (input) => {
        if (input instanceof Array) {
            for (let i = 0; i < input.length; i++) {
                let item = input[i];
                this.#insertGeneric(item)
            }
        } else {
            this.#insertGeneric(input)
        }

        if (!this.#direction && this.Points.length > 1) {
            this.#direction = new Vector(this.Points[this.#currentIndex], this.Points[this.#currentIndex + 1]);
            this.#direction.setLength(this.#stepSize);
        }
    }

    /**
     * @param {number} position 
     */
    setPosition = (position) => {
        if (position < 0 || this.Points.length < position) {
            console.warn(\`Position "\${position}" is not valid.\`);
            return;
        }

        this.#currentIndex = Math.round(position);
    }

    /**
     * @param {number} size 
     */
    setStep = (size) => {
        if (typeof size !== "number" || size < 0) size = 10;

        this.#stepSize = size;
    }

    /**
     * Advances the current point and then returns it.
     * @returns {Point}
     */
    step = () => {
        if (!this.#direction) return this.publicStep;
        let endPoint = this.getNextPoint();
        let nextIndex = this.getNextIndex();

        this.#direction.moveStartTo(this.#direction.end);

        let toNextVector = new Vector(this.#direction.start, endPoint);
        // let angle = toNextVector.angle(this.#direction);
        // if ((Math.PI - 0.2) < angle && angle < (Math.PI + 0.2)) {
        if (this.#direction.dot(toNextVector) <= 0) {
            this.#direction.moveStartTo(endPoint);
            this.#currentIndex = nextIndex;
            this.#direction.setEnd(this.getNextPoint());
            this.#direction.setLength(this.#stepSize);
        }

        this.publicStep.x = this.#direction.start.x;
        this.publicStep.y = this.#direction.start.y;
        return this.publicStep;
    }

    /**
     * Returns the current position in the path.
     * @returns {Point} 
     */
    getCurrentStep = () => {
        return this.publicStep;
    }

    /**
     * @returns {Point}
     */
    getNextPoint = () => {
        let nextPoint = this.Points[this.#currentIndex + 1];
        if (nextPoint === undefined) {
            nextPoint = this.Points[0];
        }
        return nextPoint;
    }

    /**
     * @returns {number}
     */
    getNextIndex = () => {
        let nextIndex = this.#currentIndex + 1;
        if (this.Points[nextIndex] === undefined) {
            nextIndex = 0;
        }
        return nextIndex;
    }

    /**
     * @param {Point | Vector} item 
     */
    #insertGeneric = (item) => {
        if (item instanceof Vector) {
            this.Points.push(item.start);
            this.Points.push(item.end);
        } else if (item instanceof Point) {
            this.Points.push(item);
        }
    }
}
        `;
        let gameTimerScript = `
const DEFAULT_TPS = 30;
// Global variables
class GameTick {
    #callBackArraysObject = {
        gameTickStart: [],
        gameTickStop: [],
        gameTick: []
    };
    #intervalID = null;
    #finishedFrame = true;
    /**
     * @param {{
     *  debug: boolean
     *  tps: number
     * }} options
     */
    constructor(options) {
        this.debug = options.debug === undefined ? false : options.debug;
        // should not have to do *options = this.#validateValues(options);*
        // since js passes references to the object thus changing the original 
        this.#validateValues(options);

        this.tps = options.tps;
        this.intervalPerFrame = this.tpsIntervalTwoWayTransformer(this.tps);

    }

    get getDebug() {
        return this.debug;
    }

    get getTps() {
        return this.tps
    }

    get getIntervalPerFrame() {
        return this.intervalPerFrame;
    }

    /**
     * Turns the tps into miliseconds for use with Intervals
     * Calculates how many frames in a second based on the interval between them
     * The calculation is the same both ways
     * @param {number} desiredTps 
     * @returns {number} the miliseconds between frames
     */
    tpsIntervalTwoWayTransformer(value) {
        let second = 1000;
        return Math.round(second / value);
    }

    /**
     * @param {{
     *  debug: *
     *  tps: *
     *  intervalPerFrame: *
     * }} options
     * @return {{
     *  debug: boolean
     *  tps: number
     *  intervalPerFrame: number
     * }}
     */
    #validateValues(options) {
        if (typeof options.debug !== "boolean") {
            options.debug = false;
        }

        if (typeof options.tps !== "number") {
            options.tps = DEFAULT_tPS;
        }
        if (options.tps < 0) {
            options.tps = 1;
        }
    }

    /**
     * 
     * @param {"gameTick" | "gameTickStart" | "gameTickStop"} on 
     * @param {CallableFunction} callback 
     */
    addEventListener(on, callback) {
        if (this.#callBackArraysObject[on] === undefined) {
            console.error("No such event type.");
            return;
        }
        if (typeof callback !== "function") {
            console.error("Recieved callback that is not a function.");
            return;
        }
        this.#callBackArraysObject[on].push(callback);
    }

    startGameTick() {
        let eventData = { lalakis: "start" };
        // using arrow functions here to preserve the scope of *this*
        this.#callBackArraysObject.gameTickStart.forEach((callback) => {
            callback(eventData);
        });
        this.#intervalID = setInterval(this.doGameTick.bind(this), this.intervalPerFrame);
    }

    stopGameTick() {
        let eventData = { lalakis: "stop" };
        // using arrow functions here to preserve the scope of *this*
        this.#callBackArraysObject.gameTickStop.forEach((callback) => {
            callback(eventData);
        });
        clearInterval(this.#intervalID);
    }

    doGameTick() {
        if (!this.#finishedFrame) {
            console.warn("Tried to calculate frame before previous one is complete! Is the game lagging?")
            return;
        }
        this.#finishedFrame = false;

        let eventData = { marika: "123" };
        // using arrow functions here to preserve the scope of *this*
        try {
            this.#callBackArraysObject.gameTick.forEach((callback) => {
                callback(eventData);
            });
        } catch (error) {
            console.error(error)
        }

        this.#finishedFrame = true;
    }
}
        `;
        let eventsScript = `
/** @type {HTMLCanvasElement} */
let canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let context = canvas.getContext("2d");
context.strokeStyle = "black";
context.fillStyle = "red";
context.lineWidth = 2;

window.canvas = canvas;
window.context = context;
window.silentErrors = false;

addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
});

addEventListener("DOMContentLoaded", function () {
    let isHoldClick = false;
    let timeout = null;

    canvas.addEventListener("click", function (event) {
        if (isHoldClick) {
            isHoldClick = false;
            return;
        }
        let position = new Point(event.clientX, event.clientY);
        if (window.click && typeof window.click === "function") window.click(position);
    });

    canvas.addEventListener("mousedown", function (event) {
        timeout = setTimeout(function () {
            isHoldClick = true;
            let position = new Point(event.clientX, event.clientY);
            if (window.rightClick && typeof window.rightClick === "function") window.rightClick(position);
        }, 500);
    });

    canvas.addEventListener("mouseup", function (event) {
        if (timeout) clearTimeout(timeout);
        timeout = null;
    });


    canvas.addEventListener("contextmenu", function (event) {
        event.preventDefault();

        let position = new Point(event.clientX, event.clientY);
        if (window.rightClick && typeof window.rightClick === "function") window.rightClick(position);
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!window.mousePos) window.mousePos = new Point(event.x, event.y)
        else {
            window.mousePos.x = event.x;
            window.mousePos.y = event.y
        }
    });

    if (window.init && typeof window.init === "function") window.init();
    if (window.draw && typeof window.draw === "function") window.draw();

    let timer = new GameTick({ debug: true, tps: 60 });
    window.timer = timer;
    timer.addEventListener("gameTick", function (event) {
        if (window.draw && typeof window.draw === "function") window.draw();
    });
    timer.startGameTick();
});
        `;
        let baseDrawScript = ` 
let drawElements = [];
/** @type {Array<Vector>} */
let rays = [];
let drawRays = false;
let moveOnPath = false;
const rayCount = 100;
const rayLength = 50;
const angle = (2 * Math.PI) / rayCount;
let myPath = new VectorPath();
myPath.setStep(10);

function init() {

    // for (let i = 0; i < 10; i++) {
    //     drawElements.push(new Vector(
    //         new Point(getRandomInt(window.innerWidth), getRandomInt(window.innerHeight)),
    //         new Point(getRandomInt(window.innerWidth), getRandomInt(window.innerHeight))
    //     ));
    // }

    for (let i = 0; i < rayCount; i++) {
        rays.push(new Vector(new Point(0, 0), new Point(0, 1)));
    }

    for (let i = 0; i < rays.length; i++) {
        rays[i].setAngle(i * angle);
        rays[i].setLength(rayLength);
    }
}

/**
 *  @param {HTMLCanvasElement} canvas
 */
function draw() {
    /** @type {Point} */
    // let mousePos = window.mousePos;

    clear();
    // context.strokeStyle = "yellow";

    let step = myPath.getCurrentStep();
    if (moveOnPath) {
        step = myPath.step();
    }
    rays.forEach((item, index) => {
        item.moveStartTo(step);
        // item.setLength(rayLength);
        // item.setAngle(index * angle);

        let shouldDraw = true;
        // for (let i = 0; i < drawElements.length; i++) {
        //     let intersect = item.findIntersection(drawElements[i]);
        //     if (intersect && !item.start.equals(intersect)) {
        //         shouldDraw = true;
        //         item.setEnd(intersect);
        //     }
        // }
        if (shouldDraw) {
            item.draw();
        }
    });


    context.strokeStyle = "black";
    drawElements.forEach((item) => {
        item.draw();
    });
}

/**
 * @param {Point} point 
 */
function click(point) {
    myPath.add(point);
}

/**
 * @param {Point} point 
 */
function rightClick(point) {
    moveOnPath = !moveOnPath;
}

/**
 * @param {Array<Object>} items 
 */
function removeDrawElements(items) {
    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < drawElements.length; j++) {
            if (items[i] === drawElements[j]) {
                drawElements[j] = undefined;
                break;
            }
        }
    }

    drawElements = drawElements.filter(function (element) {
        return element !== undefined;
    });
}

function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function clearAll() {
    drawElements = [];
    rays = [];
    clear();
}

/**
 * @param {number} max 
 * @returns {number}
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
        `;
        let style = `
body {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

#canvas {
    width: 100%;
    height: 100%;
    background-color: rgb(201, 255, 255);
}
        `;

        document.querySelectorAll("script").forEach(function (dom) {
            if (dom.getAttribute("src") === "./js/vectors.js") {
                dom.removeAttribute("src");
                dom.innerHTML = vectorsScript;
            } else if (dom.getAttribute("src") === "./js/game-timer.js") {
                dom.removeAttribute("src");
                dom.innerHTML = gameTimerScript;
            } else if (dom.getAttribute("src") === "./js/events.js") {
                dom.removeAttribute("src");
                dom.innerHTML = eventsScript;
            } else if (dom.getAttribute("src") === "./js/base-draw.js") {
                dom.removeAttribute("src");
                dom.innerHTML = baseDrawScript;
            }
        });

        document.querySelector("link").remove();
        let styleDom = document.createElement("style");
        styleDom.innerHTML = style;
        document.head.appendChild(styleDom);
    });
}