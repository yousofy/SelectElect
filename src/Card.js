import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Card.css';

function Card({ course, searchTerm }) {
    const navigate = useNavigate();

    // Function to highlight search terms
    const highlightText = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} style={{ backgroundColor: '#ffeb3b', color: '#000', fontWeight: 'bold' }}>
                    {part}
                </mark>
            ) : part
        );
    };

    const handleClick = () => {
        // Pass the course details as state to the CourseDetails route
        navigate(`/course-details/${course.dept}/${course.code.split(' ')[1]}`, {
            state: {
                courseDescription: course.desc,
                prerequisites: course.prer,
                corequisites: course.creq,
                credits: course.cred,
                courseName: course.name,
            }
        });
    };

    return (
        <div className='course-card' onClick={handleClick}>
            <h3 className='course-code'><strong>{highlightText(course.code, searchTerm)}</strong></h3>
            <h4 className='course-name'>{highlightText(course.name, searchTerm)}</h4>
            <p className='course-description'>{highlightText(course.desc, searchTerm)}</p>
            <p className='pre-req'><strong>Pre-Requisite: </strong> {(course.prer == "" || course.prer == null) ? "None" : course.prer}</p>
            <p className='co-req'><strong>Co-Requisite: </strong> {course.creq.length > 0 ? course.creq.join(', ') : 'None'}</p>
            <p className='course-credits'><strong>Credits: </strong> {(course.cred == "" || course.cred == null) ? "None" : course.cred}</p>
        </div>
    )
}

export default Card;
