import React, { useState } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from '../authentication/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  
  // Keep track of which question we're on
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Store all user information
  const [user, setUser] = useState({
    name: '', sex: 'NULL', age: '', weight: '', height: 'NULL', email: '', password: ''
  });

  // If user is already logged in, go to dashboard
  if (auth.isAuthenticated) return <Navigate to="/dashboard" />;

  // List of all questions and their properties
  const questions = [
    { question: 'What is your name?', id: 'name', type: 'text', placeholder: "'Shrek'" },
    { question: 'What is your height?', id: 'height', type: 'select', options: ['5\'0', '5\'1', '5\'2', '5\'3', '5\'4', '5\'5', '5\'6', '5\'7', '5\'8', '5\'9', '5\'10', '5\'11', '6\'0', '6\'1', '6\'2', '6\'3', '6\'4', '6\'5', '6\'6', '6\'7', '6\'8', '6\'9', '6\'10', '6\'11'] },
    { question: 'What is your weight?', id: 'weightID', type: 'number', placeholder: "(lbs)" },
    { question: 'What is your age?', id: 'ageID', type: 'number', placeholder: "(years)" },
    { question: 'What is your sex?', id: 'sex', type: 'select', options: ['Male', 'Female'] },
    { question: 'What is your email?', id: 'emailID', type: 'email', placeholder: "we don't spam" },
    { question: 'Choose Password.', id: 'passwordID', type: 'password', placeholder: "(6 characters)" },
  ];

  // Rules for checking if each answer is valid
  const validators = {
    name: (value) => /^[A-Za-z]+$/.test(value),
    height: (value) => value !== 'NULL',
    weightID: (value) => value >= 10 && value <= 1000,
    ageID: (value) => value >= 1 && value <= 120,
    sex: (value) => value !== 'NULL',
    emailID: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(value),
    passwordID: (value) => value.length >= 6,
  };

  // Update user info when an input changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle form submission for each question
  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentField = questions[currentQuestion].id;
    
    // Check if the current answer is valid
    if (!validators[currentField](user[currentField])) {
      // If not valid, clear the input and ask to try again
      document.getElementById(currentField).value = '';
      document.getElementById(currentField).placeholder = 'try again';
      return;
    }

    // If not the last question, move to the next one
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // If it's the last question, try to sign up the user
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        process.env.REACT_APP_BACKEND_URL
        if (response.ok) {
          const data = await response.json();
          await login(data.user, data.token, data.refreshToken);
          navigate("/dashboard");
        } else {
          console.error('Signup failed');
        }
      } catch (error) {
        console.error('Error during signup:', error);
      }
    }
  };

  // Create the right type of input for each question
  const renderInput = ({ type, id, placeholder, options }) => {
    switch (type) {
      case 'select':
        return (
          <select name={id} id={id} onChange={handleChange} value={user[id]}>
            <option value="NULL">{`(${id})`}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      default:
        return <input type={type} id={id} name={id} placeholder={placeholder} onChange={handleChange} />;
    }
  };

  // The main component UI
  return (
    <div className="SignUp">
      <div id="box" className='box'>
        <div id='question' className='question'>
          {questions.map((question, index) => {
            if (index === currentQuestion) {
              return (
                <div className='mid' key={question.question}>
                  <h1>{question.question}</h1>
                  <form onSubmit={handleSubmit}>
                    {renderInput(question)}
                    <div className='done'>
                      <button type='submit'>
                        {currentQuestion === questions.length - 1 ? 'SUBMIT' : 'NEXT'}
                      </button>
                    </div>
                  </form>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default SignUp;