import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartNoData } from '../lib';

const AreaChart = ({ data, height = 220, dataKey = 'cumulative', xAxisKey = 'label', showNoData = true }) => {
  const hasData = data && data.length > 0;

  if (!hasData && showNoData) {
    return <ChartNoData height={height} />;
  }
  if (!hasData) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cumulative']} labelFormatter={(l) => l} />
        <Area type="monotone" dataKey={dataKey} stroke="#1890ff" fill="#1890ff" fillOpacity={0.4} name="Cumulative" />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

AreaChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  height: PropTypes.number,
  dataKey: PropTypes.string,
  xAxisKey: PropTypes.string,
  showNoData: PropTypes.bool,
};

AreaChart.defaultProps = {
  data: [],
  height: 220,
  dataKey: 'cumulative',
  xAxisKey: 'label',
  showNoData: true,
};

export default AreaChart;
