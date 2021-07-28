const MoveDirection = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class Cell {

    static nextIdentifierAvailable = 0;

    constructor(row, col, val, nextVal, rowDestination, colDestination, mergedInto, cellIdentifier) {
        this.row = row;
        this.col = col;
        this.val = val || 0;
        this.nextVal = nextVal || 0;
        this.rowDestination = rowDestination || null;
        this.colDestination = colDestination || null;
        this.mergedInto = mergedInto || false;
        this.cellIdentifier = cellIdentifier || Cell.nextIdentifierAvailable++;
    }

    isEmpty() {
        return this.val === 0;
    }

    applyMoveAndClear() {
        if (this.isMoving()) {
            this.row = this.rowDestination;
            this.col = this.colDestination;
            if (this.nextVal !== 0) {
                this.val = this.nextVal;
                this.nextVal = 0;
            }
            this.rowDestination = null;
            this.colDestination = null;
        }
    }

    moveBy(amount, direction) {
        if (this.rowDestination == null)
            this.rowDestination = this.row;
        if (this.colDestination == null)
            this.colDestination = this.col;

        let currentRowVal = this.rowDestination;
        let currentColVal = this.colDestination;

        switch (direction) {
            case MoveDirection.UP: this.rowDestination = currentRowVal - amount; break;
            case MoveDirection.DOWN: this.rowDestination = currentRowVal + amount; break;
            case MoveDirection.LEFT: this.colDestination = currentColVal - amount; break;
            case MoveDirection.RIGHT: this.colDestination = currentColVal + amount; break;
            default: return;
        }
    }

    isMoving() {
        return this.rowDestination !== null || this.colDestination !== null;
    }

    markGettingMerged() {
        this.mergedInto = true;
    }

    isGettingMerged() {
        return this.mergedInto;
    }

    copy() {
        return new Cell(this.row, this.col, this.val, this.nextVal, this.rowDestination, this.colDestination, this.mergedInto, this.cellIdentifier);
    }
}

class GameBoard {
    constructor(rows, columns, cells) {
        this.ROWS = rows;
        this.COLUMNS = columns;
        if (cells)
            this.cells = cells;
        else {
            this.cells = Array(rows).fill().map(() => Array(columns).fill());

            for (let i = 0; i < this.ROWS; i++)
                for (let j = 0; j < this.COLUMNS; j++)
                    this.cells[i][j] = new Cell(i, j);

            this.addNewCells(1, 2);
        }
    }


    copy() {
        let cellsCopy = this.cells.map((row) => row.map(cell => cell.copy()));
        return new GameBoard(this.ROWS, this.COLUMNS, cellsCopy);
    }

    getNonEmptyCells() {
        let nonEmptyCells = [];

        this.cells.forEach(row => {
            row.forEach(cell => {
                if (!cell.isEmpty())
                    nonEmptyCells.push(cell);
            });
        });

        return nonEmptyCells;
    }

    addNewCells(n, defaultValue) {
        let emptyCells = [];

        this.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.isEmpty())
                    emptyCells.push(cell);
            });
        });

        if (emptyCells.length < n)
            return false;

        for (let i = 0; i < n; i++) {
            let cIndex = getRandomInt(emptyCells.length);
            emptyCells[cIndex].val = defaultValue;
            emptyCells.splice(cIndex, 1);
        }

        return true;
    }

    applyChanges() {
        let flatCells = this.cells.flat();
        let FLAG_RECREATE_0 = 0;

        flatCells.forEach(cell => {
            if (cell.isMoving()) {
                this.cells[cell.rowDestination][cell.colDestination] = cell;
                this.cells[cell.row][cell.col] = FLAG_RECREATE_0;
                cell.applyMoveAndClear();
            }
        });

        for (let i = 0; i < this.ROWS; i++)
            for (let j = 0; j < this.COLUMNS; j++)
                if (this.cells[i][j] === FLAG_RECREATE_0)
                    this.cells[i][j] = new Cell(i, j);

        return this;
    }

    move(moveDirection) {
        let board = this.copy().applyChanges();

        let lines = [];

        switch (moveDirection) {
            case MoveDirection.UP:
                for (let col = 0; col < board.COLUMNS; col++) {
                    let line = [];
                    for (let row = 0; row < board.ROWS; row++)
                        line.push(board.cells[row][col]);
                    lines.push(line);
                }
                break;
            case MoveDirection.DOWN:
                for (let col = 0; col < board.COLUMNS; col++) {
                    let line = [];
                    for (let row = board.ROWS - 1; row >= 0; row--)
                        line.push(board.cells[row][col]);
                    lines.push(line);
                }
                break;
            case MoveDirection.LEFT:
                lines = board.cells.map(row => row.slice());
                break;
            case MoveDirection.RIGHT:
                lines = board.cells.map(row => row.slice().reverse());
                break;
            default: return;
        }

        lines.forEach(line => {
            for (let i = 0; i < line.length - 1; i++) {
                let cell = line[i];
                if (cell.isEmpty()) {
                    for (let j = i; j < line.length; j++)
                        if (!line[j].isEmpty())
                            line[j].moveBy(1, moveDirection);
                } else {
                    let cellAdj = cell[i + 1];
                    if (cell.val === cell.cellAdj) {
                        cell.markGettingMerged();
                        cellAdj.moveBy(1, moveDirection);
                        cellAdj.nextVal = cellAdj.val * 2;
                        i++;
                    }
                }
            }
        });

        return board;
    }
}

export { MoveDirection, Cell, GameBoard }