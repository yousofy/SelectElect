import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { TbTruckLoading } from "react-icons/tb";
import './App.css';
import CardManager from './CardManager';

function App() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchClick = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/getAllCourses?search=${search}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Data fetched:', data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
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

        {loading && <div className="loading-container">
          <p>Currently Searching For Your Courses</p>
          <TbTruckLoading />
        </div>}

        {!loading && <CardManager courses={courses} />}
      </header>
    </div>
  );
}

export default App;