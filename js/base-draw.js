const pullStrength = 1;
const friction = 0.2;

window.silentErrors = true;
/** @type {Array<Vector>} */
let stopMove = false;
let move = new Vector(new Point(0, 0), new Point(1, 1));

function init() {

}

/**
 * @param {CanvasRenderingContext2D} context 
 */
function background(context) {

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

    let copy = move.copy();
    if (copy.length()) {
        copy.moveStartTo(position);
        copy.setLength(copy.length() * 2);
        context.lineWidth = 2;
        copy.draw(context);
    }

    let vectorToMousePos = new Vector(position, mousePos);
    if (move.length() < friction && vectorToMousePos.length() < 0.6) {
        return;
    }

    if (stopMove) return;
    move.moveStartTo(position);
    if (vectorToMousePos.length() !== 0) {
        vectorToMousePos.setLength(pullStrength);
        move.add(vectorToMousePos);
        console.log(move)
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