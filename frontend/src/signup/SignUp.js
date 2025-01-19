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
    username: '', cm: 'NULL', kg: '', age: '', sex: 'NULL', email: '', password: ''
  });
  
  // If user is already logged in, go to dashboard
  if (auth.isAuthenticated) return <Navigate to="/dashboard" />;

  // List of all questions and their properties
  const questions = [
    { question: 'What is your First Name?', id: 'username', type: 'text', placeholder: "'shrek'" },
    { question: 'What is your height?', id: 'cm', type: 'number', placeholder: "(cm)" },
    { question: 'What is your weight?', id: 'kg', type: 'number', placeholder: "(kg)" },
    { question: 'What is your age?', id: 'age', type: 'number', placeholder: "(years)" },
    { question: 'What is your sex?', id: 'sex', type: 'select', options: ['male', 'female'] },
    { question: 'What is your email?', id: 'email', type: 'email', placeholder: "we don't spam" },
    { question: 'Choose Password.', id: 'password', type: 'password', placeholder: "(6 characters)" },
  ];

  // Rules for checking if each answer is valid
  const validators = {
    username: (value) => /^[A-Za-z]+$/.test(value),
    cm: (value) => value >= 50 && value <= 250,
    kg: (value) => value >= 20 && value <= 450,
    age: (value) => value >= 1 && value <= 120,
    sex: (value) => value !== 'NULL',
    email: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(value),
    password: (value) => value.length >= 6,
  };
  
  // Update user info when an input changes
    const handleChange = (e) => {
      const { name, value } = e.target;
    
      setUser(prevUser => ({
        ...prevUser,
        [name]: name === 'age' || name === 'kg' ? Number(value) : value
      }));
    };

  // Update user info when an input changes
  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentField = questions[currentQuestion].id;
  
    if (!validators[currentField](user[currentField])) {
      document.getElementById(currentField).value = '';
      document.getElementById(currentField).placeholder = 'try again';
      return;
    }
  
    // If it's the last question, convert units and submit the data
    if (currentQuestion === questions.length - 1) {
      try {
        // 1. First create the user account
        const response = await fetch(`https://www.b-lu-e.com/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        if (response.ok) {
          const data = await response.json();
          // Store auth data
          await login(data.user, data.token, data.refreshToken);
          
          // 2. Then create Stripe checkout session
          try {
            const checkoutResponse = await fetch(`https://www.b-lu-e.com/create-checkout-session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}` // Include auth token if needed
              },
              body: JSON.stringify({
                lookup_key: 'prod_RZWrP07xc8c8mh'
              }),
            });
            
            if (checkoutResponse.ok) {
              const session = await checkoutResponse.json();
              // 3. Redirect to Stripe Checkout
              window.location.href = session.url;
              // Note: Don't navigate to dashboard here - Stripe will handle the redirect after payment
            } else {
              console.error('Failed to create checkout session');
            }
          } catch (error) {
            console.error('Error creating checkout session:', error);
          }
        } else {
          console.error('Signup failed');
        }
      } catch (error) {
        console.error('Error during signup:', error);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
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