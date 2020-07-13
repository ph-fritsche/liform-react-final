import React from 'react';

export class PureOptions extends React.PureComponent {
    render() {
        return this.props.values && this.props.values.map((v,i) =>
            <option key={v} value={v}>
                { this.props.labels && this.props.labels[i] || v }
            </option>
        )
    }
}
