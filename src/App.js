import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import './App.css';

function App() {
  const [search, setSearch] = useState();
  const [courses, setCourses] = useState([]);

  const handleSearchClick = async () => {
    try {
      const response = await fetch('/getAllCourses'); // API call to your server
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Select Elect</h1>
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for courses..."
          />
          <a onClick={handleSearchClick}>
            <CiSearch style={{ cursor: 'pointer' }} />
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;