import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { VscSettings } from "react-icons/vsc";
import { ImSwitch, ImHome3 } from "react-icons/im";
import { useAuth } from '../authentication/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import Result from '../search/AddedResult';
import './Dashboard.css';
import { IoFastFood } from "react-icons/io5";
import { GiWeight } from "react-icons/gi";
import { FaWeightScale } from "react-icons/fa6";
import { GiHamShank } from "react-icons/gi";
import { GiChemicalDrop } from "react-icons/gi";
import { GiBed } from "react-icons/gi";
import { GiSettingsKnobs } from "react-icons/gi";
import { BiPulse } from "react-icons/bi";
import { BiRun } from "react-icons/bi";
import { BiRestaurant } from "react-icons/bi";
import { TbMeat } from "react-icons/tb";
import { IoPulse } from "react-icons/io5";
import { IoScaleSharp } from "react-icons/io5";
import { IoCog } from "react-icons/io5";

// This function rounds numbers to 0 decimal places
const formatNumber = (num) => {
  if (!isNaN(num)) return Number(num).toFixed(0);
  return num; // If it's not a number, return it as is
};

// This component creates a box to display nutrition information
const NutritionBox = ({ id, title, mainValue, subValue, onClick, unit = 'g' }) => (
  <div id={id} className={id} onClick={onClick}>
    <p2>{title}</p2>
    <p1>{formatNumber(mainValue)} {unit}</p1>
    <p3>_______</p3>
    <p3>{formatNumber(Math.abs(subValue))}{unit} {subValue > 0 ? 'over' : 'left'}</p3>
  </div>
);

function Dashboard() {
  // State variables to manage dashboard data
  const [dateString, setDateString] = useState('');     // Current day of the week
  const [userDailyLog, setUserDailyLog] = useState([]); // User's food log for the day
  const [paymentVerified, setPaymentVerified] = useState(false); // Payment status
  
  // Authentication and navigation hooks
  const { auth, logOff } = useAuth();     // Access user authentication state
  const navigate = useNavigate();         // Navigate between routes

  // Main effect to handle payment verification and data fetching
  useEffect(() => {
      // Check if user has paid or is in trial period
      const verifyPayment = async () => {
          // Only proceed if user is authenticated
          if (auth.isAuthenticated && auth.user && auth.user.email) {
              try {
                  // Call backend to verify payment status
                  const response = await fetch(`https://api.b-lu-e.com/verify-payment-status?email=${auth.user.email}`);
                  const data = await response.json();
                  
                  console.log('Payment verification response:', data);
                  
                  // Redirect to payment page if not paid/in trial
                  if (!data.hasCompletedPayment) {
                      console.log('User needs to complete payment or is out of trial');
                      navigate('/payment');
                      return;
                  }
                  
                  // Optional: Add trial expiration warning
                  if (data.trialEndsAt) {
                      const trialEnd = new Date(data.trialEndsAt);
                      const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
                      
                      if (daysLeft <= 3) {
                          alert(`Your free trial expires in ${daysLeft} days. Please upgrade.`);
                      }
                  }
                  
                  setPaymentVerified(true);
              } catch (error) {
                  console.error('Dashboard: Error verifying payment status:', error);
                  //navigate('/error');
              }
          }
      };
  
      // Fetch user's daily food log
      const fetchUserDailyLog = async () => {
          // Ensure user is authenticated before fetching
          if (auth.isAuthenticated && auth.user && auth.user.id) {
              try {
                  // Get today's date and day name
                  const today = new Date();
                  const date = today.toISOString().split('T')[0];
                  const dayIndex = today.getDay();
                  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = daysOfWeek[dayIndex];
      
                  // Fetch food log from backend
                  const response = await fetch(`https://api.b-lu-e.com/user-daily-log?user_id=${auth.user.id}&date=${date}`);
                  const data = await response.json();
      
                  // Update state with fetched data
                  setUserDailyLog(data || []); 
                  setDateString(dayName);
              } catch (error) {
                  console.error('Dashboard: Error fetching user daily log:', error);
                  setUserDailyLog([]); 
              }
          }
      };
  
      // First verify payment, then fetch daily log
      verifyPayment();
      
      // Only fetch log if authentication is complete
      if (!auth.isLoading && auth.isAuthenticated) {
          fetchUserDailyLog();
      } else {
          console.log('Dashboard: Auth is still loading or not authenticated');
      }
  }, [auth, navigate]);

// Calculate total nutritional intake for the day
const totalNutrition = userDailyLog && userDailyLog.length > 0 
  ? userDailyLog.reduce((acc, item) => {
      // Sum up nutritional values from all logged food items
        acc.calories += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.fat += item.fat || 0;
        acc.carbs += item.carbs || 0;
        acc.saturatedFat += item.saturated_fat || 0;
        acc.monoUnsaturatedFat += item.monounsaturated_fat || 0;
        acc.polyUnsaturatedFat += item.polyunsaturated_fat || 0;
        acc.transFat += item.trans_fat || 0;
        acc.cholesterol += item.cholesterol || 0;
        acc.sugar += item.sugar || 0;
        acc.calcium += item.calcium || 0;
        acc.vitaminA += item.vitamina || 0;
        acc.vitaminC += item.vitaminc || 0;
        acc.vitaminD += item.vitamind || 0;
        acc.vitaminE += item.vitamine || 0;
        acc.vitaminK += item.vitamink || 0;
        acc.iron += item.iron || 0;
        acc.magnesium += item.magnesium || 0;
        acc.zinc += item.zinc || 0;
        acc.potassium += item.potassium || 0;
        return acc;
      }, {
        calories: 0, protein: 0, fat: 0, carbs: 0, saturatedFat: 0,
        monoUnsaturatedFat: 0, polyUnsaturatedFat: 0, transFat: 0,
        cholesterol: 0, sugar: 0, calcium: 0, vitaminA: 0, vitaminC: 0,
        vitaminD: 0, vitaminE: 0, vitaminK: 0, iron: 0, magnesium: 0,
        zinc: 0, potassium: 0
      })
    : {
        calories: 0, protein: 0, fat: 0, carbs: 0, saturatedFat: 0,
        monoUnsaturatedFat: 0, polyUnsaturatedFat: 0, transFat: 0,
        cholesterol: 0, sugar: 0, calcium: 0, vitaminA: 0, vitaminC: 0,
        vitaminD: 0, vitaminE: 0, vitaminK: 0, iron: 0, magnesium: 0,
        zinc: 0, potassium: 0
      };

  console.log('Calculated total nutrition:', totalNutrition); // Debug log

  // These functions handle showing detailed information for different nutrients
  const toggleDetailView = (id, originalContent, detailedContent) => {
    const element = document.getElementById(id);
    const isOriginal = element.innerHTML.replace(/\s/g, '') === originalContent.replace(/\s/g, '');
    element.innerHTML = isOriginal ? detailedContent : originalContent;
    console.log(`Toggled ${id} to ${isOriginal ? 'detailed' : 'original'} view`);
  };

  const toggleCalorieDetail = () => {
    const total = totalNutrition.carbs + totalNutrition.fat + totalNutrition.protein;
    toggleDetailView('calorie', 
      `<p2>Calorie</p2><p1>${formatNumber(totalNutrition.calories)}</p1><p3>_______</p3><p3>${formatNumber(totalNutrition.protein)}left</p3>`,
      `<p4>Carb</p4><p5>${formatNumber(totalNutrition.carbs/Math.max(1, total)*100)}%</p5>
       <p4>Protein</p4><p5>${formatNumber(totalNutrition.protein/Math.max(1, total)*100)}%</p5>
       <p4>Fat</p4><p5>${formatNumber(totalNutrition.fat/Math.max(1, total)*100)}%</p5>`
    );
  };

  const toggleFatDetail = () => {
    toggleDetailView('fat',
      `<p2>Fat</p2><p1>${formatNumber(totalNutrition.fat)} g</p1><p3>_______</p3><p3>${formatNumber(totalNutrition.fat)}g over</p3>`,
      `<p4>Saturated</p4><p5>${formatNumber(totalNutrition.saturatedFat)}mg</p5>
       <p4>Unsaturated</p4><p5>${formatNumber(totalNutrition.monoUnsaturatedFat + totalNutrition.polyUnsaturatedFat)}mg</p5>
       <p4>Trans</p4><p5>${formatNumber(totalNutrition.transFat)}mg</p5>
       <p4>Cholesterol</p4><p5>${formatNumber(totalNutrition.cholesterol)}mg</p5>`
    );
  };

  const toggleCarbDetail = () => {
    toggleDetailView('carb',
      `<p2>Carb</p2><p1>${formatNumber(totalNutrition.carbs)} g</p1><p3>_______</p3><p3>${formatNumber(totalNutrition.carbs)}g over</p3>`,
      `<p4>Total Sugar</p4><p5>${formatNumber(totalNutrition.sugar)}g</p5>`
    );
  };

  const toggleVitaminDetail = () => {
    toggleDetailView('vitamin',
      `<p2>Vitamin</p2><p1>Low Calcium</p1><p3>_______</p3><p3>${formatNumber(totalNutrition.calcium)}mg under</p3>`,
      `<p4>Fat Soluble</p4>
       <ul>
         <li>A ${formatNumber(totalNutrition.vitaminA)}mg</li>
         <li>D ${formatNumber(totalNutrition.vitaminD)}mg</li>
         <li>E ${formatNumber(totalNutrition.vitaminE)}mg</li>
         <li>K ${formatNumber(totalNutrition.vitaminK)}mg</li>
       </ul>
       <p4>Water Soluble</p4>
       <ul>
         <li>C ${formatNumber(totalNutrition.vitaminC)}mg</li>
       </ul>
       <p4>Minerals</p4>
       <ul>
         <li>Calcium ${formatNumber(totalNutrition.calcium)}mg</li>
         <li>Iron ${formatNumber(totalNutrition.iron)}mg</li>
         <li>Magnesium ${formatNumber(totalNutrition.magnesium)}mg</li>
         <li>Potassium ${formatNumber(totalNutrition.potassium)}mg</li>
         <li>Zinc ${formatNumber(totalNutrition.zinc)}mg</li>
       </ul>`
    );
  };

  // This is the main part of the component that gets rendered
  return (
    <div id="dash" className="Dashboard">
      <div id="dash" className='grid'>
        {/* This is the sidebar */}
        <div className='sidebar'>
          <div className='miniBar'>
            <div className='nutrition-tab'><GiHamShank /></div>
            <div className='exercise-tab'><GiWeight /></div>
            <div className='biometrics-tab'><IoScaleSharp /></div>
          </div>
          <div className='getSettings'>
            <div className='c'><IoCog className='VscSettings' style={{ color: 'blue' }}/></div>
          </div>
        </div>

        {/* This is the main content area */}
        <div id="dash" className='subgrid'>
          {/* Header */}
          <div className='hello1'>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}><h1>B-L-U-E</h1></Link>
            <p>Happy {dateString}, {auth.user.username} </p>
          </div>
          
          {/* Search bar */}
          <div className='hello2'>
            <SearchBar/>
          </div>

          {/* Nutrition information boxes */}
          <NutritionBox 
            id="calorie" 
            title="Calorie" 
            mainValue={totalNutrition.calories} 
            subValue={totalNutrition.protein} 
            onClick={toggleCalorieDetail} 
            unit=""
          />
          <NutritionBox 
            id="protein" 
            title="Protein" 
            mainValue={totalNutrition.protein} 
            subValue={totalNutrition.protein} 
          />

          {/* Fat and Carb information */}
          <div className='subbergrid'>
            <NutritionBox 
              id="fat" 
              title="Fat" 
              mainValue={totalNutrition.fat} 
              subValue={totalNutrition.fat} 
              onClick={toggleFatDetail}
            />
            <NutritionBox 
              id="carb" 
              title="Carb" 
              mainValue={totalNutrition.carbs} 
              subValue={totalNutrition.carbs} 
              onClick={toggleCarbDetail}
            />
          </div>

          {/* Vitamin information */}
          <NutritionBox 
            id="vitamin" 
            title="Vitamin" 
            mainValue={"Low Calcium"} 
            subValue={totalNutrition.calcium} 
            onClick={toggleVitaminDetail}
            unit="mg"
          />
        </div>

        {/* Food history */}
        <div className='foods'>
          <div className='add'>
            <p6>History</p6>
            <div id='history' className='itemss'>
              {userDailyLog && userDailyLog.length > 0 ? (
                userDailyLog.map((food, index) => {
                  console.log('Rendering food item:', food);
                  return (
                    <Result 
                      key={index}
                      food={{
                        name: food.food_name,
                        calories: food.calories,
                        carbs: food.carbs,
                        protein: food.protein,
                        fats: food.fat
                      }}
                    />
                  );
                })
              ) : (
                <div style={{ flex: '100%', textAlign: 'center' }}>
                <p id="empty-log" className="empty-log">Nothing</p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;