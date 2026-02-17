import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartNoData } from '../lib';

const RingChart = ({ data, height = 220, showNoData = true }) => {
  const hasData = data && data.length > 0 && !(data.length === 1 && data[0].name === 'Settled');

  if (!hasData && showNoData) {
    return <ChartNoData height={height} />;
  }
  if (!data || data.length === 0) {
    return showNoData ? <ChartNoData height={height} /> : null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, value }) => (name === 'Settled' ? 'Settled' : `${name}: $${value}`)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

RingChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      fill: PropTypes.string,
    })
  ),
  height: PropTypes.number,
  showNoData: PropTypes.bool,
};

RingChart.defaultProps = {
  data: [],
  height: 220,
  showNoData: true,
};

export default RingChart;
