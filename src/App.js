import { useState, useEffect } from 'react';
import { CiSearch } from 'react-icons/ci';
import { TbTruckLoading } from "react-icons/tb";
import './App.css';
import CardManager from './CardManager';

function App() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [courseDepts, setCourseDepts] = useState([]);
  const [courseNumbers, setCourseNumbers] = useState([]);
  const [selectedDeptFilters, setSelectedDeptFilters] = useState([]);
  const [selectedNumberFilters, setSelectedNumberFilters] = useState([]);

  useEffect(() => {
    // Populate unique department names based on fetched courses
    const uniqueDepts = Array.from(new Set(courses.map(course => course.dept)));
    setCourseDepts(uniqueDepts);

    // Populate unique first digits of course numbers based on fetched courses
    const uniqueNumbers = Array.from(new Set(courses.map(course => course.code.split(' ')[1][0]))).sort();
    setCourseNumbers(uniqueNumbers);
  }, [courses]);

  const handleSearchClick = async () => {
    try {
      setIsFiltering(true);
      setLoading(true);
      const response = await fetch(`http://localhost:4000/getAllCourses?search=${search}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsFiltering(false);
      setLoading(false);
    }
  };

  const handleDeptFilterChange = (dept) => {
    setSelectedDeptFilters((prevFilters) =>
      prevFilters.includes(dept)
        ? prevFilters.filter(filter => filter !== dept)
        : [...prevFilters, dept]
    );
  };

  const handleNumberFilterChange = (number) => {
    setSelectedNumberFilters((prevFilters) =>
      prevFilters.includes(number)
        ? prevFilters.filter(filter => filter !== number)
        : [...prevFilters, number]
    );
  };

  const filteredCourses = courses.filter(course =>
    (selectedDeptFilters.length === 0 || selectedDeptFilters.includes(course.dept)) &&
    (selectedNumberFilters.length === 0 || selectedNumberFilters.includes(course.code.split(' ')[1][0]))
  );

  return (
    <div className="App">
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

      <div className="filter-container">
        <h4>Filter by Department:</h4>
        {courseDepts.map((dept) => (
          <label key={dept}>
            <input
              type="checkbox"
              value={dept}
              onChange={() => handleDeptFilterChange(dept)}
              checked={selectedDeptFilters.includes(dept)}
            />
            {dept}
          </label>
        ))}
      </div>

      <div className="filter-container">
        <h4>Filter by Course Number:</h4>
        {courseNumbers.map((number) => (
          <label key={number}>
            <input
              type="checkbox"
              value={number}
              onChange={() => handleNumberFilterChange(number)}
              checked={selectedNumberFilters.includes(number)}
            />
            {number}xx
          </label>
        ))}
      </div>
      {loading && <div className="loading-container">
        <p className='loading-text'>Currently Searching For Your Courses</p>
        <TbTruckLoading className='loading-icon' />
      </div>}

      {!loading && !isFiltering && <CardManager courses={filteredCourses} />}
    </div>
  );
}

export default App;
