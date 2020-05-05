import React, { Children } from "react";

const FormFrame = props => {
  return (
    <div className='form'>{Children.only(props.children)}</div>
  );
};

export { FormFrame };
