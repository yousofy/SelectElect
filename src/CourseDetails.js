import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './CourseDetails.css'; // Ensure you have the appropriate CSS for styling

const CourseDetails = () => {
  const { dept, course } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    courseDescription,
    prerequisites,
    corequisites,
    credits,
    courseName
  } = location.state || {}; // Get the passed state or default to an empty object

  const [sessionStats, setSessionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const urls = [
          `https://ubcgrades.com/api/v3/grades/UBCV/2024W/${dept}/${course}`,
          `https://ubcgrades.com/api/v3/grades/UBCV/2024S/${dept}/${course}`,
          `https://ubcgrades.com/api/v3/grades/UBCV/2023W/${dept}/${course}`,
          `https://ubcgrades.com/api/v3/grades/UBCV/2023S/${dept}/${course}`
        ];

        const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.ok ? res.json() : null)));

        const stats = responses
          .filter(response => response)
          .map(response => {
            const overallSection = response.find(section => section.section === 'OVERALL');
            if (overallSection) {
              return {
                yearSession: `${overallSection.year}${overallSection.session}`,
                average: overallSection.average ? overallSection.average.toFixed(2) : 'N/A',
                low: overallSection.low,
                high: overallSection.high,
                reported: overallSection.reported
              };
            }
            return null;
          })
          .filter(item => item !== null);

        setSessionStats(stats);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [dept, course]);

  return (
    <div className="course-details-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
        style={{
          backgroundColor: '#264261',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '20px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      >
        ← Back to Search
      </button>
      
      {loading ? (
        <p>Loading course details...</p>
      ) : (
        <div>
          <h2>{dept} {course}</h2>
          <h3>{courseName}</h3>
          <p>{courseDescription}</p>
          <p><strong>Pre-requisites:</strong> {(prerequisites == "" || prerequisites == null) ? "None" : prerequisites}</p>
          <p><strong>Co-requisites:</strong> {corequisites.length > 0 ? corequisites.join(', ') : 'None'}</p>
          <p><strong>Credits:</strong> {(credits == "" || credits == null) ? "None" : credits}</p>
          <h4>Session Statistics:</h4>
          {sessionStats.length > 0 ? (
            <table className="course-stats-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Average (%)</th>
                  <th>Low (%)</th>
                  <th>High (%)</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {sessionStats.map(({ yearSession, average, low, high, reported }) => (
                  <tr key={yearSession}>
                    <td>{yearSession}</td>
                    <td>{average}</td>
                    <td>{low}</td>
                    <td>{high}</td>
                    <td>{reported}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No session statistics available for this course.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
