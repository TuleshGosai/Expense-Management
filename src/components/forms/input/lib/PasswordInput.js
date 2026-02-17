/**
 * EsPasswordInput – custom password input.
 * Wraps antd Input.Password with optional label and error message.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const EsPasswordInput = (props) => {
  const {
    id,
    placeholder,
    placeholdertext,
    value,
    onChange,
    error,
    errormsg,
    maxLength,
    style,
    width,
    ...rest
  } = props;

  const placeholderValue = placeholder || placeholdertext;

  return (
    <>
      <Input.Password
        data-testid={`es_password_input_${id}`}
        id={id}
        autoComplete="off"
        placeholder={placeholderValue}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        style={width ? { ...style, width } : style}
        {...rest}
      />
      {error && errormsg != null && (
        <div className="es-input-error" data-testid={`es_password_input_err_${id}`} style={{ width }}>
          {errormsg}
          {errormsg !== '' && <sup>*</sup>}
        </div>
      )}
    </>
  );
};

EsPasswordInput.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  placeholdertext: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  errormsg: PropTypes.string,
  maxLength: PropTypes.number,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

EsPasswordInput.defaultProps = {
  error: false,
  errormsg: '',
};

export default EsPasswordInput;
