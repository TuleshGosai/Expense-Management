import React from 'react';
import PropTypes from 'prop-types';
import { EsEmpty } from 'components';
import './style.css';

/**
 * Shared empty state for charts. Centered content with icon and "No data" text.
 */
const ChartNoData = ({ height = 220, description = 'No data' }) => (
  <div className="chart-no-data" style={{ height }}>
    <EsEmpty description={description} image={EsEmpty.PRESENTED_IMAGE_SIMPLE} />
  </div>
);

ChartNoData.propTypes = {
  height: PropTypes.number,
  description: PropTypes.string,
};

export default ChartNoData;
