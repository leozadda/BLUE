import React from 'react';
import './ErrorScreen.css';
import { useNavigate } from 'react-router-dom';

function ErrorScreen() {
    const navigate = useNavigate(); // Hook to get the navigate function

    return (
        <div className='ErrorScreen'>
            <p className='ErrorMessage'>
                Sorry, we are bad engineers.
            </p>
            <button onClick={() => navigate("/dashboard")}>Go back</button>
        </div>
    );
}

export default ErrorScreen;
