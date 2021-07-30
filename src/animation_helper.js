class AnimationHelper {
    constructor(duration) {
        this.startTime = null;
        this.duration = duration;
        this.animationDone = false;
    }

    getTimeRatio(currentTime) {
        if (this.startTime === null) {
            this.startTime = currentTime;
            return 0.0;
        }

        let elapsed = currentTime - this.startTime;
        let ratio = Math.min(1.0, (elapsed / this.duration));

        if (ratio >= 1)
            this.animationDone = true;

        return ratio;
    }

    isDone() {
        return this.animationDone;
    }

    reset() {
        this.startTime = null;
        this.animationDone = false;
    }
}

class MoveAnimation {
    constructor(xDiff, yDiff, duration) {
        this.xDiff = xDiff;
        this.yDiff = yDiff;
        this.animationHelper = new AnimationHelper(duration);
    }

    getMovementDeltas(currentTime) {
        let animationPercentage = this.animationHelper.getTimeRatio(currentTime);
        let currentXDiff = animationPercentage * this.xDiff;
        let currentYDiff = animationPercentage * this.yDiff;
        return { xDiff: currentXDiff, yDiff: currentYDiff };
    }

    isDone() {
        return this.animationHelper.isDone();
    }
}

export { MoveAnimation };