import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart, ComposedChart } from 'recharts';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  //exp( -(x - m) / s - exp( -(x - m) / s))
  const restoredDistributionDensityFunc = useSelector(state => state.restoredFunctions.distributionDensityFunc);
  const restoredM = useSelector(state => state.restoredFunctions.m);
  const restoredSigma = useSelector(state => state.restoredFunctions.sigma);
  console.log(restoredM);
  console.log(restoredSigma);
  //console.log(restoredDistributionDensityFunc); 

  const histogramData = dataList.map(item => ({...item, lowerBound: item.lowerBound+h/2, upperBound: item.upperBound+h/2, 
    y: (   (1/(n*bWindow)) * elList.reduce((accum, curr) => {accum +=KGauss((item.upperBound-curr-h/2)/bWindow); return accum;}, 0 ) * hClasses ),
    yR: ( Math.exp( -(item.lowerBound+h/2 - restoredM) / restoredSigma - Math.exp( -(item.lowerBound+h/2 - restoredM) / restoredSigma)) ) * 1
  })); 
  console.log(histogramData);
  // const histogramData = dataList.map(item => (
  //   {
  //   ...item, lowerBound: item.lowerBound+h/2, upperBound: item.upperBound+h/2
  //   }
  // )); 

  
  const minLowerBound = Math.min(...dataList.map(item => item.lowerBound));
  const maxUpperBound = Math.max(...dataList.map(item => item.upperBound));

  const maxPi = Math.max(...dataList.map(item => item.relativeFrequency));

  console.log(histogramData);



  return (
    <div style={{marginTop: '50px'}}>
      <b>Histogram</b>
      {/* data={histogramData} */}
      <ComposedChart barCategoryGap="0%" width={700} height={400}  data={histogramData} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="lowerBound"
          type="number"
          domain={[minLowerBound, maxUpperBound]}
          
        />
        <YAxis type="number" domain={[0, maxPi]}/>
        <Tooltip 
          formatter={(value, name, props) => {
            return [`limits: ${props.payload.limits}`];
          }}
        />
        <Legend />
        <Bar 
          dataKey="relativeFrequency" 
          fill="#8884d8" 
          stroke="black" 
          strokeWidth={1}    
        />
        <Line type="monotone" dataKey='y' stroke="#82ca9d" name="Density Func" />
        <Line type="monotone" dataKey='yR' stroke="#FF0000" name="Restored Density Func" />
        
      </ComposedChart>

      <LineChart width={700} height={400} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type='number' domain={[minLowerBound, maxUpperBound]} />
        <YAxis type='number' domain={[0, maxPi]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey='y' stroke="#8884d8" data={funcDistr} name="Density Func" />
        <Line type="monotone" dataKey='y' stroke="#FF0000" data={restoredDistributionDensityFunc} name="Restored Density Func" />
      </LineChart>


      
   

    </div>
  );
};

export default Histogram;