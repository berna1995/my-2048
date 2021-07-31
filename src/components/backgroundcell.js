import React from 'react';

class BackgroundCell extends React.Component {
    render() {
        return (
            <div className="bg-cell" style={{ gridRow: this.props.row + 1, gridColumn: this.props.col + 1 }} />
        );
    }
}

export { BackgroundCell as default };