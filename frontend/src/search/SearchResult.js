import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchResult.css';
import { ImExit } from "react-icons/im";

function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

function SearchResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const [foods, setFoods] = useState([]);
    const [items, setItems] = useState(0);

    useEffect(() => {
        console.log('SearchResult component mounted');
        if (location.state && location.state.foodData) {
            console.log('Food data received:', location.state.foodData);
            const processedFoods = location.state.foodData.map((item, index) => {
                const food = item.food;
                if (!food || !food.servings || !food.servings.serving) {
                    console.error(`Invalid food data structure for item ${index}:`, food);
                    return null;
                }
                const serving = Array.isArray(food.servings.serving) 
                    ? food.servings.serving[0] 
                    : food.servings.serving;

                if (!serving) {
                    console.error(`No serving data for item ${index}:`, food);
                    return null;
                }

                return {
                    num: index,
                    description: food.food_name,
                    ingredients: "", // Add ingredients if available in your data
                    serving: roundToTwoDecimals(serving.metric_serving_amount) || 'N/A',
                    servingUnit: serving.metric_serving_unit || 'N/A',
                    selected: 0,
                    calories: { amount: serving.calories || 0, unit: 'Kcal' },
                    protein: { amount: serving.protein || 0, unit: 'g' },
                    fat: { amount: serving.fat || 0, unit: 'g' },
                    cholesterol: { amount: serving.cholesterol || 0, unit: 'mg' },
                    saturatedFat: { amount: roundToTwoDecimals(serving.saturated_fat) || '0', unit: 'g'},
                    monoUnsaturatedFat: { amount: roundToTwoDecimals(serving.monounsaturated_fat) || '0', unit: 'g'  }, // Add if available
                    polyUnsaturatedFat: { amount: roundToTwoDecimals(serving.polyunsaturated_fat) || '0', unit: 'g'}, // Add if available
                    transFat: { amount: 0, unit: 'g' }, // Add if available
                    carbs: { amount: serving.carbohydrate || 0, unit: 'g' },
                    sugar: { amount: serving.sugar || 0, unit: 'g' },
                    sodium: { amount: serving.sodium || 0, unit: 'mg' },
                    potassium: { amount: serving.potassium || 0, unit: 'mg' },
                    fiber: { amount: serving.fiber || 0, unit: 'g' },
                    vitaminA: { amount: serving.vitamin_a || 0, unit: 'µ' },
                    vitaminC: { amount: serving.vitamin_c || 0, unit: 'mg' },
                    calcium: { amount: serving.calcium || 0, unit: 'mg' },
                    iron: { amount: serving.iron || 0, unit: 'mg' },
                };
            }).filter(Boolean); // Remove any null items
            setFoods(processedFoods);
        } else {
            console.log('No food data in location state');
        }
    }, [location.state]);

    function selectFoodItem(food) {
        console.log('selectFoodItem called with:', food);

        const updatedFoods = [...foods];
        const index = food.num;

        if (updatedFoods[index].selected === 0) {
            console.log(`Adding food: ${food.description}`);
            setItems(items + 1);
            updatedFoods[index].selected = 1;
            document.getElementById(index).style.backgroundColor = 'white';
            document.getElementById(index).style.color = 'blue';
        } else {
            console.log(`Removing food: ${food.description}`);
            setItems(items - 1);
            updatedFoods[index].selected = 0;
            document.getElementById(index).style.backgroundColor = 'blue';
            document.getElementById(index).style.color = 'white';
        }

        setFoods(updatedFoods);
    }

    return (
        <div className='searchresult'>
            <div className="searchtitle">
                <div className='text'><p>Add: {items}</p></div>
                <div className='exit'><ImExit onClick={() => navigate("/dashboard")}/></div>
            </div>
            {foods.length === 0 && <h1 className="null">Sorry, Nothing Found.</h1>}
            {foods.map((food) => (
                <div key={food.num} className='searchGrid' id={food.num} onClick={() => selectFoodItem(food)}>
                    <div className='grid1'>
                        <div className='name'>
                            <p>{food.description}</p>
                        </div>
                        <div className='servingS'>
                            <h1>Serving Size {food.serving}{food.servingUnit}</h1>
                        </div>
                        <div className='calorieS'>
                            <p1>Calories per serving</p1>
                            <p3>{food.calories.amount}</p3>
                        </div>
                        {/*<div className='ingredients'>
                            <p1>Ingredients:</p1>
                            <p2>{food.ingredients}</p2>
                        </div>
                        */}
                    </div>

                    <div className='grid2'>
                        <div className='serving'>
                            <p>Amount/Serving</p>
                        </div>
                        <div className='secondColumn'>
                            <div className='fatS'>
                                <div className='totalfat'>
                                    <p1>Total Fat</p1>
                                    <p2>{food.fat.amount}{food.fat.unit}</p2>
                                </div>
                                <div className='sat'>
                                    <p1>Saturated Fat</p1>
                                    <p2>{food.saturatedFat.amount}{food.saturatedFat.unit}</p2>
                                </div>
                                <div className='mono'>
                                    <p1>Mono-Unsaturated Fat</p1>
                                    <p2>{food.monoUnsaturatedFat.amount}{food.monoUnsaturatedFat.unit}</p2>
                                </div>
                                <div className='poly'>
                                    <p1>Poly-Unsaturated</p1>
                                    <p2>{food.polyUnsaturatedFat.amount}{food.polyUnsaturatedFat.unit}</p2>
                                </div>
                                <div className='trans'>
                                    <p1>Trans Fat</p1>
                                    <p2>{food.transFat.amount}{food.transFat.unit}</p2>
                                </div>
                                <div className='chol'>
                                    <p1>Cholesterol</p1>
                                    <p2>{food.cholesterol.amount}{food.cholesterol.unit}</p2>
                                </div>
                            </div>
                        </div>
                        <div className='vitaminS'>
                            {/* Add vitamin details here */}
                        </div>
                    </div>
            
                    <div className='grid3'>
                        <div className='serving'>
                            <p>Amount/Serving</p>
                        </div>
                        <div className='thirdColumn'>
                            <div className='carbS'>
                                <div className='totalcarb'>
                                    <p1>Total Carbohydrate</p1>
                                    <p2>{food.carbs.amount}{food.carbs.unit}</p2>
                                </div>
                                <div className='fiber'>
                                    <p1>Dietary Fiber</p1>
                                    <p2>{food.fiber.amount}{food.fiber.unit}</p2>
                                </div>
                                <div className='sugar'>
                                    <p1>Total Sugar</p1>
                                    <p2>{food.sugar.amount}{food.sugar.unit}</p2>
                                </div>
                            </div>
                            <div className='sodium'>
                                <p1>Sodium</p1>
                                <p2>{food.sodium.amount}{food.sodium.unit}</p2>
                            </div>
                            <div className='proteinS'>
                                <p1>Protein</p1>
                                <p2>{food.protein.amount}{food.protein.unit}</p2> 
                            </div>
                        </div>
                        <div className='mineralS'>
                            <p1>Vitamin C</p1>
                            <p2>{food.vitaminC.amount}{food.vitaminC.unit}</p2> 
                            <p1>Vitamin A</p1>
                            <p2>{food.vitaminA.amount}{food.vitaminA.unit}</p2> 
                            {/* Add mineral details here */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SearchResult;
