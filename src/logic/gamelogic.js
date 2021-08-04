import { getRandomInt } from "../utils/utils";

const MoveDirection = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
}

const GameStatus = {
    WON: 0,
    LOST: 1,
    YET_UNDEFINED: 2
}

class Cell {

    static nextIdentifierAvailable = 1;

    constructor(row, col, val = 0, nextVal = 0, rowDestination = null, colDestination = null, mergedInto = false, mergingInto=false, cellIdentifier = null) {
        this.row = row;
        this.col = col;
        this.val = val;
        this.nextVal = nextVal;
        this.rowDestination = rowDestination;
        this.colDestination = colDestination;
        this.mergedInto = mergedInto;
        this.mergingInto = mergingInto;
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
            this.mergingInto = false;
            this.mergedInto = false;
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

    markMerging() {
        this.mergingInto = true;
    }

    isGettingMerged() {
        return this.mergedInto;
    }

    isMergingInto() {
        return this.mergingInto;
    }

    copy() {
        return new Cell(this.row, this.col, this.val, this.nextVal, this.rowDestination, this.colDestination, this.mergedInto, this.mergingInto, this.cellIdentifier);
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

    /**
     * 
     * @param {boolean} inPlace specify if doing the operation in place or return a new board with the pending moves applied
     * @returns the board with the moves applied, or a copy of the board with the moves applied if inPlace=false
     */

    applyMoves(inPlace = false) {
        let board = inPlace ? this : this.copy();

        let flatCells = board.cells.flat();

        GameBoard.initializeGrid(board.cells, board.ROWS, board.COLUMNS);

        flatCells.forEach(cell => {
            if (cell.isMoving()) {
                if (!cell.isGettingMerged()) {
                    board.cells[cell.rowDestination][cell.colDestination] = cell;
                    cell.applyMoveAndClear();
                }
            } else {
                if (!cell.isEmpty() && !cell.isGettingMerged())
                    board.cells[cell.row][cell.col] = cell;
            }
        });

        return board;
    }


    /**
     * 
     * @param {number} n the number of cells to spawn
     * @param {number} value the value of the cells spawned
     * @param {boolean} inPlace specify if doing the operation in place or return a board copy with the spawned cells
     * @returns the board ref itself or the new board with the spawned cells, the same board ref if it couldn't spawn any even if inPlace=false
     */

    spawnCells(n, value = 2, inPlace = false) {
        let board = inPlace ? this : this.copy(); 
        let emptyCells = [];

        board.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.isEmpty())
                    emptyCells.push(cell);
            });
        });


        if (emptyCells.length < n)
            return this;

        for (let i = 0; i < n; i++) {
            let cIndex = getRandomInt(emptyCells.length);
            let emptyCell = emptyCells[cIndex];
            board.cells[emptyCell.row][emptyCell.col].val = value;
            emptyCells.splice(cIndex, 1);
        }

        return board;
    }

    /**
     * 
     * @param {MoveDirection} moveDirection the direction you want the tiles to go
     * @param {boolean} inPlace specify if doing the operation in place or return a board copy with the diffs applied
     * @returns a new board with the tiles moved if any changes happened, otherwise the same board ref, even if inPlace=false
     */

    move(moveDirection, inPlace = false) {
        let board = inPlace ? this : this.copy();
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
                            cell.markMerging();

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

    /**
     * 
     * @param {number} winConditionThreshold the win condition magic number, 2048 normally
     * @returns the current game status [GameStatus.WON, GameStatus.LOST, GameStatus.YET_UNDEFINED]
     */

    checkGameStatus(winConditionThreshold=2048) {
        let cells = this.cells.flat();
        
        let hasWon = cells.some(cell => cell.val >= winConditionThreshold);
        if(hasWon) 
            return GameStatus.WON;
        
        let possibleMoves = [MoveDirection.UP, MoveDirection.DOWN, MoveDirection.LEFT, MoveDirection.RIGHT];
        let hasMoveAvailable = possibleMoves.some(move => this.move(move) !== this);
        
        if(hasMoveAvailable)
            return GameStatus.YET_UNDEFINED;
        else
            return GameStatus.LOST;
    }

    /**
     * @returns the actual score, a.k.a. the sum of the values of the cells
     */

    getCurrentScore() {
        return this.cells.flat().reduce((acc, cell) => acc + cell.val, 0);
    }

    toString() {
        return this.cells.map(row => row.map(cell => cell.val).join(' ')).join('\r\n');
    }
}

export { GameStatus, MoveDirection, Cell, GameBoard }