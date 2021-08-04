import React from 'react';
import ValueCell from './valuecell'
import BackgroundCell from './backgroundcell';
import { MoveDirection, GameBoard, GameStatus } from '../logic/gamelogic';
import { getRandomInt } from '../utils/utils';

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleAnimationDone = this.handleAnimationDone.bind(this);
        this.reset = this.reset.bind(this);
        this.state = this.reset(true);
    }

    reset(isConstructor = false) {
        const gameBoard = new GameBoard(this.props.rows, this.props.columns).spawnCells(2, 2, true);
        this.acceptInput = true;
        this.expectedAnimations = -1;
        this.autoMode = false;
        this.autoModeToken = 'boom';
        this.autoModeIndex = 0;
        const state = {
            board: gameBoard,
            gameStatus: GameStatus.YET_UNDEFINED
        }

        if (!isConstructor)
            this.setState(state);

        return state;
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
            let newBoard = this.state.board.applyMoves().spawnCells(1, Math.random() < 0.9 ? 2 : 4, true);
            let currentStatus = newBoard.checkGameStatus();

            if (currentStatus === GameStatus.YET_UNDEFINED)
                this.acceptInput = true;

            this.props.onNewScore(newBoard.getCurrentScore());

            if (this.autoMode && currentStatus === GameStatus.YET_UNDEFINED)
                this.setState({ board: newBoard, gameStatus: currentStatus }, this.autoPlay);
            else
                this.setState({ board: newBoard, gameStatus: currentStatus });
        }
    }

    handleKeyDown(keyevent) {
        if(this.autoMode)
            this.autoMode = false;
        if (!this.acceptInput)
            return;

        let oldBoard = this.state.board;
        let newBoard;
        let moveDir;

        if (keyevent.key === this.autoModeToken[this.autoModeIndex]) {
            this.autoModeIndex++;
            if (this.autoModeIndex >= this.autoModeToken.length) {
                this.autoMode = true;
                this.autoPlay();
                return;
            }
        } else {
            this.autoModeIndex = 0;
        }

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

    autoPlay() {
        setTimeout(() => {
            if(!this.autoMode)
                return;
            const possibleMoves = [MoveDirection.UP, MoveDirection.DOWN, MoveDirection.LEFT, MoveDirection.RIGHT];
            const currentBoard = this.state.board;
            let nextBoard;

            while(!nextBoard) {
                let i = getRandomInt(possibleMoves.length);
                let m = possibleMoves[i];
                let nxt = currentBoard.move(m);
                if(nxt !== currentBoard)
                    nextBoard = nxt;
                else
                    possibleMoves.splice(i, 1);
            }

            this.acceptInput = false;
            this.expectedAnimations = nextBoard.cells.flat().reduce((acc, cell) => acc + (cell.isMoving() ? 1 : 0), 0);
            this.setState({ board: nextBoard });
        }, 300);
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
        if (this.state.gameStatus === GameStatus.WON)
            gridOverlay.push(<div className="grid-overlay">Gratz, you've won!</div>);
        else if (this.state.gameStatus === GameStatus.LOST)
            gridOverlay.push(<div className="grid-overlay">You lost, will go better next time!</div>)

        return (
            <div className="gamegrid" style={{ '--grid-rows': this.props.rows, '--grid-cols': this.props.columns }}>
                {bgCells}
                {valueCells}
                {gridOverlay}
            </div>
        );
    }
}

export { Board as default };
