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
        <h1>Welcome to SelectElect</h1>
        <div className='search-container'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for courses..."
            id="search-bar"
          />
          <a onClick={handleSearchClick} className='search-button'>
            <CiSearch style={{ cursor: 'pointer' }} className='search-icon' />
          </a>
        </div>

        {loading && <div className="loading-container">
          <p className='loading-text'>Currently Searching For Your Courses</p>
          <TbTruckLoading className='loading-icon' />
        </div>}

        {!loading && <CardManager courses={courses} />}
      </header>
    </div>
  );
}

export default App;