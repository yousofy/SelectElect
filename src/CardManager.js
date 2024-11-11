import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

function CardManager({ courses }) {
    const navigate = useNavigate();

    const handleCardClick = (dept, code) => {
        // Navigate to the course details page with department and course code
        navigate(`/course-details/${dept}/${code.split(' ')[1]}`);
    };

    if (!Array.isArray(courses) || courses.length === 0) {
        return <h3>No courses available.</h3>;
    }

    return (
        <div className="course-list">
            {courses.map((course) => (
                <Card 
                    key={course._id} 
                    course={course} 
                    onClick={() => handleCardClick(course.dept, course.code)} 
                />
            ))}
        </div>
    );
}

export default CardManager;
