import { useEffect, useState, useNavigate } from 'react';
import VariationTable from './VariationTable'; 
import VariationClasses from './VariationClasses'; 
import "../style/FileOpener.css"; 
import AbnormalValues from './AbnormalValues';

function FileOpener() {
  const [fileData, setFileData] = useState(null);
  const [key, setKey] = useState(0);
  const [anomalies, setAnomalies] = useState([]);
  const [showAnomalies, setShowAnomalies] = useState(false);

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();

    reader.readAsText(selectedFile);

    reader.onload = e => {
      const fileContent = e.target.result;
      let dataFromFile = fileContent.split('\r\n');
      dataFromFile = dataFromFile.map(variant => parseFloat(variant));

      setFileData(dataFromFile);
      setKey(prevKey => prevKey + 1);
    };

    reader.onerror = e => {
      console.log("Помилка:", e.target.error);
    }
  };

  const handleFindAbnormal = () => {
    const sum = fileData.reduce((accum, currValue) => {
      accum += currValue;
      return accum;
    }, 0);
    const arithmeticalMean = sum / fileData.length;

    const S2 = fileData.reduce((accum, curr) => {
      accum += (curr - arithmeticalMean) ** 2
      return accum;
    }, 0) / (fileData.length - 1);
    const S = Math.sqrt(S2);

    const floor = arithmeticalMean - 1.96 * S;
    const ceil = arithmeticalMean + 1.96 * S;

    const abnormalValues = fileData.filter(el => el < floor || el > ceil);

    setAnomalies(abnormalValues);
    setShowAnomalies(true);
  }

  const handleRemoveAnomalies = () => {
    const filteredData = fileData.filter((el) => {
      return !anomalies.includes(el);
    });
  
    setFileData(filteredData);
    setAnomalies([]); 
    setShowAnomalies(false); 
  }
  

  const buttonContainerStyle = {
    marginTop: '50px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f5f5f5',
  };

  useEffect(()=>{
    setShowAnomalies(false);
  }, [fileData]);

  return (
    <div>
      <label htmlFor="file" style={{ cursor: 'pointer' }}>Оберіть файл: </label>
      <input type="file" id="file" onChange={handleFileChange}/>

      {fileData ? (
        <div>
          <div key={key} style={{ display: 'flex', justifyContent: 'space-around' }}>
            <VariationTable data={fileData} /> 
            <VariationClasses data={fileData} /> 
          </div>
          
          

          <div style={buttonContainerStyle}>
            <button onClick={handleFindAbnormal}>Пошук аномалій</button>

            {showAnomalies && (
              <div>
                <h2>Аномальні значення:</h2>
                <ul>
                  {anomalies.map((value, index) => (
                    <li key={index}>{value}</li>
                  ))}
                </ul>
                  
                <AbnormalValues data={fileData} anomalies={anomalies}/>

                <button onClick={handleRemoveAnomalies}>Видалити аномальні значення</button>

              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
}

export default FileOpener;