import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Box extends React.Component {
    render() {
        return (
            <div>Box</div>
        );
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
    }

    generateBoxes(rows, columns) {
        let boxes = [];
        for(let i=0; i<rows; i++) {
            for(let j=0; j<columns; j++) {
                boxes.push(<div className="block">Box {i} {j}</div>)
            }
        }
        return boxes;
    }

    render() {
        return (
            <div className="gamegrid">
                {this.generateBoxes(this.props.rows,this.props.columns)}
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game rows={4} columns={4} />,
    document.getElementById('root')
);