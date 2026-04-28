// --- HYBRID VERSION (Local Static DB + Live UBCGrades API) ---

let transformedCourses = []; 
let courses =[]; 
let hasSearched = false;
let searchQuery = '';

// Filter & Sort State
let courseDepts = [];
let courseNumbers = [];
let selectedDeptFilters = [];
let selectedNumberFilters =[];
let sortOption = 'name';

// DOM Elements
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const clearSearchBtn = document.getElementById('clear-search-btn');
const contentDept = document.getElementById('content-dept');
const contentNum = document.getElementById('content-num');
const sortLabel = document.getElementById('sort-label');
const loadingContainer = document.getElementById('loading-container');
const resultsCount = document.getElementById('search-results-count');
const courseList = document.getElementById('course-list');
const homeView = document.getElementById('home-view');
const detailsView = document.getElementById('details-view');

// 1. Initialize Application - Load Local Data
function init() {
  try {
    if (typeof window.courseData === 'undefined') {
      document.body.innerHTML = `<h2 style="color:red; text-align:center; margin-top:50px;">Error: Local data not loaded.<br>Make sure the first line of course_information.js is exactly:<br><code>window.courseData = {</code></h2>`;
      return;
    }

    transformedCourses = Object.entries(window.courseData).map(([courseCode, course]) => {
      const parts = courseCode.split(' ');
      const dept = parts[0] ? parts[0].trim() : 'Unknown';
      const numPart = parts.length > 1 ? parts[1].trim() : '000';

      return {
        _id: course._id || courseCode,
        dept: dept,
        code: courseCode,
        numPart: numPart,
        name: course.name || 'No Name Provided',
        desc: course.desc || '',
        prer: course.prer || (Array.isArray(course.preq) ? course.preq.join(', ') : course.preq) || '',
        creq: Array.isArray(course.creq) ? course.creq :[],
        cred: course.cred || '',
        avg: 0, past_avg: 0, max: 0, min: 0
      };
    });

    updateFilterOptions(transformedCourses);
    setupDropdowns();
    setupEventListeners();
    searchBar.focus();

  } catch (error) {
    document.body.innerHTML = `<h2 style="color:red; text-align:center; margin-top:50px;">A critical error occurred initializing the data:<br>${error.message}</h2>`;
    console.error(error);
  }
}

// 2. Setup standard UI logic
function updateFilterOptions(sourceData) {
  courseDepts = Array.from(new Set(sourceData.map(c => c.dept))).sort();
  courseNumbers = Array.from(new Set(sourceData.map(c => c.numPart.charAt(0) || '0'))).sort();
  renderFilterDropdowns();
}

function setupDropdowns() {
  const dropdowns =[
    { btn: 'btn-dept', content: 'content-dept' },
    { btn: 'btn-num', content: 'content-num' },
    { btn: 'btn-sort', content: 'content-sort' }
  ];

  dropdowns.forEach(d => {
    document.getElementById(d.btn).addEventListener('click', (e) => {
      e.stopPropagation();
      dropdowns.forEach(other => {
        if (other.content !== d.content) document.getElementById(other.content).classList.remove('show');
      });
      document.getElementById(d.content).classList.toggle('show');
    });
  });

  window.addEventListener('click', () => {
    dropdowns.forEach(d => document.getElementById(d.content).classList.remove('show'));
  });
}

function renderFilterDropdowns() {
  contentDept.innerHTML = courseDepts.map(dept => `
    <label>
      <input type="checkbox" value="${dept}" ${selectedDeptFilters.includes(dept) ? 'checked' : ''} onchange="handleDeptToggle('${dept}')">
      ${dept}
    </label>
  `).join('');

  contentNum.innerHTML = courseNumbers.map(num => `
    <label>
      <input type="checkbox" value="${num}" ${selectedNumberFilters.includes(num) ? 'checked' : ''} onchange="handleNumToggle('${num}')">
      ${num}xx
    </label>
  `).join('');
}

window.handleDeptToggle = (dept) => {
  selectedDeptFilters.includes(dept) ? selectedDeptFilters = selectedDeptFilters.filter(d => d !== dept) : selectedDeptFilters.push(dept);
  applyFiltersAndRender();
};

window.handleNumToggle = (num) => {
  selectedNumberFilters.includes(num) ? selectedNumberFilters = selectedNumberFilters.filter(n => n !== num) : selectedNumberFilters.push(num);
  applyFiltersAndRender();
};

function setupEventListeners() {
  searchButton.addEventListener('click', handleSearch);
  searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  clearSearchBtn.addEventListener('click', () => {
    searchBar.value = '';
    searchQuery = '';
    hasSearched = false;
    courses = [];
    selectedDeptFilters = [];
    selectedNumberFilters =[];
    courseList.innerHTML = '';
    resultsCount.style.display = 'none';
    clearSearchBtn.style.display = 'none';
    updateFilterOptions(transformedCourses);
  });

  document.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      sortOption = e.target.value;
      const labels = {
        'name': 'Name', 'code': 'Course Code', 'avg-low': 'Average (Low to High)', 'avg-high': 'Average (High to Low)', 'credits-low': 'Credits (Low-High)', 'credits-high': 'Credits (High-Low)'
      };
      sortLabel.innerText = `Sort by ${labels[sortOption]}`;
      applyFiltersAndRender();
    });
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    detailsView.style.display = 'none';
    homeView.style.display = 'flex';
  });
}

// 3. Main Hybrid Search Function
async function handleSearch() {
  searchQuery = searchBar.value.trim().toUpperCase().replace(/([A-Z])(\d)/g, '$1 $2');
  if (!searchQuery) return;
  
  courseList.innerHTML = '';
  resultsCount.style.display = 'none';
  loadingContainer.style.display = 'flex';
  clearSearchBtn.style.display = 'block';

  const queryTokens = searchQuery.split(' ').filter(t => t.length > 0);
  
  // Look for courses in the local JSON file first!
  let filteredByQuery = transformedCourses.filter(course => {
    const textToSearch = `${course.code} ${course.name} ${course.desc}`.toUpperCase();
    return queryTokens.every(token => textToSearch.includes(token));
  });

  if (filteredByQuery.length === 0) {
    loadingContainer.style.display = 'none';
    resultsCount.innerHTML = `<p>Found 0 courses</p>`;
    resultsCount.style.display = 'block';
    courseList.innerHTML = '<h3>No courses match your search.</h3>';
    return;
  }

  // Cap at 250 results. 
  const renderLimit = filteredByQuery.slice(0, 250);

  // We fetch grades in "chunks" of 50 to prevent crashing the UBCGrades API
  const chunkSize = 50;
  const statsResults = [];
  
  for (let i = 0; i < renderLimit.length; i += chunkSize) {
    const chunk = renderLimit.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(c => 
      fetch(`https://ubcgrades.com/api/v3/course-statistics/UBCV/${c.dept}/${c.numPart}`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
    );
    const chunkRes = await Promise.all(chunkPromises);
    statsResults.push(...chunkRes);
  }

  // Merge the grades back into the local courses
  // NOTE: If statsResults[index] is null (no data on API), the course STILL stays in the list!
  renderLimit.forEach((course, index) => {
    const s = statsResults[index];
    if (s) {
      course.avg = s.average ? Number(s.average.toFixed(2)) : 0;
      course.past_avg = s.average_past_5_yrs ? Number(s.average_past_5_yrs.toFixed(2)) : 0;
      course.max = s.max_course_avg ? Number(s.max_course_avg.toFixed(2)) : 0;
      course.min = s.min_course_avg ? Number(s.min_course_avg.toFixed(2)) : 0;
    }
  });

  courses = renderLimit;
  hasSearched = true;
  
  updateFilterOptions(courses);
  loadingContainer.style.display = 'none';
  applyFiltersAndRender(filteredByQuery.length > 250);
}

// 4. Render Engine
function applyFiltersAndRender(cappedWarning = false) {
  if (!hasSearched) return;

  const filtered = courses.filter(course => 
    (selectedDeptFilters.length === 0 || selectedDeptFilters.includes(course.dept)) &&
    (selectedNumberFilters.length === 0 || selectedNumberFilters.includes(course.numPart.charAt(0)))
  );

  filtered.sort((a, b) => {
    switch (sortOption) {
      case 'code': return a.code.localeCompare(b.code);
      case 'name': return a.name.localeCompare(b.name);
      case 'avg-low': return a.avg - b.avg;
      case 'avg-high': return b.avg - a.avg;
      case 'credits-low': return (Number(a.cred) || 0) - (Number(b.cred) || 0);
      case 'credits-high': return (Number(b.cred) || 0) - (Number(a.cred) || 0);
      default: return 0;
    }
  });

  let countText = `Found ${filtered.length} matching course${filtered.length !== 1 ? 's' : ''}`;
  if (cappedWarning) countText += ` (Displaying top 250 matches. Please add more keywords to narrow search).`;
  
  resultsCount.innerHTML = `<p>${countText}</p>`;
  resultsCount.style.display = 'block';

  if (filtered.length === 0) {
    courseList.innerHTML = '<h3>No courses match your active dropdown filters.</h3>';
    return;
  }

  // Render cards displaying local descriptions alongside API grades
  courseList.innerHTML = filtered.map(course => `
    <div class="course-card" onclick="openDetails('${course.code}')">
      <h3 class="course-code"><strong>${highlightText(course.code, searchQuery)}</strong></h3>
      <h4 class="course-name">${highlightText(course.name, searchQuery)}</h4>
      <p class="course-description">${highlightText(course.desc, searchQuery) || 'No description available.'}</p>
      <p class="pre-req"><strong>Pre-Requisite: </strong> ${(!course.prer) ? "None" : highlightText(course.prer, searchQuery)}</p>
      <p class="co-req"><strong>Co-Requisite: </strong> ${course.creq.length > 0 ? highlightText(course.creq.join(', '), searchQuery) : 'None'}</p>
      <div class="meta-container">
        <span class="meta-badge">Credits: ${course.cred || 'N/A'}</span>
        <span class="meta-badge avg">Historical Avg: ${course.past_avg ? course.past_avg + '%' : 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

function highlightText(text, term) {
  if (!term || !text) return text;
  const terms = term.split(' ').filter(t => t.length > 1);
  let highlighted = text.toString();
  terms.forEach(t => {
    try {
      const safeTerm = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeTerm})`, 'gi');
      highlighted = highlighted.replace(regex, `<mark>$1</mark>`);
    } catch (e) {}
  });
  return highlighted;
}

// 5. Details View - Fetching Session Specific API Data
window.openDetails = async (courseCode) => {
  const course = courses.find(c => c.code === courseCode);
  if (!course) return;

  homeView.style.display = 'none';
  detailsView.style.display = 'block';
  
  document.getElementById('details-content').innerHTML = `
    <h2>${course.code}</h2>
    <h3>${course.name}</h3>
    <p>${course.desc || 'No description available.'}</p>
    
    <div style="margin: 25px 0;">
      <p class="pre-req"><strong>Pre-requisites:</strong> ${(!course.prer) ? "None" : course.prer}</p>
      <p class="co-req"><strong>Co-requisites:</strong> ${course.creq.length > 0 ? course.creq.join(', ') : 'None'}</p>
    </div>

    <div class="meta-container" style="border-top: none; padding-top: 0; margin-bottom: 30px;">
        <span class="meta-badge">Credits: ${course.cred || 'N/A'}</span>
        <span class="meta-badge avg">Overall Historical Average: ${course.past_avg ? course.past_avg + '%' : 'N/A'}</span>
    </div>
  `;

  document.getElementById('details-loading').style.display = 'block';
  document.getElementById('stats-container').style.display = 'none';
  document.getElementById('no-stats-msg').style.display = 'none';
  
  // Look for the most recent potential data points from UBCGrades
  const urls =[
    `https://ubcgrades.com/api/v3/grades/UBCV/2025W/${course.dept}/${course.numPart}`,
    `https://ubcgrades.com/api/v3/grades/UBCV/2025S/${course.dept}/${course.numPart}`,
    `https://ubcgrades.com/api/v3/grades/UBCV/2024W/${course.dept}/${course.numPart}`,
    `https://ubcgrades.com/api/v3/grades/UBCV/2024S/${course.dept}/${course.numPart}`,
    `https://ubcgrades.com/api/v3/grades/UBCV/2023W/${course.dept}/${course.numPart}`
  ];

  try {
    const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.ok ? res.json() : null)));
    
    const stats = responses
      .filter(res => res)
      .map(response => {
        const overall = response.find(section => section.section === 'OVERALL');
        if (overall) {
          return {
            yearSession: `${overall.year}${overall.session}`,
            average: overall.average ? overall.average.toFixed(2) : 'N/A',
            low: overall.low,
            high: overall.high,
            reported: overall.reported
          };
        }
        return null;
      })
      .filter(item => item !== null);

    const tbody = document.getElementById('stats-tbody');
    document.getElementById('details-loading').style.display = 'none';
    document.getElementById('stats-container').style.display = 'block';

    if (stats.length > 0) {
      document.querySelector('.course-stats-table').style.display = 'table';
      tbody.innerHTML = stats.map(s => `
        <tr>
          <td>${s.yearSession}</td>
          <td>${s.average}%</td>
          <td>${s.low}%</td>
          <td>${s.high}%</td>
          <td>${s.reported}</td>
        </tr>
      `).join('');
    } else {
      document.querySelector('.course-stats-table').style.display = 'none';
      document.getElementById('no-stats-msg').style.display = 'block';
    }

  } catch (err) {
    document.getElementById('details-loading').style.display = 'none';
    document.getElementById('no-stats-msg').style.display = 'block';
  }
};

window.onload = init;