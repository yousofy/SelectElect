import { useState, useEffect } from 'react';
import { CiSearch } from 'react-icons/ci';
import { TbTruckLoading } from "react-icons/tb";
import { IoMdArrowDropdown } from "react-icons/io";
import './App.css';
import CardManager from './CardManager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseDetails from './CourseDetails';
import { data as courseData } from './course_information.js';

// Transform the courseData to match the expected structure
const transformedCourses = Object.entries(courseData).map(([courseCode, course]) => {
  const [dept, code] = courseCode.split(' ');
  return {
    _id: course._id || courseCode,
    dept: dept,
    code: courseCode,
    name: course.name,
    desc: course.desc,
    prer: course.prer,
    creq: course.creq || [],
    cred: course.cred
  };
});

function App() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [courseDepts, setCourseDepts] = useState([]);
  const [courseNumbers, setCourseNumbers] = useState([]);
  const [selectedDeptFilters, setSelectedDeptFilters] = useState([]);
  const [selectedNumberFilters, setSelectedNumberFilters] = useState([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOption, setSortOption] = useState('name'); // Default sort by name

  useEffect(() => {
    // Populate unique department names based on all available courses initially
    const uniqueDepts = Array.from(new Set(transformedCourses.map(course => course.dept))).sort();
    setCourseDepts(uniqueDepts);

    // Populate unique first digits of course numbers based on all available courses initially
    const uniqueNumbers = Array.from(new Set(transformedCourses.map(course => course.code.split(' ')[1][0]))).sort();
    setCourseNumbers(uniqueNumbers);

    // Auto-focus search bar on page load
    document.getElementById('search-bar')?.focus();
  }, []);

  // Update filter options based on current search results
  useEffect(() => {
    if (hasSearched && courses.length > 0) {
      const uniqueDepts = Array.from(new Set(courses.map(course => course.dept))).sort();
      setCourseDepts(uniqueDepts);

      const uniqueNumbers = Array.from(new Set(courses.map(course => course.code.split(' ')[1][0]))).sort();
      setCourseNumbers(uniqueNumbers);
    }
  }, [courses, hasSearched]);

  const handleSearchClick = () => {
    try {
      setIsFiltering(true);
      setLoading(true);
      setHasSearched(true);
      
      // Filter courses based on search term
      const filteredCourses = transformedCourses.filter(course => 
        course.name.toLowerCase().includes(search.toLowerCase()) || 
        (course.desc && course.desc.toLowerCase().includes(search.toLowerCase())) ||
        course.code.toLowerCase().includes(search.toLowerCase())
      );
      setCourses(filteredCourses);
    } catch (error) {
      console.error('Error filtering courses:', error);
    } finally {
      setIsFiltering(false);
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setCourses([]);
    setSelectedDeptFilters([]);
    setSelectedNumberFilters([]);
    setHasSearched(false);
    // Reset filter options to show all available when cleared
    const uniqueDepts = Array.from(new Set(transformedCourses.map(course => course.dept))).sort();
    setCourseDepts(uniqueDepts);
    const uniqueNumbers = Array.from(new Set(transformedCourses.map(course => course.code.split(' ')[1][0]))).sort();
    setCourseNumbers(uniqueNumbers);
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

  // Sort the filtered courses based on the selected sort option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortOption) {
      case 'code':
        return a.code.localeCompare(b.code);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'credits-low':
        return (a.cred || 0) - (b.cred || 0);
      case 'credits-high':
        return (b.cred || 0) - (a.cred || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="App">
      <h1>Welcome to SelectElect</h1>
      <div className='search-container'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
          placeholder="Search by course code, name, or description..."
          id="search-bar"
        />
        <a onClick={handleSearchClick} className='search-button'>
          <CiSearch style={{ cursor: 'pointer' }} className='search-icon' />
        </a>
      </div>

      <div className="filter-container">
        <p>Filter By:</p>

        <div className="dropdown">
          <div className="dropdown-box">
            <button onClick={() => setShowDeptDropdown(!showDeptDropdown)}>
              <span>Department</span>
              <IoMdArrowDropdown className='dropdown-icon' />
            </button>
          </div>
          {showDeptDropdown && (
            <div className="dropdown-content">
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
          )}
        </div>

        <div className="dropdown">
          <div className="dropdown-box">
            <button onClick={() => setShowNumberDropdown(!showNumberDropdown)}>
              <span>Course Number</span>
              <IoMdArrowDropdown className='dropdown-icon' />
            </button>
          </div>
          {showNumberDropdown && (
            <div className="dropdown-content">
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
          )}
        </div>

        <p>Sort By:</p>

        <div className="dropdown">
          <div className="dropdown-box">
            <button onClick={() => setShowSortDropdown(!showSortDropdown)}>
              <span>Sort by {
                sortOption === 'name' ? 'Name' :
                sortOption === 'code' ? 'Course Code' :
                sortOption === 'credits-low' ? 'Credits (Low-High)' :
                sortOption === 'credits-high' ? 'Credits (High-Low)' : 'Name'
              }</span>
              <IoMdArrowDropdown className='dropdown-icon' />
            </button>
          </div>
          {showSortDropdown && (
            <div className="dropdown-content">
              <label>
                <input
                  type="radio"
                  name="sort"
                  value="name"
                  onChange={(e) => setSortOption(e.target.value)}
                  checked={sortOption === 'name'}
                />
                Sort by Name
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  value="code"
                  onChange={(e) => setSortOption(e.target.value)}
                  checked={sortOption === 'code'}
                />
                Sort by Course Code
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  value="credits-low"
                  onChange={(e) => setSortOption(e.target.value)}
                  checked={sortOption === 'credits-low'}
                />
                Credits (Low to High)
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  value="credits-high"
                  onChange={(e) => setSortOption(e.target.value)}
                  checked={sortOption === 'credits-high'}
                />
                Credits (High to Low)
              </label>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="loading-container">
        <p className='loading-text'>Currently Searching For Your Courses</p>
        <TbTruckLoading className='loading-icon' />
      </div>}

      {!loading && !isFiltering && hasSearched && (
        <>
          <div className="search-results-count">
            <p>Found {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}</p>
          </div>
          <CardManager courses={sortedCourses} searchTerm={search} />
        </>
      )}
    </div>
  );
}

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/course-details/:dept/:course" element={<CourseDetails />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
