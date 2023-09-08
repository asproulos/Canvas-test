const DEFAULT_TPS = 30;
// Global variables
class GameTick {
    #callBackArraysObject = {
        gameTickStart: [],
        gameTickStop: [],
        gameTick: []
    };
    #animationRequestID = null;
    #lastElapsedTime = 0;
    #startTime = 0;
    #framesCount = 0;
    #framesCountStartTime = 0;

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

    getDebug = () => {
        return this.debug;
    }

    getTps = () => {
        return this.tps
    }

    getIntervalPerFrame = () => {
        return this.intervalPerFrame;
    }

    getCurrentFrameRate = () => {
        if (this.#framesCount === 0) return this.tps;
        let runningTime = this.#lastElapsedTime - this.#framesCountStartTime;
        if (runningTime === 0) runningTime = 1000;
        let seconds = runningTime / 1000;
        return Math.floor(this.#framesCount / seconds);
    }

    /**
     * Turns the tps into miliseconds for use with Intervals
     * Calculates how many frames in a second based on the interval between them
     * The calculation is the same both ways
     * @param {number} desiredTps 
     * @returns {number} the miliseconds between frames
     */
    tpsIntervalTwoWayTransformer = (value) => {
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
    #validateValues = (options) => {
        if (typeof options.debug !== "boolean") {
            options.debug = false;
        }

        if (typeof options.tps !== "number") {
            options.tps = DEFAULT_TPS;
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
    addEventListener = (on, callback) => {
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

    startGameTick = () => {
        let eventData = { lalakis: "start" };
        this.#callBackArraysObject.gameTickStart.forEach((callback) => {
            callback(eventData);
        });
        this.#animationRequestID = window.requestAnimationFrame(this.doGameTick);
    }

    stopGameTick = () => {

        let eventData = { lalakis: "stop" };
        this.#callBackArraysObject.gameTickStop.forEach((callback) => {
            callback(eventData);
        });
        window.cancelAnimationFrame(this.#animationRequestID);

        this.#startTime = 0;
        this.#framesCount = 0;
    }

    doGameTick = (elapsedTime) => {
        if (!this.#startTime) {
            this.#startTime = elapsedTime;
        }
        if (!this.#framesCountStartTime) {
            this.#framesCountStartTime = elapsedTime;
        }
        let currentDiff = elapsedTime - this.#lastElapsedTime;

        // TODO: second loop if requested tickrate is > 60?
        if (this.getCurrentFrameRate() + 1 > this.tps) {
            if (currentDiff < this.intervalPerFrame) {
                this.#animationRequestID = window.requestAnimationFrame(this.doGameTick);
                return;
            }
        }
        this.#framesCount++;
        if (this.#framesCount > 250) {
            this.#framesCount = 0;
            this.#framesCountStartTime = elapsedTime;
        }
        this.#lastElapsedTime = elapsedTime;
        let eventData = { marika: "123" };
        try {
            this.#callBackArraysObject.gameTick.forEach((callback) => {
                callback(eventData);
            });
        } catch (error) {
            console.error(error)
        }

        this.#animationRequestID = window.requestAnimationFrame(this.doGameTick);
    }
}