import React from 'react';
import { SequentialAnimator, ValueAnimator } from '../helpers/animation';

class ValueCell extends React.Component {

    static TRANSLATION_1_CELL_DURATION = 150;
    static SCALING_DURATION = 100;

    constructor(props) {
        super(props);
        this.divRef = React.createRef();
        this.animate = this.animate.bind(this);
        this.resetAnimationStatus();
        this.state = { translationX: 0, translationY: 0, scaleFactor: 100 };
        this.recycled = false;
    }

    render() {
        let styles = {
            gridRow: this.props.cell.row + 1,
            gridColumn: this.props.cell.col + 1,
        };

        if (this.props.cell.isMoving()) {
            styles['transform'] = `translate(${this.state.translationX}px, ${this.state.translationY}px) scale(${this.state.scaleFactor}%)`
        }


        let cappedValue = Math.min(2048, this.props.cell.val);
        let zIndexClass = this.props.cell.isGettingMerged() ? 'value-cell-merged' : 'value-cell-top';
        let classes = this.recycled ? `value-cell value-${cappedValue} ${zIndexClass}` :
            `value-cell value-${cappedValue} ${zIndexClass} value-cell-pop-in`;

        this.recycled = true;

        return (
            <div className={classes} style={styles} ref={this.divRef} >
                {this.props.cell.val}
            </div>
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.cell.isMoving() && !this.props.cell.isMoving())
            this.resetAnimationStatus();

        if (this.props.cell.isMoving() && !this.animationDone && this.animationRequestId === 0) {
            this.animation = this.prepareAnimation();
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        }
    }

    componentWillUnmount() {
        if (this.animationRequestId !== 0)
            window.cancelAnimationFrame(this.animationRequestId);
    }

    animate(time) {
        this.animation.update(time);

        if (!this.animation.isCompleted())
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        else {
            this.animation = null;
            this.animationDone = true;
            this.animationRequestId = 0;
            this.props.animationDoneCallback();
        }
    }

    prepareAnimation() {
        let totalAnimator = new SequentialAnimator();

        // Translation
        let xCellsDelta = this.props.cell.colDestination - this.props.cell.col;
        let yCellsDelta = this.props.cell.rowDestination - this.props.cell.row;
        let borderPx = Number.parseInt(getComputedStyle(this.divRef.current).getPropertyValue('--grid-border').trim().replace("px", ""));
        let boundingBox = this.divRef.current.getBoundingClientRect();
        let cellWidth = boundingBox.width;
        let cellHeight = boundingBox.height;
        let xAxisMove = xCellsDelta !== 0;
        let delta = xAxisMove ? (xCellsDelta * cellWidth) + (borderPx * xCellsDelta) : (yCellsDelta * cellHeight) + (borderPx * yCellsDelta);
        let cellsDelta = xAxisMove ? xCellsDelta : yCellsDelta;
        let translationDuration = Math.abs(cellsDelta) * ValueCell.TRANSLATION_1_CELL_DURATION;
        let translationAnimator = new ValueAnimator(0, delta, translationDuration).setUpdatedValueCallback(val => {
            let xVal = xCellsDelta !== 0 ? val : 0;
            let yVal = yCellsDelta !== 0 ? val : 0;
            this.setState({ translationX: xVal, translationY: yVal });
        });
        totalAnimator.addAnimator(translationAnimator);

        // Merge animation, only if cell is merging
        if (this.props.cell.isMergingInto()) {
            let scaleAnimator = new ValueAnimator(100, 110, ValueCell.SCALING_DURATION, true).setUpdatedValueCallback(val => {
                this.setState({ scaleFactor: val });
            });
            totalAnimator.addAnimator(scaleAnimator);
        }

        return totalAnimator;
    }

    resetAnimationStatus() {
        this.animation = null;
        this.animationDone = false;
        this.animationRequestId = 0;
    }
}

export { ValueCell as default };