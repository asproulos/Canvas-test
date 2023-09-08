/** @type {Array<Vector>} */
let drawElements = [];
/** @type {Array<Vector>} */
let rays = [];
let drawRays = false;
let moveOnPath = false;
const rayCount = 100;
const rayLength = 20;
const angle = (2 * Math.PI) / rayCount;
let stopMove = false;

// const gravity = new Vector(new Point(0, 0), new Point(0, 1));
// const gravityStrength = 1;
// gravity.setLength(gravityStrength);
let move = new Vector(new Point(0, 0), new Point(1, 0));
// const horizontalSpeed = 10;
// move.setLength(horizontalSpeed);

function init() {
    for (let i = 0; i < 10; i++) {
        drawElements.push(new Vector(
            new Point(getRandomInt(window.innerWidth), getRandomInt(window.innerHeight)),
            new Point(getRandomInt(window.innerWidth), getRandomInt(window.innerHeight))
        ));
    }

    for (let i = 0; i < rayCount; i++) {
        rays.push(new Vector(new Point(0, 0), new Point(0, 1)));
    }

    for (let i = 0; i < rays.length; i++) {
        rays[i].setAngle(i * angle);
        rays[i].setLength(rayLength);
    }
}

/**
 * @param {CanvasRenderingContext2D} context 
 */
function background(context) {
    drawElements.forEach(function (vector) {
        vector.draw(context);
    });
}

/**
 * @param {CanvasRenderingContext2D} context 
 * @param {Point} mousePos 
 */
function draw(context, mousePos) {
    let position = move.end.copy();
    context.fillStyle = "purple";
    context.lineWidth = 20;
    position.draw(context);


    if (stopMove) return;
    move.moveStartTo(position);
    // move.add(gravity);
    const pullStrength = 3;
    const friction = 1;
    let vectorToMousePos = new Vector(position, mousePos);
    if (vectorToMousePos.length() !== 0) {
        vectorToMousePos.setLength(pullStrength);
        move.add(vectorToMousePos);
    }
    move.setLength(move.length() - friction);
}

/**
 * @param {Point} point 
 */
function click(point) {
    stopMove = !stopMove;
}

/**
 * @param {Point} point 
 */
function rightClick(point) {

}

/**
 * @param {number} max 
 * @returns {number}
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}