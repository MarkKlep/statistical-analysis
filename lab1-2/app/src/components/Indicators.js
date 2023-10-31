import { useParams } from "react-router-dom";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend,Scatter, ScatterChart, Brush, ResponsiveContainer } from 'recharts';
import RestoredDistribution from "./RestoredDistribution";
import { useState } from "react";
import { useSelector } from "react-redux";

const Indicators = () => {
  const [isIdentified, setIsIdentified] = useState(false);

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

  //-------------------------------------------------------------------
  //console.log("\n=======viborka=======\n");
  //console.log(dataList);

  const ecdf = function(value) {
    return dataList.filter((item) => item <= value).length / dataList.length;
  }

  const variants = [...new Set(dataList)];
  //console.log("\n==============varianti==============\n");
  //console.log(variants);
  const coordinatesProbPaper = variants.filter((_, index)=>index !== variants.length - 1);

  //ймов. папір
  const dots = coordinatesProbPaper.map((x) => {
    return {x, y: jStat.normal.inv(ecdf(x), 0, 1)};
  });

  //console.log("\n==============coordinates==============\n");
  //console.log(dots);
  //console.log(jStat.normal.inv(ecdf(variants[variants.length-1]), 0, 1));

  //------------------------------------------------------------------LAB2---------------------------------------------------------------//
  //Extreme values distribution
  //const XiFx = dataList.filter((_, index) => index !== variants.length - 1);
  const distrIdentifier = dataList.map(x => {
    return { t: x, z: -Math.log(Math.log(1/ecdf(x))) }
  });

  //console.log("\n==============distrIdentifier==============\n");
  //console.log(distrIdentifier);

  const fixedDistrIdentifier = distrIdentifier.filter(el => isFinite(el.z));
  const viborka = fixedDistrIdentifier.map(el => el.t);

  //console.log("\n==============fixedDistrIdentifier==============\n");
  //console.log(fixedDistrIdentifier);

  const maxValueVibirka = Math.max(...dataList);
  const minValueVibirka = Math.min(...dataList);

  const restoredLinearizedFunc = useSelector(state => state.restoredFunctions.linearizedFunc);
  console.log(restoredLinearizedFunc);

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
          <div>
            <p>Дані вказують на нормальний розподіл.</p>
            <p>tA = {tA}</p>
            <p>tE = {tE}</p>
          </div>
          
        ) : (
          <div>
            <p>Дані <b>НЕ</b> вказують на нормальний розподіл.</p>
            <p>tA = {tA}</p>
            <p>tE = {tE}</p>
          </div>
   
        )}
      </div>

      
      <div>
        <div><b>Ймовірністний папір</b></div>
        <ScatterChart  width={800} height={400} >
          <XAxis type='number' dataKey="x" domain={[minValueVibirka, maxValueVibirka]} />
          <YAxis type='number' />
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip/>
          <Legend />

          <Scatter dataKey="y" stroke="#8884d8" data={dots} />
          {/* <Scatter dataKey="y" stroke="#FF0000" data={restoredLinearizedFunc} /> */}
            
        </ScatterChart >
      </div>

      <div>
        <div>Лінеаризований графік ф-ї розподілу найбільших значень</div>
        <ScatterChart  width={800} height={400} >
          <XAxis type='number' dataKey="t" domain={[minValueVibirka, maxValueVibirka]}/>
          <YAxis type='number' />
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip />
          <Legend />

          <Scatter dataKey="z" stroke="green"  data={fixedDistrIdentifier} />
          <Scatter dataKey="z" stroke="#FF0000" data={restoredLinearizedFunc} />

        </ScatterChart >

        <div style={{display: 'flex', gap: '10px', marginTop: '70px'}}>
          <span>Розподіл ідентифіковано?</span>
          <button onClick={()=>setIsIdentified(true)}>Так</button>
          <button onClick={()=>setIsIdentified(false)}>Закрити</button>
          {isIdentified && <RestoredDistribution vibirka = {viborka} />}

        </div>

      </div>       
   

    </div>
  )
}

export default Indicators;