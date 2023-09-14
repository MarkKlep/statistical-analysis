import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useParams } from 'react-router-dom';

const ECDF = () => {

  const {data} = useParams();
  const elements = JSON.parse(data);

  console.log(elements);

  const ecdfValues = elements.map((element) => {
    const count = elements.filter((e) => e <= element).length;
    return { x: element, y: count / elements.length };
  });

  return (
    <div style={{marginTop: '50px'}}>
      <b>F*{'\('}x{'\)'}</b>
      <LineChart width={700} height={400} data={ecdfValues} >
        <Line type="step" dataKey="y" stroke="#8884d8" dot={true} />
        <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} />
        <YAxis type="number"/>
        <Legend/>
        <Tooltip/>
        <CartesianGrid strokeDasharray="3 3"/>
      </LineChart>
    </div>
  )
}

export default ECDF;