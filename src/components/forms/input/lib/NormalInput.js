/**
 * EsNormalInput – custom text input.
 * Wraps antd Input with optional label, required indicator, and error message.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { TextArea } = Input;

const EsNormalInput = (props) => {
  const {
    id,
    label: _label,
    requiredentry: _requiredentry,
    error,
    errormsg,
    placeholder,
    placeholdertext,
    textarea,
    rows,
    value,
    onChange,
    onKeyPress,
    maxLength,
    style,
    width,
    disabled,
    ...rest
  } = props;

  const placeholderValue = placeholder || placeholdertext;

  const inputCommonProps = {
    id,
    placeholder: placeholderValue,
    value,
    onChange,
    onKeyPress,
    maxLength,
    disabled,
    style: width ? { ...style, width } : style,
    ...rest,
  };

  return (
    <>
      {textarea ? (
        <TextArea
          data-testid={`es_normal_input_textarea_${id}`}
          autoComplete="off"
          rows={rows || 3}
          {...inputCommonProps}
        />
      ) : (
        <Input
          data-testid={`es_normal_input_${id}`}
          autoComplete="off"
          {...inputCommonProps}
        />
      )}
      {error && errormsg != null && (
        <div className="es-input-error" data-testid={`es_normal_input_err_${id}`} style={{ width }}>
          {errormsg}
          {errormsg !== '' && <sup>*</sup>}
        </div>
      )}
    </>
  );
};

EsNormalInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  requiredentry: PropTypes.bool,
  error: PropTypes.bool,
  errormsg: PropTypes.string,
  placeholder: PropTypes.string,
  placeholdertext: PropTypes.string,
  textarea: PropTypes.bool,
  rows: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
  maxLength: PropTypes.number,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
};

EsNormalInput.defaultProps = {
  requiredentry: false,
  error: false,
  errormsg: '',
  textarea: false,
};

export default EsNormalInput;
