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

    static nextIdentifierAvailable = 1;

    constructor(row, col, val = 0, nextVal = 0, rowDestination = null, colDestination = null, mergedInto = false, cellIdentifier = null) {
        this.row = row;
        this.col = col;
        this.val = val;
        this.nextVal = nextVal;
        this.rowDestination = rowDestination;
        this.colDestination = colDestination;
        this.mergedInto = mergedInto;
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
        if (this.rowDestination === null)
            this.rowDestination = this.row;
        if (this.colDestination === null)
            this.colDestination = this.col;

        switch (direction) {
            case MoveDirection.UP: this.rowDestination = this.rowDestination - amount; break;
            case MoveDirection.DOWN: this.rowDestination = this.rowDestination + amount; break;
            case MoveDirection.LEFT: this.colDestination = this.colDestination - amount; break;
            case MoveDirection.RIGHT: this.colDestination = this.colDestination + amount; break;
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
            GameBoard.initializeGrid(this.cells, rows, columns);
        }
    }

    copy() {
        let cellsCopy = this.cells.map((row) => row.map(cell => cell.copy()));
        return new GameBoard(this.ROWS, this.COLUMNS, cellsCopy);
    }

    static initializeGrid(cellsArray, rows, columns) {
        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                cellsArray[i][j] = new Cell(i, j);

        return cellsArray;
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

    applyChanges() {
        let flatCells = this.cells.flat();

        GameBoard.initializeGrid(this.cells, this.ROWS, this.COLUMNS);

        flatCells.forEach(cell => {
            if (cell.isMoving()) {
                if (!cell.isGettingMerged()) {
                    this.cells[cell.rowDestination][cell.colDestination] = cell;
                    cell.applyMoveAndClear();
                }
            } else {
                if (!cell.isEmpty() && !cell.isGettingMerged())
                    this.cells[cell.row][cell.col] = cell;
            }
        });

        return this;
    }


    spawnCells(n, defaultValue = 2) {
        let emptyCells = [];

        let realBoard = this.copy().applyChanges();

        realBoard.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.isEmpty())
                    emptyCells.push(cell);
            });
        });


        if (emptyCells.length < n)
            return false;

        for (let i = 0; i < n; i++) {
            let cIndex = getRandomInt(emptyCells.length);
            let emptyCell = emptyCells[cIndex];
            this.cells[emptyCell.row][emptyCell.col].val = defaultValue;
            emptyCells.splice(cIndex, 1);
        }

        return true;
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
            let prevNonZeroCell = null;
            for (let i = 0; i < line.length; i++) {
                let cell = line[i];
                if (cell.isEmpty()) {
                    for (let j = i + 1; j < line.length; j++)
                        if (!line[j].isEmpty())
                            line[j].moveBy(1, moveDirection);
                } else {
                    if (prevNonZeroCell === null) {
                        prevNonZeroCell = cell;
                    } else {
                        if (prevNonZeroCell.val === cell.val) {
                            prevNonZeroCell.markGettingMerged();
                            cell.nextVal = cell.val * 2;

                            for (let j = i; j < line.length; j++) {
                                if (!line[j].isEmpty())
                                    line[j].moveBy(1, moveDirection);
                            }

                            prevNonZeroCell = null;
                        } else {
                            prevNonZeroCell = cell;
                        }
                    }
                }
            }
        });

        let diffs = board.cells.flat().reduce((acc, cell) => acc + (cell.isMoving() ? 1 : 0), 0);

        if (!diffs)
            return this;

        return board;
    }

    toString() {
        return this.cells.map(row => row.map(cell => cell.val).join(' ')).join('\r\n');
    }
}

export { MoveDirection, Cell, GameBoard }