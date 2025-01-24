import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { VscSettings } from "react-icons/vsc";
import { ImSwitch, ImHome3 } from "react-icons/im";
import { useAuth } from '../authentication/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import Result from '../search/AddedResult';
import './Dashboard.css';


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
    // These state variables hold important data for the component
    const [dateString, setDateString] = useState('');
    const [userDailyLog, setUserDailyLog] = useState(null);
    const [paymentVerified, setPaymentVerified] = useState(false);
    
    // Get authentication state, logOff function, and navigation
    const { auth, logOff } = useAuth();
    const navigate = useNavigate();
  
    // Payment verification effect
    useEffect(() => {
      const verifyPayment = async () => {
        if (auth.isAuthenticated && auth.user && auth.user.email) {
          try {
            const response = await fetch(`https://api.b-lu-e.com/verify-payment-status?email=${auth.user.email}`);
            const data = await response.json();
            
            if (!data.hasCompletedPayment) {
              console.log('Dashboard: User has not completed payment, redirecting...');
              navigate('/payment-required');
              return;
            }
            
            setPaymentVerified(true);
          } catch (error) {
            console.error('Dashboard: Error verifying payment status:', error);
            navigate('/payment-required');
          }
        }
      };
  
      // Original data fetching effect
      const fetchUserDailyLog = async () => {
        if (auth.isAuthenticated && auth.user && auth.user.id) {
          try {
            const today = new Date();
            const date = today.toISOString().split('T')[0];
            const dayIndex = today.getDay();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = daysOfWeek[dayIndex];
            console.log('Dashboard: Fetching data for user ID:', auth.user.id, 'on date:', date);
  
            const response = await fetch(`https://api.b-lu-e.com/user-daily-log?user_id=${auth.user.id}&date=${date}`);
            const data = await response.json();
  
            console.log('Dashboard: Fetched user daily log:', data);
            setUserDailyLog(data); // Store the fetched data
            setDateString(dayName); //Set date for user
          } catch (error) {
            console.error('Dashboard: Error fetching user daily log:', error);
          }
        }
      };
  
      // Verify payment first
      verifyPayment();
      
      // Only fetch daily log if not loading and authenticated
      if (!auth.isLoading && auth.isAuthenticated) {
        fetchUserDailyLog();
      } else {
        console.log('Dashboard: Auth is still loading or not authenticated');
      }
    }, [auth, navigate]);  

  // Calculate total nutrition values from the daily log
  const totalNutrition = userDailyLog.reduce((acc, item) => {
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
  });

  console.log('Calculated total nutrition:', totalNutrition); // Debug log

  // This function switches between simple and detailed views of nutrition info
  const toggleDetailView = (id, originalContent, detailedContent) => {
    const element = document.getElementById(id);
    const isOriginal = element.innerHTML.replace(/\s/g, '') === originalContent.replace(/\s/g, '');
    element.innerHTML = isOriginal ? detailedContent : originalContent;
    console.log(`Toggled ${id} to ${isOriginal ? 'detailed' : 'original'} view`); // Debug log
  };

  // These functions handle showing detailed information for different nutrients
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
          <div className='getHome'>
            <div className='home'><Link to="/" style={{ color: 'white' }}><ImHome3 /></Link></div>
            <button  onClick={logOff} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1em'}}><ImSwitch /></button>
          </div>
          <div className='getSettings'>
            <div className='c'><VscSettings className='VscSettings' style={{ color: 'blue' }}/></div>
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
              {userDailyLog.map((food, index) => {
                console.log('Rendering food item:', food); // Debug log
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;