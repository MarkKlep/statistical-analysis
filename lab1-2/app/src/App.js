import './App.css';
import {Link, Routes, Route} from 'react-router-dom';
import FileOpener from './components/FileOpener';
import HomePage from './components/HomePage';
import PageNotFound from './components/PageNotFound';
import Histogram from './components/Histogram';
import ECDF from "./components/ECDF";
import Indicators from './components/Indicators';

function App() {
  
  return(
    <div className='App'>

      <header>
        <Link to='/'>Home Page</Link>
        <Link to='/lab1'>Варіаційний ряд та класи</Link>
      </header>

      <Routes>
        <Route index path='/' element={<HomePage/>}/>
        <Route path='/lab1' element={<FileOpener/>}>
          <Route path='histogram/:data/:elements/:b/:h' element={<Histogram/>}/>
          <Route path='ecdf/:data' element={<ECDF/>}/>
          <Route path='indicators/:data' element={<Indicators/>}/>
        </Route>
        <Route path='*' element={<PageNotFound/>}/>
      </Routes>



    </div>
  );

}

export default App;