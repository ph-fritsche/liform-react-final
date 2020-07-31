import React from 'react';
import PropTypes from 'prop-types'

export class PureOptions extends React.PureComponent {
    render() {
        return this.props.values && this.props.values.map((v,i) =>
            <option key={v} value={v}>
                { this.props.labels && this.props.labels[i] || v }
            </option>
        )
    }
}

PureOptions.propTypes = {
    values: PropTypes.arrayOf(PropTypes.string),
    labels: PropTypes.arrayOf(PropTypes.string),
}
