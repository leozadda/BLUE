import React, { useState } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from '../authentication/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  
  // Keep track of which question we're on
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Track measurement system
  const [measurementSystem, setMeasurementSystem] = useState('metric');
  
  // Track validation errors
  const [validationError, setValidationError] = useState('');
  
  // Store all user informationa
  const [user, setUser] = useState({
    username: '', cm: 'NULL', kg: '', age: '', sex: 'NULL', 
    email: '', password: '', 
    height: { metric: 'NULL', imperial: { feet: '', inches: '' } },
    weight: { metric: '', imperial: { lbs: '' } }
  });
  
  // If user is already logged in AND has completed payment, go to dashboard
  if (auth.isAuthenticated && auth.hasCompletedPayment) {
    return <Navigate to="/dashboard" />;
  }

  // List of all questions with enhanced properties
  const questions = [
    { 
      question: 'What is your First Name?', 
      id: 'username', 
      type: 'text', 
      placeholder: "'shrek'",
      errorMessage: 'Name must contain only letters'
    },
    { 
      question: 'How do you measure things?', 
      id: 'measure system', 
      type: 'select', 
      options: ['metric', 'imperial'],
      skipValidation: true
    },
    { 
      question: measurementSystem === 'metric' 
        ? 'What is your height?' 
        : 'What is your height?', 
      id: 'height', 
      type: measurementSystem === 'metric' ? 'number' : 'height-imperial',
      placeholder: measurementSystem === 'metric' ? "(cm)" : "(ft' in\")",
      errorMessage: measurementSystem === 'metric'
        ? 'Height must be between 50 and 250 cm'
        : 'Please enter a valid height'
    },
    { 
      question: 'What is your weight?', 
      id: 'weight', 
      type: measurementSystem === 'metric' ? 'number' : 'weight-imperial',
      placeholder: measurementSystem === 'metric' ? "(kg)" : "(lbs)",
      errorMessage: measurementSystem === 'metric'
        ? 'Weight must be between 20 and 450 kg'
        : 'Please enter a valid weight'
    },
    { 
      question: 'What is your age?', 
      id: 'age', 
      type: 'number', 
      placeholder: "(years)",
      errorMessage: 'Age must be between 1 and 120'
    },
    { 
      question: 'What is your sex?', 
      id: 'sex', 
      type: 'select', 
      options: ['male', 'female'],
      errorMessage: 'Please select your sex'
    },
    { 
      question: 'What is your email?', 
      id: 'email', 
      type: 'email', 
      placeholder: "we don't spam",
      errorMessage: 'Please enter a valid email address'
    },
    { 
      question: 'Choose Password.', 
      id: 'password', 
      type: 'password', 
      placeholder: "(6 characters)",
      errorMessage: 'Password must be at least 6 characters'
    },
  ];

  // Enhanced validators with more specific error handling
  const validators = {
    username: (value) => /^[A-Za-z]+$/.test(value),
    height: {
      metric: (value) => value !== 'NULL' || (value >= 50 && value <= 250),
      imperial: (feet, inches) => {
        const totalInches = (parseInt(feet) * 12) + parseInt(inches);
        return totalInches >= 20 && totalInches <= 100;
      }
    },
    weight: {
      metric: (value) => value !== 'NULL' || (value >= 50 && value <= 250),
      imperial: (value) => value >= 44 && value <= 990
    },
    age: (value) => value !== 'NULL' || (value >= 1 && value <= 120),
    sex: (value) => value !== 'NULL',
    email: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(value),
    password: (value) => value.length >= 6,
  };
  
  // Handle measurement system change
  const handleMeasurementSystemChange = (e) => {
    const system = e.target.value;
    setMeasurementSystem(system);
    
    // Reset height and weight when switching systems
    setUser(prev => ({
      ...prev,
      height: { metric: 'NULL', imperial: { feet: '', inches: '' } },
      weight: { metric: '', imperial: { lbs: '' } }
    }));
  };

  // Update user info when an input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Clear any previous validation error
    setValidationError('');
  
    // Handle special cases for height and weight
    if (name === 'measure system') {
      handleMeasurementSystemChange(e);
      return;
    }
  
    // Enhanced numeric validation for height and weight inputs
    const isValidNumericInput = (inputValue) => {
      // Regex to check if input is a valid numeric string
      // Allows optional decimal point and digits before/after
      return /^\d+(\.\d+)?$/.test(inputValue.trim());
    };
  
    // Handle metric height input
    if (name === 'cm') {
      // Validate input is a numeric string before parsing
      if (isValidNumericInput(value)) {
        const numericValue = parseFloat(value);
        setUser(prevUser => ({
          ...prevUser,
          height: { 
            ...prevUser.height, 
            metric: numericValue 
          }
        }));
      } else if (value.trim() === '') {
        // Reset to 'NULL' if input is empty
        setUser(prevUser => ({
          ...prevUser,
          height: { 
            ...prevUser.height, 
            metric: 'NULL' 
          }
        }));
      }
      return;
    }
    

    // Enhanced numeric parsing for metric height and weight
    if (name === 'cm' || name === 'kg') {
      // Careful parsing: trim whitespace, convert to float, handle empty inputs
      const numericValue = value.trim() !== '' ? parseFloat(value) : null;
      
      // Only update if a valid number is parsed
      if (!isNaN(numericValue)) {
        setUser(prevUser => ({
          ...prevUser,
          [name]: numericValue,
          height: { 
            ...prevUser.height, 
            metric: name === 'cm' ? numericValue : prevUser.height.metric 
          },
          weight: { 
            ...prevUser.weight, 
            metric: name === 'kg' ? numericValue : prevUser.weight.metric 
          }
        }));
      }
      return;
    }

    // Handle imperial height
    if (name === 'height-feet' || name === 'height-inches') {
      const key = name.split('-')[1];
      setUser(prevUser => ({
        ...prevUser,
        height: {
          ...prevUser.height, 
          imperial: {
            ...prevUser.height.imperial,
            [key]: value
          }
        }
      }));
      return;
    }

    // Handle imperial weight
    if (name === 'weight-lbs') {
      setUser(prevUser => ({
        ...prevUser,
        weight: {
          ...prevUser.weight, 
          imperial: { lbs: value }
        }
      }));
      return;
    }

    // Default handling for other fields
    setUser(prevUser => ({
      ...prevUser,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  // Go back to previous question
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setValidationError('');
    } else {
      // Option to exit signup process
      navigate('/');
    }
  };

  // Validate current input
  // Enhanced input validation with comprehensive type checking
  const validateCurrentInput = () => {
    const currentField = questions[currentQuestion].id;
    
    // Skip validation for measurement system selection
    if (questions[currentQuestion].skipValidation) return true;

    // Specialized validation for height
    if (currentField === 'height') {
      console.log('Height:', user.height.metric, typeof user.height.metric);
      return measurementSystem === 'metric'
        ? validators.height.metric(user.height.metric)
        : validators.height.imperial(user.height.imperial.feet, user.height.imperial.inches);
    }

    // Specialized validation for weight
    if (currentField === 'weight') {
      return measurementSystem === 'metric'
        ? validators.weight.metric(user.weight.metric)
        : validators.weight.imperial(user.weight.imperial.lbs);
    }

    // Default validation for other fields
    return validators[currentField](user[currentField]);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate current input
    if (!validateCurrentInput()) {
      setValidationError(questions[currentQuestion].errorMessage);
      return;
    }

    // Move to next question or submit
    if (currentQuestion === questions.length - 1) {
      try {
        // Prepare final user data
        const finalUserData = {
          ...user,
          // Convert imperial to metric for backend
          cm: measurementSystem === 'metric' 
            ? user.height.metric 
            : Math.round((parseInt(user.height.imperial.feet) * 30.48) + (parseInt(user.height.imperial.inches) * 2.54)),
          kg: measurementSystem === 'metric'
            ? user.weight.metric
            : Math.round(parseFloat(user.weight.imperial.lbs) * 0.45359237)
        };

        // Signup process (similar to original implementation)
        const response = await fetch(`https://api.b-lu-e.com/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalUserData),
        });

        if (response.ok) {
          const data = await response.json();
          await login(data.user, data.token, data.refreshToken, false);
          
          // Create Stripe checkout session
          const checkoutResponse = await fetch(`https://api.b-lu-e.com/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
                lookup_key: 'prod_RZWrP07xc8c8mh',
                email: user.email,
                success_url: 'https://www.b-lu-e.com/dashboard',
                cancel_url: 'https://www.b-lu-e.com/error'
            }),
          });
            
          if (checkoutResponse.ok) {
            const session = await checkoutResponse.json();
            window.location.href = session.url;
          } else {
            console.error('Failed to create checkout session');
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

  // Render input based on type
  const renderInput = ({ type, id, placeholder, options }) => {
    // Special rendering for imperial height
    if (type === 'height-imperial') {
      return (
        <div className="imperial-height">
          <input 
            type="number" 
            name="height-feet" 
            id="height-feet" 
            placeholder="Feet" 
            onChange={handleChange} 
            value={user.height.imperial.feet}
          />
          <input 
            type="number" 
            name="height-inches" 
            id="height-inches" 
            placeholder="Inches" 
            onChange={handleChange} 
            value={user.height.imperial.inches}
          />
        </div>
      );
    }

    // Special rendering for imperial weight
    if (type === 'weight-imperial') {
      return (
        <input 
          type="number" 
          name="weight-lbs" 
          id="weight-lbs" 
          placeholder={placeholder} 
          onChange={handleChange} 
          value={user.weight.imperial.lbs}
        />
      );
    }


    // Default select rendering
    if (type === 'select') {
      return (
        <select 
          name={id} 
          id={id} 
          onChange={handleChange} 
          value={user[id]}
        >
          <option value="NULL">{`(${id})`}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    // Default input rendering
    return (
      <input 
        type={type} 
        id={id} 
        name={id} 
        placeholder={placeholder} 
        onChange={handleChange} 
      />
    );
  };

  return (
    <div className="SignUp">
      <div id="box" className='box'>
        {/* Back/Exit button */}
        <button 
          onClick={handleBack} 
          className="back-button"
        >
          {currentQuestion === 0 ? 'Exit' : 'Back'}
        </button>

        <div id='question' className='question'>
          {questions.map((question, index) => {
            if (index === currentQuestion) {
              return (
                <div className='mid' key={question.question}>
                  <h1>{question.question}</h1>
                  
                  {/* Display validation error */}
                  {validationError && (
                    <div className="error-message">{validationError}</div>
                  )}
                  
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