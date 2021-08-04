class Storage {

    constructor() {
        if (localStorage === undefined) {
            this.fallbackStorage = {};
            this.supportsLocalStorage = false;
        } else {
            this.supportsLocalStorage = true;
        }
    }

    getHighestScore(gridSize) {
        const key = 'grid-' + gridSize.toString();
        if (this.supportsLocalStorage) {
            let score = localStorage.getItem(key);
            if (!score)
                return 0;
            else
                return Number.parseInt(score);
        } else {
            let score = this.fallbackStorage[key];
            if (score === undefined)
                return 0;
            else
                return score;
        }
    }

    setHighestScore(gridSize, score) {
        const key = 'grid-' + gridSize.toString();
        if (this.supportsLocalStorage)
            localStorage.setItem(key, score.toString());
        else
            this.fallbackStorage[key] = score;
    }

}

export { Storage as default }