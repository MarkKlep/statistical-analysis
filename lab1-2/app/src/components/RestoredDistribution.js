import { LineChart, Line, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter } from "recharts";
import { useDispatch } from "react-redux";
import { getDistributionDensityFunc, getEmpericalDistributionFunc, getLinearizedFunc, getM, getSigma } from "../store/restoredFunctionsSlice";
import { useEffect } from "react";

const RestoredDistribution = ({ vibirka }) => {

  const dispatch = useDispatch();

  const n = vibirka.length;

  console.log("vibirka");
  console.log(vibirka);
  console.log(n);

  const jStat = require("jstat");
  const alpha = 0.05;
  const degreesOfFreedom = n - 1; 
  const tQuantile = jStat.studentt.inv(1 - alpha / 2, degreesOfFreedom);
  const mean = jStat.mean(vibirka);
  const stdDev = jStat.stdev(vibirka);
  console.log(`Квантиль стьюдента для alpha=${alpha} и ${degreesOfFreedom} степінь свободи: ${tQuantile}`);

  //∂ln(L(s, m))/∂s = ∑ [ -(1/s) + (x_i - m) / s^2 + (1/s^2) * exp( -(x_i - m) / s) ]
  //∂ln(L(s, m))/∂m = ∑ [ (1/s) * exp( -(x_i - m) / s) * (1 - (x_i - m) / s) ]

  const u = jStat.normal.inv(1 - alpha / 2, 0, 1);

  const xSquareStd = vibirka.reduce((accum, curr) => {
    accum += curr**2;
    return accum;
  }, 0) / n;

  const S = Math.sqrt(xSquareStd - mean**2);
  
  const gamma = 0.5772;
  const gamma2 = 1.978112;
  const gamma3 = 5.444874;
  const gamma4 = 23.561457;

  // const sigma = Math.sqrt( S / (gamma2 - gamma));
  // const m = mean - gamma * sigma;

  const m = mean - (gamma*Math.sqrt(6) / Math.PI) * S;
  const sigma = (Math.sqrt(6) / Math.PI) * S;

  const H1DerMean = 1 + 6 * (gamma / Math.PI**2) * ((m + gamma * sigma) / sigma); 
  const H1DerMean2 = (3 * gamma) / (Math.PI**2 * sigma);

  const H2DerMean = -6 * ((m + gamma * sigma) / (Math.PI**2 * sigma));
  const H2DerMean2 = 3 / (Math.PI**2 * sigma);

  const v1 = m + gamma * sigma;
  const v2 = m**2 + 2*m*sigma*gamma + sigma**2 * gamma2;
  const v3 = m**3 + 3*m**2*sigma*gamma + 3*m*sigma**2*gamma2 + sigma**3*gamma3;
  const v4 = m**4 + 4*m**3*sigma*gamma + 6*m**2*sigma**2*gamma2 + 4*m*sigma**3*gamma3 + sigma**4*gamma4;

  const cov = (v3 - v1*v2) / n;
  const Dmean = (v3 - v1**2) / n;
  const DMean2 = (v4 - v2**2) / n; 

  //!!!
  const Ds1 = H1DerMean**2 * Dmean + H1DerMean2**2 * DMean2 + 2 * H1DerMean * H1DerMean2 * cov;
  const Ds2 = H2DerMean**2 * Dmean + H2DerMean2**2 * DMean2 + 2 * H2DerMean * H2DerMean2 * cov;

  //!!!!!
  const TETA1start = m - u * Math.sqrt(Ds1);
  const TETA1end = m + u * Math.sqrt(Ds1);

  const TETA2start = sigma - u * Math.sqrt(Ds2);
  const TETA2end = sigma + u * Math.sqrt(Ds2);

  console.log('u = ' + u);
  console.log('Ds1 = ' + Ds1);
  console.log('Ds2 = ' + Ds2);

  const distributionDensityFunc = vibirka.map(el => (
    {
      x: el,
      y: Math.exp( -(el - m) / sigma - Math.exp( -(el - m) / sigma))
    }
  ));

  const empericalDistributionFunc = vibirka.map(el => (
    {
      x: el,
      y: Math.exp(-Math.exp( -(el - m) / sigma) )
    }
  ));

  const ecdf = function(value) {
    return vibirka.filter((item) => item <= value).length / n;
  }

  const linearizedFunc = vibirka.map(x => (
    {
      t: x, 
      z: -Math.log(Math.log(1/ecdf(x)))
    }
  ));

  const fixedLinearizedFunc = linearizedFunc.filter(el => isFinite(el.z));

  useEffect(() => {
    dispatch(getDistributionDensityFunc(distributionDensityFunc));
    dispatch(getEmpericalDistributionFunc(empericalDistributionFunc));
    dispatch(getLinearizedFunc(fixedLinearizedFunc));
    dispatch(getM(m));
    dispatch(getSigma(sigma));
  }, []);
  //distributionDensityFunc, empericalDistributionFunc, fixedLinearizedFunc

  const variants = [...new Set(vibirka)];

  const FminusFrPlus = variants.map((el, i) => Math.abs( ecdf(el) - empericalDistributionFunc[i].y ));
  const Dplus = Math.max(...FminusFrPlus);

  const FminusFrMinus = variants.slice(1).map((el, i) => {
    return Math.abs(ecdf(el) - empericalDistributionFunc[i].y);
  });
  
  const Dminus = Math.max(...FminusFrMinus);
  
  const z = Math.sqrt(n) * Math.max(Dminus, Dplus)
  console.log("z = " + z);

  let Kz = 1;
  for(let k = 1; k < 7; k++) {
    Kz += 2 * (Math.pow(-1, k) * Math.exp(-2 * k**2 * z**2))
  }

  const p = 1 - Kz;
  console.log("p = " + p);

  return (
    <div>

      <div>
        {`F(x) = exp(-exp( -(x - m) / s) )  |  `}
        {`f(x) = exp( -(x - m) / s - exp( -(x - m) / s))`}
      </div>

      <table>
        <thead>
          <tr>
            <td>Параметр</td>
            <td>Значення оцінки</td>
            <td>Середньоквадратичне відхилення оцінки</td>
            <td>95% довірчий інтервал</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>m</td>
            <td>{m.toFixed(4)}</td>
            <td>{Math.sqrt(Ds1).toFixed(4)}</td>
            <td>{`[${TETA1start.toFixed(4)} ; ${TETA1end.toFixed(4)}]`}</td>
          </tr>
          <tr>
            <td>s</td>
            <td>{sigma.toFixed(4)}</td>
            <td>{Math.sqrt(Ds2).toFixed(4)}</td>
            <td>{`[${TETA2start.toFixed(4)} ; ${TETA2end.toFixed(4)}]`}</td>
          </tr>
        </tbody>
      </table>

      {/* <LineChart width={700} height={400} data={distributionDensityFunc} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type='number' />
        <YAxis type='number' />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey='y' stroke="#82ca9d" />
      </LineChart>
      
      <LineChart width={700} height={400} data={empericalDistributionFunc} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type='number' />
        <YAxis type='number' />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey='y' stroke="#82ca9d" />
      </LineChart>

      <ScatterChart  width={800} height={400} data={fixedLinearizedFunc}>
        <XAxis type='number' dataKey="t" />
        <YAxis type='number' />
        <CartesianGrid stroke="#f5f5f5" />
        <Tooltip />
        <Legend />

        <Scatter dataKey="z" stroke="green"  />

      </ScatterChart > */}

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <span>z = {z.toFixed(8)}</span>
        <span>Kz = {Kz.toFixed(8)}</span>
        <span>p = {p.toFixed(8)}</span>
        <span>alpha = {alpha}</span>
      </div>
      <div>
        {
          p >= alpha ? (
            <b>Розподіл вірогідний</b>
          ) : (
            <b>Розподіл НЕ вірогідний</b>
          )
        }
      </div>

    </div>
  )
}

export default RestoredDistribution;