/**
 * EsButton – custom button.
 * Wraps antd Button with consistent loading/disabled handling and optional id/title.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import './forms-button.scss';

const EsButton = (props) => {
  const {
    type,
    id,
    title,
    children,
    loading,
    disabled,
    onClick,
    style = {},
    className = '',
    ...rest
  } = props;

  const isDisabled = loading || disabled;
  const classNames = [
    'es-button',
    isDisabled ? 'es-button--disabled' : '',
    loading ? 'es-button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    const el = document.getElementById(id || 'es-button');
    if (el) el.blur();
    if (onClick) onClick();
  };

  return (
    <Button
      id={id || 'es-button'}
      type={type}
      loading={loading}
      disabled={isDisabled}
      onClick={handleClick}
      style={style}
      className={classNames}
      data-testid={`es_button_${id || 'default'}`}
      {...rest}
    >
      {title != null && title !== '' ? title : children}
    </Button>
  );
};

EsButton.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  title: PropTypes.node,
  children: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
};

EsButton.defaultProps = {
  loading: false,
  disabled: false,
};

export default EsButton;
