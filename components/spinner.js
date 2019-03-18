import React from 'react';

import './spinner.css'

class Spinner extends React.Component {
    constructor(props) {
        super(props);



        this.state = {value:  parseInt(this.props.value)};
        this.maxValue = parseInt(this.props.max);
        this.minValue = parseInt(this.props.min);
        this.increment = this.increment.bind(this);
        this.decrement = this.decrement.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
    }

    increment() {
        this.setState({
            value: Math.min(this.maxValue, this.state.value + 1)
        });

        this.onChangeHandler();
    }

    decrement() {
        this.setState({
            value: Math.max(this.minValue, this.state.value - 1)
        });

        this.onChangeHandler();
    }

    onChangeHandler() {
        this.props.onChange({value: this.state.value});
    }

    render() {
        return (
            <div className="spinner" style={this.props.style}>
                <span>{this.state.value}</span>
                <button onClick={this.increment}>+</button>
                <button onClick={this.decrement}>-</button>
            </div>
        );
    }
}

export default Spinner;