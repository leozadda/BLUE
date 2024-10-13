import './Main.css';
const pigs = require('./pigs.png');
const head = require('./head.png');
const devil = require('./devil.png');
import { Link } from "react-router-dom";
import * as React from 'react';


function Land() {
/*   let testObj = {
    name: 'testt',
    example: 'hi'
  }
  // Convert object to string
  let foodOBJ1 = JSON.stringify(testObj);
  // Store in local storage
  localStorage.setItem('foodInfo', foodOBJ1);
  // Retrieve from local storage
  let foodInfoString = localStorage.getItem('userInfo');
  // Convert back to object
  let foodOBJ2 = JSON.parse(foodInfoString);
  console.log(foodOBJ2); */



  return (
    <div id="mainer" className = "mainer">
      
      <div className = "topbar">
      <p>
        Our product is free. Invest in yourself.
      </p>
      </div>
      
      <div className = "logo">
      <Link to="login"><h1  id="logo">B-L-U-E</h1></Link>
      </div>
      <div className = "start">

        <div className = "start-child">
          <h1>
          Fitness is Hard.
          </h1>
          <ul>
          <li><a href="https://www.thelancet.com/action/showPdf?pii=S0140-6736%2819%2930041-8">11 million deaths related to diet.</a></li>
          <li><a href="https://stacks.cdc.gov/view/cdc/106273">40% of Americans are obese.</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/35584732/#:~:text=The%20age%2Dstandardized%20prevalence%20of,with%20the%20most%20obese%20residents.">Obesity is increasing.</a></li>
          </ul>
        </div>
        <div className="start-img">
        <img src={devil}></img>
        </div>
        </div>
        <div className = "conflict">
        <div className="conflict-img">
        <img src={pigs}></img>
        </div>
          <div className = "conflict-child">
            <h1>
            But not impossible.
            </h1>
            <ul>
              <li>Don't waste your potential.</li>
              <li>Don't be a statistic.</li>
              <li>Don't be a victim.</li>
          </ul>
          </div>

        </div>
        <div className = "solution">
          <div className = "solution-child">
            <h1>
            We can help you.
            </h1>
            <ul>
              <li>We track your diet.</li>
              <li>We tell you what to eat.</li>
              <li>Possible with software.</li>
          </ul>
          
          <Link to="signup"><button id="free">try for free</button></Link>
          
          </div>
          <div className = "solution-img">
            <img src={head}></img>
          </div>
        </div>
        <div className = "footer">
          <div className='footer-child'>
            <h1>
              Contact us
            </h1>
            <h1>
              Privacy policy
            </h1>
            <h1>
              Terms of Use
            </h1>
          </div>
        <h2>© 2023 B-l-u-e. All rights reserved.</h2>
        </div>
    </div>
  );
}

export default Land;