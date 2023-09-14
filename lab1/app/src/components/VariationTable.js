import "../style/ValidationTable.css"
import { useState, useEffect } from "react";

function VariationTable({ data }) {
  const [variationList, setVariationList] = useState([]);
  
  useEffect(() => {

    data.sort((a, b) => a - b);

    const frequencyMap = {};

    data.forEach((value) => {
      if (frequencyMap[value]) {
        frequencyMap[value]++;
      } 
      else {
        frequencyMap[value] = 1;
      }
    });
    
    const variants = [...new Set(data)];

    const ecdf = function(value) {
      //if(value <= variants[0]) return 0;
      //if(value >= variants[variants.length - 1]) return 1;
      return data.filter((item) => item <= value).length / data.length;
    }

    setVariationList( 
      variants.map(value => (
        {
          value,
          frequency: frequencyMap[value], 
          relativeFrequency: parseFloat((frequencyMap[value]) / data.length).toFixed(4),
          ECDF: parseFloat(ecdf(value)).toFixed(4)
        }
      ))
    );
  }, [data]);

  return (
    <div style={{maxHeight: '800px', overflow: 'scroll'}}>

      <table>
        <thead>
          <tr>
            <td colSpan='5'>Варіаційний ряд</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Номер варіанти</td>
            <td>Варіанта</td>
            <td>Частота</td>
            <td>Відносна частота</td>
            <td>Значення емпіричної ф-ї розподілу</td>
          </tr>
        </tbody>
        <tfoot>
          {
            variationList.map((variant, index) => 
              <tr key={index}>
                <td>&#8470; {index + 1}</td>
                <td>{variant.value}</td>
                <td>{variant.frequency}</td>
                <td>{variant.relativeFrequency}</td>
                <td>{variant.ECDF}</td>
              </tr>
            )
          }
        </tfoot>
      </table>

      
      
    </div>
  );
}

export default VariationTable;