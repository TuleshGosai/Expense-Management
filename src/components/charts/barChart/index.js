import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartNoData } from '../lib';

/**
 * Horizontal bar chart for top expenses.
 * data: [{ name, amount }]
 */
const BarChart = ({
  data,
  height = 220,
  dataKey = 'amount',
  nameKey = 'name',
  barColor = '#722ed1',
  showNoData = true,
}) => {
  const hasData = data && data.length > 0;

  if (!hasData && showNoData) {
    return <ChartNoData height={height} />;
  }

  if (!hasData) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey={nameKey} width={80} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
        <Bar dataKey={dataKey} fill={barColor} radius={[0, 4, 4, 0]} name="Amount" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      amount: PropTypes.number,
    })
  ),
  height: PropTypes.number,
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  barColor: PropTypes.string,
  showNoData: PropTypes.bool,
};

BarChart.defaultProps = {
  data: [],
  height: 220,
  dataKey: 'amount',
  nameKey: 'name',
  barColor: '#722ed1',
  showNoData: true,
};

export default BarChart;
