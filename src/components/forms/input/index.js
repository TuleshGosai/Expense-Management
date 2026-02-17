/**
 * EsInput – unified input by type.
 * Renders label + required asterisk + appropriate input (normal, password).
 */
import React from 'react';
import PropTypes from 'prop-types';
import EsNormalInput from './lib/NormalInput';
import EsPasswordInputDefault from './lib/PasswordInput';
import './forms-input.scss';

const INPUT_TYPES = {
  normal: EsNormalInput,
  password: EsPasswordInputDefault,
};

const EsInput = (props) => {
  const { inputtype = 'normal', label, requiredentry, width, id, ...rest } = props;
  const Component = INPUT_TYPES[inputtype] || EsNormalInput;

  return (
    <div className="es-input-wrapper" data-testid={`es_input_wrapper_${id}`} style={{ width }}>
      {label != null && label !== '' && (
        <div className="es-input-label" data-testid={`es_input_label_${id}`}>
          {label}
          {requiredentry && <sup>*</sup>}
        </div>
      )}
      <Component id={id} width={width} {...rest} />
    </div>
  );
};

EsInput.propTypes = {
  inputtype: PropTypes.oneOf(['normal', 'password']),
  label: PropTypes.string,
  requiredentry: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
};

EsInput.defaultProps = {
  inputtype: 'normal',
  requiredentry: false,
};

export default EsInput;
export { default as EsNormalInput } from './lib/NormalInput';
export { default as EsPasswordInput } from './lib/PasswordInput';
