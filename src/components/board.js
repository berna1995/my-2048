import React from 'react';
import ValueCell from './valuecell'
import BackgroundCell from './backgroundcell';
import { MoveDirection, Cell, GameBoard } from '../logic/logic';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleAnimationDone = this.handleAnimationDone.bind(this);

        let gameBoard = new GameBoard(props.rows, props.columns);
        gameBoard.spawnCells(1);

        this.state = { board: gameBoard };
        this.acceptInput = true;
        this.expectedAnimations = -1;
    }

    generateBackgroundCells(rows, columns) {
        let boxes = [];

        for (let i = 0; i < rows; i++)
            for (let j = 0; j < columns; j++)
                boxes.push(<BackgroundCell key={i * columns + j} row={i} col={j} />);

        return boxes;
    }

    handleAnimationDone() {
        this.expectedAnimations -= 1;

        if (this.expectedAnimations === 0) {
            let newBoard = this.state.board.applyMoves();
            newBoard.spawnCells(1);
            this.acceptInput = true;
            this.setState({ board: newBoard });
        }
    }

    handleKeyDown(keyevent) {
        if (!this.acceptInput)
            return;

        let oldBoard = this.state.board;
        let newBoard;
        let moveDir;

        switch (keyevent.keyCode) {
            case 40: moveDir = MoveDirection.DOWN; break;
            case 39: moveDir = MoveDirection.RIGHT; break;
            case 38: moveDir = MoveDirection.UP; break;
            case 37: moveDir = MoveDirection.LEFT; break;
            default: return;
        }

        newBoard = oldBoard.move(moveDir);
        if (newBoard !== oldBoard) {
            this.acceptInput = false;
            this.expectedAnimations = newBoard.cells.flat().reduce((acc, cell) => acc + (cell.isMoving() ? 1 : 0), 0);
            this.setState({ board: newBoard });
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    render() {
        const bgCells = this.generateBackgroundCells(this.props.rows, this.props.columns);
        const nonEmptyCells = this.state.board.getNonEmptyCells();
        const valueCells = nonEmptyCells.map((c) => {
            return <ValueCell key={c.cellIdentifier} cell={c} animationDoneCallback={this.handleAnimationDone} />
        });

        return (
            <div className="gamegrid">
                {bgCells}
                {valueCells}
            </div>
        );
    }
}

export { Board as default };
