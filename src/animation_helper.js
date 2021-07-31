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

class ValueAnimator {
    constructor(fromValue, toValue, duration) {
        this.fromValue = fromValue;
        this.toValue = toValue;
        this.valDiff = toValue - fromValue;
        this.currentVal = fromValue;
        this.animationHelper = new AnimationHelper(duration);
    }

    setUpdatedValueCallback(callback) {
        this.updateCallback = callback;
    }

    update(currentTime) {
        let animationProgRatio = this.animationHelper.getTimeRatio(currentTime);
        this.currentVal = this.fromValue + (this.valDiff * animationProgRatio);
        if (this.updateCallback)
            this.updateCallback(this.currentVal);
    }

    getCurrentValue() {
        return this.currentVal;
    }

    isCompleted() {
        return this.animationHelper.isDone();
    }
}

class SequentialAnimator {

    constructor() {
        this.animationList = [];
        this.currentAnimationIndex = 0;
    }

    update(currentTime) {
        if (this.currentAnimationIndex < this.animationList.length) {
            let currentAnim = this.animationList[this.currentAnimationIndex];
            currentAnim.update(currentTime);
            if (currentAnim.isCompleted())
                this.currentAnimationIndex++;
        }
    }

    addAnimator(animator) {
        this.animationList.push(animator);
    }

    isCompleted() {
        return this.animationList.every(anim => anim.isCompleted());
    }

}

export { ValueAnimator, SequentialAnimator};