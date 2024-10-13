//React imports
import './SignUp.css';
import {  useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc} from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

//connecting to firebase database
const config = {
    apiKey: "AIzaSyDHKWDEKpWWpKZHsgB6W2ejyjsYNwkUXm4",
    authDomain: "b-l-u-e-c7591.firebaseapp.com",
    projectId: "b-l-u-e-c7591",
    storageBucket: "b-l-u-e-c7591.appspot.com",
    messagingSenderId: "821156707624",
    appId: "1:821156707624:web:a39ccb9dce8dfbd403241d",
    measurementId: "G-7SR89N9KZ4"
};

// Initialize Cloud Firestore and get a reference to the service
const blueapp = initializeApp(config);
const db = getFirestore(blueapp);
const auth = getAuth();

const App = () => {
    // Replace context with local state
    const [user, setUser] = useState({
        name: 'NULL',
        height: 'NULL',
        weight: 'NULL',
        age: 'NULL',
        sex: 'NULL',
        email: 'NULL',
        password: 'NULL',
        authenticated: false
    });

    function emailCheck(text){
        let perfect = /([a-z]|[A-Z]|[0-9])+\@([a-z])+\.(com|org|net|ai)/g;
        let result = perfect.test(text);
        return result;
    }

    function nameCheck(text){
        let perfect = /^([A-Z]|[a-z])+$/g;
        let result = perfect.test(text);
        return result;
    }

    //used to switch to dashboard
    const navigate = useNavigate();

    //this code is neutral
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const questions = [
        {
            question: 'What is your name?',
            input: <input id='nameID' type="text" placeholder="'Shrek'" onChange={(event) => setUser({ ...user, name: event.target.value })}/>
        },
        {
            question: 'What is your height?',
            input: (
                <select onChange={(event) => setUser({ ...user, height: event.target.value })}>
                    <option value="NULL">(feet)</option>
                    <option value="5'0">5'0</option>
                    <option value="5'1">5'1</option>
                    <option value="5'2">5'2</option>
                    <option value="5'3">5'3</option>
                    <option value="5'4">5'4</option>
                    <option value="5'5">5'5</option>
                    <option value="5'6">5'6</option>
                    <option value="5'7">5'7</option>
                    <option value="5'8">5'8</option>
                    <option value="5'9">5'9</option>
                    <option value="5'10">5'10</option>
                    <option value="5'11">5'11</option>
                    <option value="6'0">6'0</option>
                    <option value="6'1">6'1</option>
                    <option value="6'2">6'2</option>
                    <option value="6'3">6'3</option>
                    <option value="6'4">6'4</option>
                    <option value="6'5">6'5</option>
                    <option value="6'6">6'6</option>
                    <option value="6'7">6'7</option>
                    <option value="6'8">6'8</option>
                    <option value="6'9">6'9</option>
                    <option value="6'10">6'10</option>
                    <option value="6'100">6'11</option>
                </select>
            )
        },
        {
            question: 'What is your weight?',
            input: <input id='weightID' type="number" placeholder="(lbs)" onChange={(event) => setUser({ ...user, weight: event.target.value })}/>
        },
        {
            question: 'What is your age?',
            input: <input id='ageID' type="number" placeholder="(years)" onChange={(event) => setUser({ ...user, age: event.target.value })}/>
        },
        {
            question: 'What is your sex?',
            input: (
                <select onChange={(event) => setUser({ ...user, sex: event.target.value })}>
                    <option value="NULL">(sex)</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            )
        },
        {
            question: 'What is your email?',
            input: <input id='emailID' type="text" placeholder="we don't spam" onChange={(event) => setUser({ ...user, email: event.target.value })}/>
        },
        {
            question: 'Choose Password.',
            input: <input id='passwordID' type="password" placeholder="(6 characters)" onChange={(event) => setUser({ ...user, password: event.target.value })}/>
        },
    ];

    function nameSubmit(event){
        event.preventDefault();

        if(currentQuestion == 0){
            if(user.name == 'NULL' || nameCheck(user.name) == false){
                document.getElementById('nameID').value = '';
                document.getElementById('nameID').placeholder = 'try again';
            } else {
                console.log("Name:", user.name);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 1){
            if(user.height == 'NULL'){
                console.log('Height not allowed');
            } else {
                console.log("Height:", user.height);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 2){
            if(user.weight == 'NULL' || user.weight < 10 || user.weight > 1000){
                document.getElementById('weightID').value = '';
                document.getElementById('weightID').placeholder = 'try again';
            } else {
                console.log("Weight:", user.weight);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 3){
            if(user.age == 'NULL' || user.age < 1 || user.age > 120){
                document.getElementById('ageID').value = '';
                document.getElementById('ageID').placeholder = 'try again';
            } else {
                console.log("Age:", user.age);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 4){
            if(user.sex == 'NULL'){
                console.log('Sex not allowed');
            } else {
                console.log("Sex:", user.sex);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 5){
            if(user.email == 'NULL' || emailCheck(user.email) == false){
                document.getElementById('emailID').value = '';
                document.getElementById('emailID').placeholder = 'try again';
            } else {
                console.log("Email:", user.email);
                setCurrentQuestion(currentQuestion + 1);
            }
        } else if(currentQuestion == 6){
            if(user.password == 'NULL'){
                document.getElementById('passwordID').value = '';
                document.getElementById('passwordID').placeholder = 'try again';
            } else {
                console.log("Password:", user.password);

                createUserWithEmailAndPassword(auth, user.email, user.password)
                    .then((userCredential) => {
                        const usero = userCredential.user;
                        console.log(usero);
                        setUser({ ...user, authenticated: true });

                        // Convert the object to a string
                        let useroo = JSON.stringify(user);

                        // Store the string in localStorage
                        localStorage.setItem('usero', useroo);
                
                        navigate("/dashboard");
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log('failed sign in', errorCode);
                    });
            }
        }
    }

    //let person pass as soon as they are validated
    if(user.authenticated == true){
        navigate("/dashboard"); 
    }
    
    return (
        <div className="SignUp">
            <div id="box" className='box'>
                <div id='question' className='question'>
                    {questions.map((question, index) => {
                        if (index === currentQuestion) {
                            return (
                                <div className='mid' key={question.question}>
                                    <h1>{question.question}</h1>
                                    <form onSubmit={nameSubmit}>
                                        {question.input}
                                        <div className='done'>
                                            <button type='submit'>NEXT</button>
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

export default App;