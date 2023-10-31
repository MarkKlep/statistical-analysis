import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ECDF = () => {

  const {data} = useParams();
  const elements = JSON.parse(data);

  console.log(elements);

  const ecdfValues = elements.map((element) => {
    const count = elements.filter((e) => e <= element).length;
    return { x: element, y: count / elements.length };
  });

  const restoredECDF = useSelector(state => state.restoredFunctions.empericalDistributionFunc);
  console.log(restoredECDF);
  return (
    <div style={{ marginTop: '50px' }}>
      <b>F*{'('}x{')'}</b>
      <LineChart width={700} height={400} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} />
        <YAxis type="number" />
        <Legend />
        <Tooltip />
        <Line type="step" dataKey="y" data={ecdfValues} stroke="#8884d8" dot={true} name="ECDF Values" />
        <Line type="step" dataKey="y" data={restoredECDF} stroke="#FF0000" dot={true} name="Restored CDF" />
      </LineChart>
    </div>
    // <div style={{marginTop: '50px'}}>
    //   <b>F*{'\('}x{'\)'}</b>
    //   <LineChart width={700} height={400} data={ecdfValues} >
    //     <Line type="step" dataKey="y" stroke="#8884d8" dot={true} />
    //     <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} />
    //     <YAxis type="number"/>
    //     <Legend/>
    //     <Tooltip/>
    //     <CartesianGrid strokeDasharray="3 3"/>
    //   </LineChart>
    // </div>
  )
}

export default ECDF;