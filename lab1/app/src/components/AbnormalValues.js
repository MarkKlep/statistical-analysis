import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceArea } from 'recharts';

const AbnormalValues = ({ data, anomalies }) => {

  const list = [...new Set(data)];

  const notAnomalies = list.filter((el) => {
    return !anomalies.includes(el);
  })

  const floor = notAnomalies[0];
  const ceil = notAnomalies[notAnomalies.length - 1];

  const chartData = list.map((el, index) => ({index, value: el}));

  return (
    <LineChart width={800} height={400} data={chartData}>
      <XAxis type='number' dataKey="index" />
      <YAxis type='number'/>
      <CartesianGrid stroke="#f5f5f5" />
      <Tooltip />
      <Legend />

      <Line type="monotone" dataKey="value" stroke="#8884d8" />
      {/* <ReferenceLine y={floor} stroke="green" label={`Floor: ${floor}`} />
      <ReferenceLine y={ceil} stroke="green" label={`ceil: ${ceil}`} /> */}

      <ReferenceArea y1={floor} y2={ceil} fill="green" stroke='orange' strokeWidth={1}/>
    
    </LineChart>
  )
}

export default AbnormalValues;