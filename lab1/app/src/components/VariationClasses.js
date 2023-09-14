import { useState, useEffect, useRef } from "react";
import {Link, Outlet, useNavigate } from "react-router-dom";

function VariationClasses ({ data }) {
  const [classesList, setClassesList] = useState([]);
  const [M, setM] = useState(Math.floor(1 + 3.32 * Math.log10(data.length))); 
  const Xmin = Math.min(...data);
  const Xmax = Math.max(...data);
  const n = data.length;
  const mean =  data.reduce((accum, curr)=>{
    accum += curr;
    return accum;
  }, 0) / n;
  const S2 = data.reduce((accum, curr)=>{
    accum += (curr - mean)**2
    return accum;
  }, 0) / (n - 1);
  const S = Math.sqrt(S2);
  const [b, setB] = useState((S)*Math.pow(0.75*n, -1/5));

  const navigate = useNavigate();
  const refUpdateHistogram = useRef(-1);

  useEffect(() => {
    if (refUpdateHistogram.current > 0) {
        navigate(`/lab1/histogram/${JSON.stringify(classesList)}/${JSON.stringify(data)}/${b}/${(Xmax - Xmin) / M}`);
    }
    refUpdateHistogram.current++;
  }, [classesList, b]);

  useEffect(() => {   
    data.sort((a, b) => a - b);
    // const Xmin = data[0];
    // const Xmax = data[data.length - 1];
    const h = (Xmax - Xmin) / M;

    const classBoundaries = [];
    for (let i = 1; i < M + 1; i++) {
        const lowerBound = parseFloat((Xmin + (i - 1) * h).toFixed(4));
        const upperBound = parseFloat((lowerBound + h).toFixed(4));
        classBoundaries.push({ lowerBound, upperBound });
    }

    function computeFrequency(lowerBound, upperBound){
        let n = 0; 
        data.forEach(number => {
            if (number >= lowerBound && number <= upperBound) {
                n++;
            }
        })
        return n;
    }

    const ecdf = ceil => {
        return data.filter(el => el <= ceil).length / data.length;
    }

    setClassesList( //set - async f 
        classBoundaries.map((wide, index) => {
            return {
                lowerBound: wide.lowerBound,
                upperBound: wide.upperBound,
                limits: index !== classBoundaries.length-1 ? `[${wide.lowerBound}; ${wide.upperBound})` : `[${wide.lowerBound}; ${wide.upperBound}]`,
                frequency: computeFrequency(wide.lowerBound, wide.upperBound),
                relativeFrequency: parseFloat(computeFrequency(wide.lowerBound, wide.upperBound) / data.length).toFixed(4),
                ECDF: parseFloat(ecdf(wide.upperBound)).toFixed(4)
            }
        })
    );

  }, [data, M]);


  return (
    <div>
      <table>
        <thead>
            <tr>
                <td colSpan='5'>Ряд, розбитий на класи</td>
            </tr>
        </thead>
        <tbody>
          <tr>
            <td>Номер класу</td>
            <td>Межі класу</td>
            <td>Частота</td>
            <td>Відносна частота</td>
            <td>Значення емпіричної ф-ї розподілу</td>
          </tr>
        </tbody>
        <tfoot>
            {
                classesList.map((item, index) => 
                    <tr key={index}>
                        <td>&#8470; {index + 1}</td>
                        <td>{item.limits}</td>
                        <td>{item.frequency}</td>
                        <td>{item.relativeFrequency}</td>
                        <td>{item.ECDF}</td>
                    </tr>    
                )
            }
            <tr>
                <td colSpan='5' style={{margin:'5px'}}>
                    <span style= {{padding: '5px'}}>Кількість класів:</span>
                    <input
                        min={0}
                        max={50}
                        value={M}
                        type="number"
                        onChange={(e) => setM(parseInt(e.target.value))}
                        onKeyDown={e=>e.preventDefault()}
                    />
                    <span style= {{padding: '5px'}}>Значення ширини вікна:</span>
                    <input
                        value={b}
                        type="text"
                        onChange={(e) => setB(parseFloat(e.target.value))}
                    />
                </td>
            </tr>
        </tfoot>
      </table>

      <nav style={{display: 'flex', justifyContent: 'space-around'}}>
        <Link to={`/lab1/histogram/${JSON.stringify(classesList)}/${JSON.stringify(data)}/${b}/${(Xmax - Xmin) / M}`}>
            Гістограма даних
        </Link>
        <Link to={`/lab1/ecdf/${JSON.stringify(data)}`}>
            Емпірична ф-я розподілу
        </Link>
        <Link to={`/lab1/indicators/${JSON.stringify(data)}`}>
            Таблиця незсунених кількісних х-к показника
        </Link>
      </nav>

      <Outlet/>

    </div>
  )
}

export default VariationClasses;
