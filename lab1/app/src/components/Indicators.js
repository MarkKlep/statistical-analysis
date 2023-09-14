import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,Scatter, ScatterChart } from 'recharts';

const Indicators = () => {

  const {data} = useParams();
  const dataList = JSON.parse(data);
  const sum = dataList.reduce((accum, currValue) => {
    accum += currValue;
    return accum;
  }, 0);
  const arithmeticalMean = (sum / dataList.length);
  const middleIndex = Math.floor(dataList.length / 2);
  const median = (dataList.length % 2 === 0 ? (dataList[middleIndex] + dataList[middleIndex + 1]) / 2 : dataList[middleIndex]);

  const _S2 = dataList.reduce((accum, curr)=>{
    accum += (curr - arithmeticalMean)**2
    return accum;
  }, 0) / dataList.length;
  const S = Math.sqrt(_S2);

  const E = ( ( 1 / (dataList.length * S**4) ) * dataList.reduce((accum, curr) => {
    accum += (curr - arithmeticalMean)**4;
    return accum;
  } ,0) - 3 );

  const A = ( (1 / (dataList.length*(S**3))) * dataList.reduce((accum, curr) => {
    accum += (curr - arithmeticalMean)**3;
    return accum;
  }, 0) );


  const sigmaS = (S/Math.sqrt(2 * dataList.length));
  const sigmaA = ( Math.sqrt(6 * (dataList.length -2 ) / ((dataList.length + 1) * (dataList.length + 3)) ));
  const sigmaE = Math.sqrt(24*dataList.length*(dataList.length-2)*(dataList.length-3)) / ( (dataList.length+1)**2 * (dataList.length+3)*(dataList.length+5) );


  const jStat = require('jstat');
  const confidenceLevel = 0.95; // Рівень довіри 95%
  const degreesOfFreedom = dataList.length - 1; // Ступені свободи для розподілу Стьюдента
  const tValue = jStat.studentt.inv(1 - (1 - confidenceLevel)/2, degreesOfFreedom);
 
  const j = Math.round(dataList.length / 2 - 1.96 * (Math.sqrt(dataList.length) / 2));
  const k = Math.round(dataList.length / 2 + 1 + 1.96 * (Math.sqrt(dataList.length) / 2));
  const Xj = dataList[j]; 
  const Xk = dataList[k]; 

  //[==================================================]
  const _S2notMoved = dataList.reduce((accum, curr)=>{
    accum += (curr - arithmeticalMean)**2
    return accum;
  }, 0) / (dataList.length - 1);
  const SnotMoved = Math.sqrt(_S2notMoved);
  const sigmaSnotMoved = (SnotMoved/Math.sqrt(2 * dataList.length));

  const sigmaArithmeticalMean = (SnotMoved/Math.sqrt(dataList.length));

  const EnotMoved = ( (dataList.length**2 - 1) / ((dataList.length - 2)*(dataList.length - 3)) ) * (E + 6/(dataList.length+1));
  const n = dataList.length;
  const sigmaEnotMoved = Math.sqrt((24*n*(n-1)*(n-1)) /((n-3)*(n-2)*(n+3)*(n+5)));

  const AnotMoved = ( Math.sqrt(dataList.length*(dataList.length-1)) / (dataList.length - 2) ) * A;
  const sigmaAnotMoved = Math.sqrt((6*n*(n-1)) / ((n-2)*(n+1)*(n+3)));

  //NormalDistribution help constant
  const tA = AnotMoved / sigmaAnotMoved;
  const tE = EnotMoved / sigmaEnotMoved;

  //ймов. папір
  const mean = jStat.mean(dataList);
  const stdDev = jStat.stdev(dataList);

  const ecdf = function(value) {
    return dataList.filter((item) => item <= value).length / data.length;
  }

  const dots = dataList.map((x) => {
    //console.log(jStat.normal.inv(ecdf(x), mean, stdDev));
    return {x: x, y: jStat.normal.inv(ecdf(x), mean, stdDev)};
  });

  return (
    <div style={{marginTop: '50px'}}>
      <table>
        <thead>
            <tr>
                <td colSpan="4">Показники вибірки |незсунені|</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Характеристика</td>
                <td>Оцінка</td>
                <td>Середньоквадратичне відхилення оцінки</td>
                <td>95% довірчий інтервал для характеристики</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td>Середнє арифметичне</td>
                <td>{arithmeticalMean.toFixed(4)}</td>
                <td>{sigmaArithmeticalMean.toFixed(4)}</td>
                <td>{`[${parseFloat(arithmeticalMean - tValue * sigmaArithmeticalMean).toFixed(4)}; ${(arithmeticalMean+tValue * sigmaArithmeticalMean).toFixed(4)}]`}</td>
            </tr>
            <tr>
                <td>Med</td>
                <td>{median.toFixed(4)}</td>
                <td>-</td>
                <td>{`[${Xj.toFixed(4)}; ${Xk.toFixed(4)}]`}</td>
            </tr>
            <tr>
              <td>Середньоквадратичне відхилення</td>
              <td>{SnotMoved.toFixed(4)}</td>
              <td>{sigmaSnotMoved.toFixed(4)}</td>
              <td>{`[${parseFloat(SnotMoved-tValue*sigmaSnotMoved).toFixed(4)}; ${parseFloat(SnotMoved+tValue*sigmaSnotMoved).toFixed(4)}]`}</td>
            </tr>
            <tr>
              <td>Коефіцієнт асиметрії</td>
              <td>{AnotMoved.toFixed(4)}</td>
              <td>{sigmaAnotMoved.toFixed(4)}</td>
              <td>{`[${parseFloat(AnotMoved-tValue*sigmaAnotMoved).toFixed(4)}; ${parseFloat(AnotMoved+tValue*sigmaAnotMoved).toFixed(4)}]`}</td>
            </tr>
            <tr>
              <td>Коефіцієнт ексцесу</td>
              <td>{EnotMoved.toFixed(4)}</td>
              <td>{sigmaEnotMoved.toFixed(4)}</td>
              <td>{`[${parseFloat(EnotMoved-tValue*sigmaEnotMoved).toFixed(4)}; ${parseFloat(EnotMoved+tValue*sigmaEnotMoved).toFixed(4)}]`}</td>
            </tr>
            <tr>
              <td>Мінімум</td>
              <td>{dataList[0]}</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Максимум</td>
              <td>{dataList[dataList.length - 1]}</td>
              <td>-</td>
              <td>-</td>
            </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: '50px' }}>
        {(Math.abs(tA) <= tValue && Math.abs(tE) <= tValue)  ? (
          <p>Дані вказують на нормальний розподіл.</p>
        ) : (
          <p>Дані <b>НЕ</b> вказують на нормальний розподіл.</p>
        )}
      </div>

      <div>
        <ScatterChart  width={800} height={400} data={dots}>
          <XAxis type='number' dataKey="x" />
          <YAxis type='number'/>
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip />
          <Legend />

          <Scatter  type="monotone" dataKey="y" stroke="#8884d8" />
      
      </ScatterChart >
      </div>

    </div>
  )
}

export default Indicators;