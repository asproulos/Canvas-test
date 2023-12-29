/**
 * Vectors library. Points and vectors
 * Version: 1.0.0
 */

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
        return `[${this.x}, ${this.y}]`;
    }

    /**
     * @param {CanvasRenderingContext2D} context2D 
     */
    draw(context2D) {
        if (!context2D) context2D = window.context;
        if (!context2D) return;

        const circle = new Path2D();
        circle.arc(this.x, this.y, context2D.lineWidth, 0, 2 * Math.PI);

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

    isNaN = () => {
        return this.start.equals(this.end);
    }

    toString = () => {
        return `{start: ${this.start.toString()}, end: ${this.end.toString()}}`;
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
            console.warn(`Position "${position}" is not valid.`);
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

class Polygon {
    edges = [];

    constructor(pointsArray) {
        if (!(pointsArray instanceof Array)) {
            return;
        }
        for (let i = 0; i < pointsArray.length; i++) {
            if (pointsArray[i] instanceof Point) {
                this.edges.push(pointsArray[i]);
            }
        }
    }
}