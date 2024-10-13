import './LogIn.css';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const config = {
  apiKey: "AIzaSyDHKWDEKpWWpKZHsgB6W2ejyjsYNwkUXm4",
  authDomain: "b-l-u-e-c7591.firebaseapp.com",
  projectId: "b-l-u-e-c7591",
  storageBucket: "b-l-u-e-c7591.appspot.com",
  messagingSenderId: "821156707624",
  appId: "1:821156707624:web:a39ccb9dce8dfbd403241d",
  measurementId: "G-7SR89N9KZ4"
};

const blueapp = initializeApp(config);
const auth = getAuth();

function LogIn() {
  const navigate = useNavigate();

  function clearEmail() {
    document.getElementById('loginEmail').value = '';
  }

  function clearPassword() {
    document.getElementById('loginPassword').value = '';
  }

  function log(event) {
    let email = document.getElementById('loginEmail').value;
    let password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("/dashboard");
      })
      .catch((error) => {
        //failed to sign in
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('failed sign in', errorCode);

        //tell user they failed
        document.getElementById('loginEmail').value = 'Not Found';
        document.getElementById('loginPassword').value = 'Not Found';
      });
  }

  return (
    <div className="login-container">
      <h1>B-L-U-E</h1>
      <div className="login-form">
        <input 
          type="text" 
          id="loginEmail" 
          placeholder="Email" 
          onClick={clearEmail}
        />
        <input 
          type="password" 
          id="loginPassword" 
          placeholder="Password" 
          onClick={clearPassword}
        />
        <button onClick={log}>Submit</button>
      </div>
    </div>
  );
}

export default LogIn;