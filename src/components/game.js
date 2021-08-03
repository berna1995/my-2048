import React from 'react';
import Board from './board';
import { Button, Dropdown, Ref } from 'semantic-ui-react';

class Header extends React.Component {
    render() {
        return (
            <>
                <div className="header-line-1">
                    <h1> 2048 </h1>
                </div>
                <div className="header-line-2">
                    <NewGameButton onNewGameClicked={this.props.onNewGameClicked} />
                    <GridSizeSelector options={this.props.options} onGridSizeChanged={this.props.onGridSizeChanged} defaultGridSize={this.props.defaultGridSize} />
                </div>
            </>
        );
    }
}

class GridSizeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.myRef = React.createRef();
    }

    onChange(event, data) {
        this.myRef.current.blur();
        this.props.onGridSizeChanged(parseInt(data.value));
    }

    render() {
        return (
            <Ref innerRef={this.myRef}>
                <Dropdown
                    text='Grid Size'
                    icon='grid layout'
                    labeled
                    floating
                    button
                    className='icon'
                    options={this.props.options}
                    defaultValue={this.props.defaultGridSize}
                    onChange={this.onChange}
                    closeOnBlur={true}
                />
            </Ref>
        );
    }
}

class NewGameButton extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.target.blur();
        this.props.onNewGameClicked();
    }

    render() {
        return (
            <Button color="teal" onClick={this.onClick}>New Game</Button>
        );
    }
}

class Footer extends React.Component {
    render() {
        const lines = this.props.lines.map(line => <> <span>{line}</span> <br></br> </>)

        return (
            <div className="footer">{lines}</div>
        );
    }
}

class Game extends React.Component {

    static DEFAULT_ROWS = 4;
    static DEFAULT_COLS = 4;

    constructor(props) {
        super();
        this.state = {
            rows: Game.DEFAULT_ROWS,
            columns: Game.DEFAULT_COLS
        };
        this.gridOptions = []
        for (let i = 4; i <= 8; i++)
            this.gridOptions.push({ key: i, text: i.toString() + " x " + i.toString(), value: i });

        this.handleGridResize = this.handleGridResize.bind(this);
        this.handleNewGameClicked = this.handleNewGameClicked.bind(this);
        this.setNewGameHandler = this.setNewGameHandler.bind(this);
    }

    handleGridResize(newSize) {
        this.setState({
            rows: newSize,
            columns: newSize
        });
    }

    setNewGameHandler(handler) {
        this.newGameHandler = handler;
    }

    handleNewGameClicked() {
        if (this.newGameHandler)
            this.newGameHandler();
    }

    render() {
        return (
            <div className="gamecontainer">
                <Header options={this.gridOptions} defaultGridSize={this.gridOptions[0].value} onGridSizeChanged={this.handleGridResize} onNewGameClicked={this.handleNewGameClicked} />
                <Board key={this.state.rows * this.state.columns} rows={this.state.rows} columns={this.state.columns} registerResetCallback={this.setNewGameHandler} />
                <Footer lines={["Use arrow keys to slide the tiles.", "Game developed by Matteo Bernabito."]} />
            </div>
        );
    }
}

export { Game as default };