import React from 'react';
function Card({ course }) {
    return (
        <div className='course-card'>
            <h3><strong>{course.code}</strong> {course.name}</h3>
            <h4>{course.name}</h4>
            <p><strong>Description: </strong> {course.desc}</p>
            <p><strong>Pre-Requisite: </strong> {course.prer == "" || course.prer == null ? "None" : course.prer}</p>
            <p><strong>Co-Requisite: </strong> {course.creq.length > 0 ? course.creq.join(', ') : 'None'}</p>
            <p><strong>Credits:</strong> {course.cred}</p>
        </div>
    )
}

export default Card;