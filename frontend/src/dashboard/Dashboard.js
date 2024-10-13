import './Dashboard.css';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Search from './Search';
import Result from './Result';
import { VscSettings } from "react-icons/vsc";
import { HiHome } from "react-icons/hi";
import { GiSmart } from "react-icons/gi";

function Dashboard() {
    const [dateString, setDateString] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Get user info from localStorage
        const usero = localStorage.getItem('usero');
        if (usero) {
            setUserInfo(JSON.parse(usero));
        }

        // Set current day
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const d = new Date();
        let day = weekday[d.getDay()];
        setDateString(day);
    }, []);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    //get detailed info about calories
    function calorieDetail() {
        let cal = document.getElementById('calorie');

        let originalText = 
        `<p2>Calorie</p2>
        <p1>${userInfo.food.calories.toFixed(0)}</p1>
        <p3>_______</p3>
        <p3>${userInfo.food.protein.toFixed(0)}left</p3>
        `;

        if(cal.innerHTML.replace(/\s/g, '') == originalText.replace(/\s/g, '')) {
            let total = userInfo.food.carbs + userInfo.food.fat + userInfo.food.protein;
            cal.innerHTML = 
            `
                <p4>Carb</p4>
                    <p5>${(userInfo.food.carbs/Math.max(1, total)).toFixed(0)}%</p5>
                <p4>Protein</p4>
                    <p5>${(userInfo.food.protein/Math.max(1, total)).toFixed(0)}%</p5>
                <p4>Fat</p4>
                    <p5>${(userInfo.food.fat/Math.max(1, total)).toFixed(0)}%</p5>
            `;
        } else {
            cal.innerHTML = originalText;
        }
    }

    function fatDetail() {
        let fat = document.getElementById('fat');

        let originalText = 
        `
        <p2>Fat</p2>
        <p1>${userInfo.food.fat.toFixed(0)} g</p1>
        <p3>_______</p3>
        <p3>${userInfo.food.fat.toFixed(0)}g over</p3>
        `;

        if(fat.innerHTML.replace(/\s/g, '') == originalText.replace(/\s/g, '')) {
            fat.innerHTML = 
            `
            <p4>Saturated</p4>
                <p5>${userInfo.food.saturatedFat.toFixed(0)}mg</p5>
            <p4>Unsaturated</p4>
                <p5>${(userInfo.food.monoUnsaturatedFat + userInfo.food.polyUnsaturatedFat).toFixed(0)}mg</p5>
            <p4>Trans</p4>
                <p5>${userInfo.food.transFat.toFixed(0)}mg</p5>
            <p4>Cholestoral</p4>
                <p5>${userInfo.food.cholesterol.toFixed(0)}mg</p5>
            `;
        } else {
            fat.innerHTML = originalText;
        }
    }

    function carbDetail() {
        let carb = document.getElementById('carb');

        let originalText = 
        `
        <p2>Carb</p2>
        <p1>${userInfo.food.carbs.toFixed(0)} g</p1>
        <p3>_______</p3>
        <p3>${userInfo.food.carbs.toFixed(0)}g over</p3>
        `;

        if(carb.innerHTML.replace(/\s/g, '') == originalText.replace(/\s/g, '')) {
            carb.innerHTML = `
            <p4>Total Sugar</p4>
            <p5>${userInfo.food.sugar.toFixed(0)}g<p5/>
            `;
        } else {
            carb.innerHTML = originalText;
        }
    }

    function vitaminDetail() {
        let vitamin = document.getElementById('vitamin');

        let originalText = 
        `
        <p2>Vitamin</p2>
        <p1>Low Calcium</p1>
        <p3>_______</p3>
        <p3>${userInfo.food.calcium.toFixed(0)}mg under</p3>
        `;

        if(vitamin.innerHTML.replace(/\s/g, '') == originalText.replace(/\s/g, '')) {
            vitamin.innerHTML = `
            <p4>Fat Soluble</p4>
            <ul>
            <li>A ${userInfo.food.vitaminA.toFixed(0)}mg</li>
            <li>D ${userInfo.food.vitaminD.toFixed(0)}mg</li>
            <li>E ${userInfo.food.vitaminE.toFixed(0)}mg</li>
            <li>K ${userInfo.food.vitaminK.toFixed(0)}mg</li>
            </ul>
            <p4>Water Soluble</p4>
            <ul>
            <li>B1 ${userInfo.food.vitaminB1.toFixed(0)}mg</li>
            <li>B2 ${userInfo.food.vitaminB2.toFixed(0)}mg</li>
            <li>B3 ${userInfo.food.vitaminB3.toFixed(0)}mg</li>
            <li>B6 ${userInfo.food.vitaminB6.toFixed(0)}mg</li>
            <li>B9 ${userInfo.food.vitaminB9.toFixed(0)}mg</li>
            <li>B12 ${userInfo.food.vitaminB12.toFixed(0)}mg</li>
            <li>C ${userInfo.food.vitaminC.toFixed(0)}mg</li>
            </ul>
            <p4>Total Fiber</p4>
            <ul>
            <li>Soluble ${userInfo.food.totalfiber.toFixed(0)}g</li>
            </ul>
            <p4>Minerals</p4>
            <ul>
            <li>Sodium ${userInfo.food.sodium.toFixed(0)}mg</li>
            <li>Iron ${userInfo.food.iron.toFixed(0)}mg</li>
            <li>Calcium ${userInfo.food.calcium.toFixed(0)}mg</li>
            <li>Magnesium ${userInfo.food.magnesium.toFixed(0)}mg</li>
            <li>Phosphorous ${userInfo.food.phosphorous.toFixed(0)}mg</li>
            <li>Potassium ${userInfo.food.potassium.toFixed(0)}mg</li>
            <li>Zinc ${userInfo.food.zinc.toFixed(0)}mg</li>
            <li>Caffeine ${userInfo.food.caffeine.toFixed(0)}mg</li>
            </ul>
            `;
        } else {
            vitamin.innerHTML = originalText;
        }
    }

    return (
        <div id="dash" className="Dashboard">
            <div id="dash" className='grid'>
                <div className='sidebar'>
                    <div className='getHome'>
                        <div className='home'><Link to="/" style={{ color: 'white' }}><HiHome className='HiHome'/></Link></div>
                        <div className='ai'><GiSmart className='GiSmart' style={{ color: 'white' }}/></div>
                    </div>
                    <div className='getSettings'>
                        <div className='c'><VscSettings className='VscSettings' style={{ color: 'blue' }}/></div>
                    </div>
                </div>
                <div id="dash" className='subgrid'>
                    <div className='hello1'>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}><h1>B-L-U-E</h1></Link>
                        <p>Happy {dateString} {userInfo.name}</p>
                    </div>
                    <div className='hello2'><Search/></div>
                    <div id='calorie' className='calorie' onClick={calorieDetail}>
                        <p2>Calorie</p2>
                        <p1>{userInfo.food.calories.toFixed(0)}</p1>
                        <p3>_______</p3>
                        <p3>{userInfo.food.protein.toFixed(0)}left</p3>
                    </div>
                    <div id='protein' className='protein'>
                        <p2>Protein</p2>
                        <p1>{userInfo.food.protein.toFixed(0)} g</p1>
                        <p3>_______</p3>
                        <p3>{userInfo.food.protein.toFixed(0)}g left</p3>
                    </div>
                    <div className='subbergrid'>
                        <div id='fat' className='fat' onClick={fatDetail}>
                            <p2>Fat</p2>
                            <p1>{userInfo.food.fat.toFixed(0)} g</p1>
                            <p3>_______</p3>
                            <p3>{userInfo.food.fat.toFixed(0)}g over</p3>
                        </div>
                        <div id='carb' className='carb' onClick={carbDetail}>
                            <p2>Carb</p2>
                            <p1>{userInfo.food.carbs.toFixed(0)} g</p1>
                            <p3>_______</p3>
                            <p3>{userInfo.food.carbs.toFixed(0)}g over</p3>
                        </div>
                    </div>
                    <div id='vitamin' className='vitamin' onClick={vitaminDetail}>
                        <p2>Vitamin</p2>
                        <p1>Low Calcium</p1>
                        <p3>_______</p3>
                        <p3>{userInfo.food.calcium.toFixed(0)}mg under</p3>
                    </div>
                </div>
                <div className='foods'>
                    <div className='add'>
                        <p6>History</p6>
                        <div id='history' className='itemss'>
                            {Object.keys(userInfo.foodsAte).map((foodName) => {
                                const foodData = userInfo.foodsAte[foodName];
                                return (
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
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;