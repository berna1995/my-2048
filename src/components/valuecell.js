import React from 'react';
import { SequentialAnimator, ValueAnimator } from '../helpers/animation';

class ValueCell extends React.Component {

    static TRANSLATION_1_CELL_DURATION = 150;

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
            let [axis, valDiff, animDuration] = this.computeAnimationTranslation();
            let composedAnimator = new SequentialAnimator();
            let translationAnimator = new ValueAnimator(0, valDiff, animDuration);
            translationAnimator.setUpdatedValueCallback(val => {
                if (axis === 'x')
                    this.setState({ translationX: val, translationY: 0 });
                else
                    this.setState({ translationX: 0, translationY: val });
            });
            composedAnimator.addAnimator(translationAnimator);
            if (this.props.cell.isMergingInto()) {
                let firstScaleAnimator = new ValueAnimator(100, 110, 100);
                firstScaleAnimator.setUpdatedValueCallback(val => {
                    this.setState({ scaleFactor: val });
                });
                let secondScaleAnimator = new ValueAnimator(110, 100, 100);
                secondScaleAnimator.setUpdatedValueCallback(val => {
                    this.setState({ scaleFactor: val });
                });
                composedAnimator.addAnimator(firstScaleAnimator);
                composedAnimator.addAnimator(secondScaleAnimator);
            }
            this.animation = composedAnimator;
            this.animationRequestId = window.requestAnimationFrame(this.animate);
        }
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

    componentWillUnmount() {
        if (this.animationRequestId !== 0)
            window.cancelAnimationFrame(this.animationRequestId);
    }

    computeAnimationTranslation() {
        let xCellsDelta = this.props.cell.colDestination - this.props.cell.col;
        let yCellsDelta = this.props.cell.rowDestination - this.props.cell.row;
        let borderPx = Number.parseInt(getComputedStyle(this.divRef.current).getPropertyValue('--grid-border').trim().replace("px", ""));
        let boundingBox = this.divRef.current.getBoundingClientRect();
        let cellWidth = boundingBox.width;
        let cellHeight = boundingBox.height;

        if (xCellsDelta !== 0) {
            let xDelta = (xCellsDelta * cellWidth) + (borderPx * xCellsDelta);
            let animDuration = Math.abs(xCellsDelta) * ValueCell.TRANSLATION_1_CELL_DURATION;
            return ['x', xDelta, animDuration];
        } else {
            let yDelta = (yCellsDelta * cellHeight) + (borderPx * yCellsDelta);
            let animDuration = Math.abs(yCellsDelta) * ValueCell.TRANSLATION_1_CELL_DURATION;
            return ['y', yDelta, animDuration];
        }
    }

    resetAnimationStatus() {
        this.animation = null;
        this.animationDone = false;
        this.animationRequestId = 0;
    }
}

export { ValueCell as default };