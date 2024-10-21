import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { VscSettings } from "react-icons/vsc";
import { ImSwitch, ImHome3 } from "react-icons/im";
import { useAuth } from '/Users/leo/Desktop/blue/frontend/src/authentication/AuthContext.js';
import SearchBar from './SearchBar';
import Result from '../search/AddedResult';
import './Dashboard.css';

// Utility function to format numbers to 0 decimal places only if it's a number
const formatNumber = (num) => { if (!isNaN(num)) return Number(num).toFixed(0); };

/**
 * Component for displaying nutrition information
 * @param {string} id - The ID of the component
 * @param {string} title - The title of the nutrition box
 * @param {number} mainValue - The main value to display
 * @param {number} subValue - The secondary value to display
 * @param {function} onClick - The function to call when the box is clicked
 * @param {string} unit - The unit of measurement (default: 'g')
 */

const NutritionBox = ({ id, title, mainValue, subValue, onClick, unit = 'g' }) => (
  <div id={id} className={id} onClick={onClick}>
    <p2>{title}</p2>
    <p1>{formatNumber(mainValue)} {unit}</p1>
    <p3>_______</p3>
    <p3>{formatNumber(Math.abs(subValue))}{unit} {subValue > 0 ? 'over' : 'left'}</p3>
  </div>
);

function Dashboard() {
  // State for the current day of the week
  const [dateString, setDateString] = useState('');
  // State for user information
  const [userInfo, setUserInfo] = useState(null);
  // Destructure logout function from useAuth hook
  const { logout } = useAuth();

  useEffect(() => {
    // Load user info from localStorage
    const storedUser = localStorage.getItem('usero');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    // Set current day of the week
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    setDateString(weekdays[new Date().getDay()]);
  }, []);

  // Show loading state if user info is not yet loaded
  if (!userInfo) return <div>Loading...</div>;

  /**
   * Function to toggle detailed view of nutritional information
   * @param {string} id - The ID of the element to toggle
   * @param {string} originalContent - The original HTML content
   * @param {string} detailedContent - The detailed HTML content to show
   */
  const toggleDetailView = (id, originalContent, detailedContent) => {
    const element = document.getElementById(id);
    const isOriginal = element.innerHTML.replace(/\s/g, '') === originalContent.replace(/\s/g, '');
    element.innerHTML = isOriginal ? detailedContent : originalContent;
  };

  // Detailed view toggle functions
  const toggleCalorieDetail = () => {
    const total = userInfo.food.carbs + userInfo.food.fat + userInfo.food.protein;
    toggleDetailView('calorie', 
      `<p2>Calorie</p2><p1>${formatNumber(userInfo.food.calories)}</p1><p3>_______</p3><p3>${formatNumber(userInfo.food.protein)}left</p3>`,
      `<p4>Carb</p4><p5>${formatNumber(userInfo.food.carbs/Math.max(1, total))}%</p5>
       <p4>Protein</p4><p5>${formatNumber(userInfo.food.protein/Math.max(1, total))}%</p5>
       <p4>Fat</p4><p5>${formatNumber(userInfo.food.fat/Math.max(1, total))}%</p5>`
    );
  };

  const toggleFatDetail = () => {
    toggleDetailView('fat',
      `<p2>Fat</p2><p1>${formatNumber(userInfo.food.fat)} g</p1><p3>_______</p3><p3>${formatNumber(userInfo.food.fat)}g over</p3>`,
      `<p4>Saturated</p4><p5>${formatNumber(userInfo.food.saturatedFat)}mg</p5>
       <p4>Unsaturated</p4><p5>${formatNumber(userInfo.food.monoUnsaturatedFat + userInfo.food.polyUnsaturatedFat)}mg</p5>
       <p4>Trans</p4><p5>${formatNumber(userInfo.food.transFat)}mg</p5>
       <p4>Cholesterol</p4><p5>${formatNumber(userInfo.food.cholesterol)}mg</p5>`
    );
  };

  const toggleCarbDetail = () => {
    toggleDetailView('carb',
      `<p2>Carb</p2><p1>${formatNumber(userInfo.food.carbs)} g</p1><p3>_______</p3><p3>${formatNumber(userInfo.food.carbs)}g over</p3>`,
      `<p4>Total Sugar</p4><p5>${formatNumber(userInfo.food.sugar)}g</p5>`
    );
  };

  const toggleVitaminDetail = () => {
    toggleDetailView('vitamin',
      `<p2>Vitamin</p2><p1>Low Calcium</p1><p3>_______</p3><p3>${formatNumber(userInfo.food.calcium)}mg under</p3>`,
      `<p4>Fat Soluble</p4>
       <ul>
         <li>A ${formatNumber(userInfo.food.vitaminA)}mg</li>
         <li>D ${formatNumber(userInfo.food.vitaminD)}mg</li>
         <li>E ${formatNumber(userInfo.food.vitaminE)}mg</li>
         <li>K ${formatNumber(userInfo.food.vitaminK)}mg</li>
       </ul>
       <p4>Water Soluble</p4>
       <ul>
         <li>B1 ${formatNumber(userInfo.food.vitaminB1)}mg</li>
         <li>B2 ${formatNumber(userInfo.food.vitaminB2)}mg</li>
         <li>B3 ${formatNumber(userInfo.food.vitaminB3)}mg</li>
         <li>B6 ${formatNumber(userInfo.food.vitaminB6)}mg</li>
         <li>B9 ${formatNumber(userInfo.food.vitaminB9)}mg</li>
         <li>B12 ${formatNumber(userInfo.food.vitaminB12)}mg</li>
         <li>C ${formatNumber(userInfo.food.vitaminC)}mg</li>
       </ul>
       <p4>Total Fiber</p4>
       <ul>
         <li>Soluble ${formatNumber(userInfo.food.totalfiber)}g</li>
       </ul>
       <p4>Minerals</p4>
       <ul>
         <li>Sodium ${formatNumber(userInfo.food.sodium)}mg</li>
         <li>Iron ${formatNumber(userInfo.food.iron)}mg</li>
         <li>Calcium ${formatNumber(userInfo.food.calcium)}mg</li>
         <li>Magnesium ${formatNumber(userInfo.food.magnesium)}mg</li>
         <li>Phosphorous ${formatNumber(userInfo.food.phosphorous)}mg</li>
         <li>Potassium ${formatNumber(userInfo.food.potassium)}mg</li>
         <li>Zinc ${formatNumber(userInfo.food.zinc)}mg</li>
         <li>Caffeine ${formatNumber(userInfo.food.caffeine)}mg</li>
       </ul>`
    );
  };

  return (
    <div id="dash" className="Dashboard">
      <div id="dash" className='grid'>
        {/* Sidebar */}
        <div className='sidebar'>
          <div className='getHome'>
          <div className='home'><Link to="/" style={{ color: 'white' }}><ImHome3 /></Link></div>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ImSwitch /></button>
          </div>
          <div className='getSettings'>
            <div className='c'><VscSettings className='VscSettings' style={{ color: 'blue' }}/></div>
          </div>
        </div>

        {/* Main Content */}
        <div id="dash" className='subgrid'>
          {/* Header */}
          <div className='hello1'>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}><h1>B-L-U-E</h1></Link>
            <p>Happy {dateString} {userInfo.name}</p>
          </div>
          
          {/* Search Component */}
          <div className='hello2'>
            <SearchBar/>
            </div>

          {/* Nutrition Information Boxes */}
          <NutritionBox 
            id="calorie" 
            title="Calorie" 
            mainValue={userInfo.food.calories} 
            subValue={userInfo.food.protein} 
            onClick={toggleCalorieDetail} 
            unit=""
          />
          <NutritionBox 
            id="protein" 
            title="Protein" 
            mainValue={userInfo.food.protein} 
            subValue={userInfo.food.protein} 
          />

          {/* Fat and Carb Information */}
          <div className='subbergrid'>
            <NutritionBox 
              id="fat" 
              title="Fat" 
              mainValue={userInfo.food.fat} 
              subValue={userInfo.food.fat} 
              onClick={toggleFatDetail}
            />
            <NutritionBox 
              id="carb" 
              title="Carb" 
              mainValue={userInfo.food.carbs} 
              subValue={userInfo.food.carbs} 
              onClick={toggleCarbDetail}
            />
          </div>

          {/* Vitamin Information */}
          <NutritionBox 
            id="vitamin" 
            title="Vitamin" 
            mainValue={"Low Calcium"} 
            subValue={userInfo.food.calcium} 
            onClick={toggleVitaminDetail}
            unit="mg"
          />
        </div>

        {/* Food History */}
        <div className='foods'>
          <div className='add'>
            <p6>History</p6>
            <div id='history' className='itemss'>
              {Object.entries(userInfo.foodsAte).map(([foodName, foodData]) => (
                <Result 
                  key={foodName}
                  food={{
                    name: foodName,
                    calories: foodData.calories.amount,
                    carbs: foodData.carbs.amount,
                    protein: foodData.protein.amount,
                    fats: foodData.fat.amount
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;