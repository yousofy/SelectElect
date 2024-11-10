import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import './App.css';

function App() {
  const [search, setSearch] = useState();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Select Elect</h1>

        <div>
          <input></input>
          <a><CiSearch /></a>
        </div>



      </header>
    </div>
  );
}

export default App;
