import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, Layer, ResponsiveContainer, ComposedChart, ReferenceLine  } from 'recharts';
import { useParams } from 'react-router-dom';

const Histogram = () => {
  const { data, elements, b, h } = useParams();
  const dataList = JSON.parse(data);
  const bWindow = parseFloat(b);
  const elList = JSON.parse(elements);
  const hClasses = parseFloat(h);
  //KDE
  const KGauss = (u) => {
    return ( (1/Math.sqrt(2*Math.PI)) * Math.exp(-(u**2)/2) );
  } 

  const n = elList.length;


  const funcDistr = elList.map((el) => {
    return {
      x: el,
      y: (   (1/(n*bWindow)) * elList.reduce((accum, curr) => {accum +=KGauss((el-curr)/bWindow); return accum;}, 0 ) * hClasses )
    }
  });


  const histogramData = dataList.map(item => ({...item, lowerBound: item.lowerBound+h/2, upperBound: item.upperBound+h/2, 
    y: (   (1/(n*bWindow)) * elList.reduce((accum, curr) => {accum +=KGauss((item.upperBound-curr)/bWindow); return accum;}, 0 ) * hClasses )
  })); 
  
  const minLowerBound = Math.min(...dataList.map(item => item.lowerBound));
  const maxUpperBound = Math.max(...dataList.map(item => item.upperBound));

  console.log(histogramData);

  return (
    <div style={{marginTop: '50px'}}>
      <b>Histogram</b>

      <ComposedChart  data={histogramData}  barCategoryGap="0%" width={700} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="lowerBound"
          type="number"
          domain={[minLowerBound, maxUpperBound]}
          
        />
        <YAxis type="number" domain={[0, 1]}/>
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'limits') {
              return [`limits: ${value}`, `relativeFrequency: ${props.payload.relativeFrequency}`];
            }
            return [`relativeFrequency: ${value}`, `limits: ${props.payload.limits}`];
            }}
        />
        <Legend />
        <Bar 
          dataKey="relativeFrequency" 
          fill="#8884d8" 
          stroke="black" 
          strokeWidth={1}    
        />
        <Line type="monotone" dataKey='y' stroke="#82ca9d" />
        
      </ComposedChart >

      <LineChart width={700} height={400} data={funcDistr} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type='number' domain={[minLowerBound, maxUpperBound]} />
        <YAxis type='number' domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey='y' stroke="#82ca9d" />
      </LineChart>


      
   

    </div>
  );
};

export default Histogram;