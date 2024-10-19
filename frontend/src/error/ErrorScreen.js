import React from 'react';
import './ErrorScreen.css';

function ErrorScreen() {

    return(
        <div className='ErrorScreen'>
            <p className='ErrorMessage'>
                Sorry, you don't have access to this page.
            </p>
        </div>
    );
}

export default ErrorScreen;
