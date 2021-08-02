import React from 'react';
import ValueCell from './valuecell'
import BackgroundCell from './backgroundcell';
import { MoveDirection, GameBoard, GameStatus } from '../logic/gamelogic';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleAnimationDone = this.handleAnimationDone.bind(this);
        this.reset = this.reset.bind(this);

        let gameBoard = new GameBoard(props.rows, props.columns).spawnCells(1, 2, true);
        this.state = { board: gameBoard, gameStatus: GameStatus.YET_UNDEFINED };
        this.acceptInput = true;
        this.expectedAnimations = -1;
    }

    reset() {
        let gameBoard = new GameBoard(this.props.rows, this.props.columns).spawnCells(1, 2, true);
        this.acceptInput = true;
        this.expectedAnimations = -1;
        this.setState({
            board: gameBoard,
            gameStatus: GameStatus.YET_UNDEFINED
        });
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
            let newBoard = this.state.board.applyMoves().spawnCells(1, 2 , true);
            let currentStatus = newBoard.checkGameStatus();

            if(currentStatus === GameStatus.YET_UNDEFINED)
                this.acceptInput = true;

            this.setState({ board: newBoard, gameStatus: currentStatus});
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

        newBoard = oldBoard.move(moveDir, false);
        if (newBoard !== oldBoard) {
            this.acceptInput = false;
            this.expectedAnimations = newBoard.cells.flat().reduce((acc, cell) => acc + (cell.isMoving() ? 1 : 0), 0);
            this.setState({ board: newBoard });
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        this.props.registerResetCallback(this.reset);
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
        const gridOverlay = [];
        if(this.state.gameStatus === GameStatus.WON)
            gridOverlay.push(<div className="grid-overlay">Gratz, you've won!</div>);
        else if (this.state.gameStatus === GameStatus.LOST)
            gridOverlay.push(<div className="grid-overlay">You lost, will be better next time!</div>)

        return (
            <div className="gamegrid" style={{'--grid-rows': this.props.rows, '--grid-cols': this.props.columns}}>
                {bgCells}
                {valueCells}
                {gridOverlay}
            </div>
        );
    }
}

export { Board as default };
