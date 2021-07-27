import React from 'react'

export const PureOption = React.memo(
    function PureOption(
        {
            value,
            title,
        }: {
            value: string
            title?: string
        },
    ): React.ReactElement {
        return <option value={value}>
            {title || value}
        </option>
    },
)

