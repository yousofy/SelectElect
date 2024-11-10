import React from 'react';
import Card from './Card';

function CardManager({ courses }) {
    if (!Array.isArray(courses) || courses.length === 0) {
        return <h3>No courses available.</h3>;
    }

    return (
        <div className="course-list">
            {courses.map((course) => (
                <Card key={course._id} course={course} />
            ))}
        </div>
    )
}

export default CardManager;