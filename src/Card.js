import React from 'react';
import './Card.css';

function Card({ course }) {
    return (
        <div className='course-card'>
            <h3 className='course-code'><strong>{course.code}</strong></h3>
            <h4 className='course-name'>{course.name}</h4>
            <p className='course-description'>{course.desc}</p>
            <p className='pre-req'><strong>Pre-Requisite: </strong> {course.prer == "" || course.prer == null ? "None" : course.prer}</p>
            <p className='co-req'><strong>Co-Requisite: </strong> {course.creq.length > 0 ? course.creq.join(', ') : 'None'}</p>
            <p className='course-credits'><strong>Credits:</strong> {course.cred}</p>
        </div>
    )
}

export default Card;