import {useLocation} from 'react-router-dom';
import { useEffect, useState } from 'react';
import Result from './Result';
import './SearchResult.css';
import { ImExit } from "react-icons/im";
import {useNavigate} from "react-router-dom";

function SearchResult(props){
    //will use to get to next page
    const navigate = useNavigate();

    const location = useLocation();
    let foodList = location.state.obj;

    const [foods, setFoods] = useState([]);
    let [fatSum, setFatSum] = useState(0);
    let [items, setItems] = useState(0)

    useEffect(() => {
        foodList.foods.forEach((food) => {
            let foodInfo = {
                num: -1,
                description: food.description,
                ingredients: food.ingredients,
                serving: food.servingSize,
                servingUnit: food.servingSizeUnit,
                selected: 0,
                calories: {
                    amount: '0',
                    unit: 'Kcal'
                },
                protein: {
                    amount: '0',
                    unit: 'g'
                },
                fat: {
                    amount: '0',
                    unit: 'g'
                },
                cholesterol: {
                    amount: '0',
                    unit: 'g'
                },
                saturatedFat: {
                    amount: '0',
                    unit: 'g'
                },
                monoUnsaturatedFat: {
                    amount: '0',
                    unit: 'g'
                },
                polyUnsaturatedFat: {
                    amount: '0',
                    unit: 'g'
                },
                transFat: {
                    amount: '0',
                    unit: 'g'
                },
                carbs: {
                    amount: '0',
                    unit: 'g'
                },
                sugar: {
                    amount: '0',
                    unit: 'g'
                },
                water: {
                    amount: '0',
                    unit: 'oz'
                },
                caffeine: {
                    amount: '0',
                    unit: 'g'
                },
                totalfiber: {
                    amount: '0',
                    unit: 'g'
                },
                calcium: {
                    amount: '0',
                    unit: 'g'
                },
                iron: {
                    amount: '0',
                    unit: 'mg'
                },
                magnesium: {
                    amount: '0',
                    unit: 'mg'
                },
                phosphorous: {
                    amount: '0',
                    unit: 'mg'
                },
                potassium: {
                    amount: '0',
                    unit: 'mg'
                },
                sodium: {
                    amount: '0',
                    unit: 'mg'
                },
                zinc: {
                    amount: '0',
                    unit: 'mg'
                },
                vitaminA: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB1: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB2: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB3: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB6: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB9: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminB12: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminC: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminE: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminD: {
                    amount: '0',
                    unit: 'ug'
                },
                vitaminK: {
                    amount: '0',
                    unit: 'ug'
                },
            };

            food.foodNutrients.forEach((nutrient) => {
                if(nutrient.nutrientName == 'Energy'){
                    foodInfo.calories.amount = nutrient.value;
                    foodInfo.calories.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Protein'){
                    foodInfo.protein.amount = nutrient.value;
                    foodInfo.protein.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Total lipid (fat)'){
                    foodInfo.fat.amount = nutrient.value;
                    foodInfo.fat.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Carbohydrate, by difference'){
                    foodInfo.carbs.amount = nutrient.value;
                    foodInfo.carbs.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Water'){
                    foodInfo.water.amount = nutrient.value;
                    foodInfo.water.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Caffeine'){
                    foodInfo.caffeine.amount = nutrient.value;
                    foodInfo.caffeine.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Fiber, total dietary'){
                    foodInfo.totalfiber.amount = nutrient.value;
                    foodInfo.totalfiber.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Calcium, Ca'){
                    foodInfo.calcium.amount = nutrient.value;
                    foodInfo.calcium.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Iron, Fe'){
                    foodInfo.iron.amount = nutrient.value;
                    foodInfo.iron.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Magnesium, Mg'){
                    foodInfo.magnesium.amount = nutrient.value;
                    foodInfo.magnesium.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Phosphorus, P'){
                    foodInfo.phosphorous.amount = nutrient.value;
                    foodInfo.phosphorous.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Potassium, K'){
                    foodInfo.potassium.amount = nutrient.value;
                    foodInfo.potassium.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Sodium, Na'){
                    foodInfo.sodium.amount = nutrient.value;
                    foodInfo.sodium.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Zinc, Zn'){
                    foodInfo.zinc.amount = nutrient.value;
                    foodInfo.zinc.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin A, RAE'){
                    foodInfo.vitaminA.amount = nutrient.value;
                    foodInfo.vitaminA.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin E (alpha-tocopherol)'){
                    foodInfo.vitaminE.amount = nutrient.value;
                    foodInfo.vitaminE.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin D (D2 + D3)'){
                    foodInfo.vitaminD.amount = nutrient.value;
                    foodInfo.vitaminD.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin C, total ascorbic acid'){
                    foodInfo.vitaminC.amount = nutrient.value;
                    foodInfo.vitaminC.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Thiamin'){
                    foodInfo.vitaminB1.amount = nutrient.value;
                    foodInfo.vitaminB1.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Riboflavin'){
                    foodInfo.vitaminB2.amount = nutrient.value;
                    foodInfo.vitaminB2.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Niacin'){
                    foodInfo.vitaminB3.amount = nutrient.value;
                    foodInfo.vitaminB3.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin B-6'){
                    foodInfo.vitaminB6.amount = nutrient.value;
                    foodInfo.vitaminB6.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Folate, total'){
                    foodInfo.vitaminB9.amount = nutrient.value;
                    foodInfo.vitaminB9.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin B-12'){
                    foodInfo.vitaminB12.amount = nutrient.value;
                    foodInfo.vitaminB12.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Vitamin K (phylloquinone)'){
                    foodInfo.vitaminK.amount = nutrient.value;
                    foodInfo.vitaminK.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Cholesterol'){
                    foodInfo.cholesterol.amount = nutrient.value;
                    foodInfo.cholesterol.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Fatty acids, total saturated'){
                    foodInfo.saturatedFat.amount = nutrient.value;
                    foodInfo.saturatedFat.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Fatty acids, total monounsaturated'){
                    foodInfo.monoUnsaturatedFat.amount = nutrient.value;
                    foodInfo.monoUnsaturatedFat.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Fatty acids, total polyunsaturated'){
                    foodInfo.polyUnsaturatedFat.amount = nutrient.value;
                    foodInfo.polyUnsaturatedFat.unit = nutrient.unitName;
                }
                else if(nutrient.nutrientName == 'Sugars, total including NLEA'){
                    foodInfo.sugar.amount = nutrient.value;
                    foodInfo.sugar.unit = nutrient.unitName;
                }
            });
            setFoods(prevFoods => [...prevFoods, foodInfo]);
        });
    }, [foodList]);

    function addFood(food){
        console.log("testtt:", food.num, food.description);

        //use the array index, food.num is index
        let tab = food.num;
        
        // Get the existing user data from localStorage
        let storedUser = localStorage.getItem('usero');
        let user = storedUser ? JSON.parse(storedUser) : null;
        
        if(!user) return; // Exit if no user data exists
            
        if(foods[tab].selected === 0){
            setItems(items + 1);
            foods[tab].selected = 1;
            document.getElementById(tab).style.backgroundColor = 'white';
            document.getElementById(tab).style.color = 'blue';

            //add food to list
            user.foodsAte[food.description] = {
                calories: food.calories,
                protein: food.protein,
                fat: food.fat,
                cholesterol: food.cholesterol,
                saturatedFat: food.saturatedFat,
                monoUnsaturatedFat: food.monoUnsaturatedFat,
                polyUnsaturatedFat: food.polyUnsaturatedFat,
                transFat: food.transFat,
                carbs: food.carbs,
                sugar: food.sugar,
                caffeine: food.caffeine,
                totalfiber: food.totalfiber,
                calcium: food.calcium,
                iron: food.iron,
                magnesium: food.magnesium,
                phosphorous: food.phosphorous,
                potassium: food.potassium,
                sodium: food.sodium,
                zinc: food.zinc,
                vitaminA: food.vitaminA,
                vitaminB1: food.vitaminB1,
                vitaminB2: food.vitaminB2,
                vitaminB3: food.vitaminB3,
                vitaminB6: food.vitaminB6,
                vitaminB9: food.vitaminB9,
                vitaminB12: food.vitaminB12,
                vitaminC: food.vitaminC,
                vitaminE: food.vitaminE,
                vitaminD: food.vitaminD,
                vitaminK: food.vitaminK
            };
            
            //person nutrient
            user.food.calories += food.calories.amount;
            user.food.protein += food.protein.amount;
            user.food.fat += food.fat.amount;
            user.food.cholesterol += food.cholesterol.amount;
            user.food.saturatedFat += food.saturatedFat.amount;
            user.food.monoUnsaturatedFat += food.monoUnsaturatedFat.amount;
            user.food.polyUnsaturatedFat += food.polyUnsaturatedFat.amount;
            user.food.transFat += food.transFat.amount;
            user.food.carbs += food.carbs.amount;
            user.food.sugar += food.sugar.amount;
            user.food.caffeine += food.caffeine.amount;
            user.food.totalfiber += food.totalfiber.amount;
            user.food.calcium += food.calcium.amount;
            user.food.iron += food.iron.amount;
            user.food.magnesium += food.magnesium.amount;
            user.food.phosphorous += food.phosphorous.amount;
            user.food.potassium += food.potassium.amount;
            user.food.sodium += food.sodium.amount;
            user.food.zinc += food.zinc.amount;
            user.food.vitaminA += food.vitaminA.amount;
            user.food.vitaminB1 += food.vitaminB1.amount;
            user.food.vitaminB2 += food.vitaminB2.amount;
            user.food.vitaminB3 += food.vitaminB3.amount;
            user.food.vitaminB6 += food.vitaminB6.amount;
            user.food.vitaminB9 += food.vitaminB9.amount;
            user.food.vitaminB12 += food.vitaminB12.amount;
            user.food.vitaminC += food.vitaminC.amount;
            user.food.vitaminE += food.vitaminE.amount;
            user.food.vitaminD += food.vitaminD.amount;
            user.food.vitaminK += food.vitaminK.amount;          

        } else if (foods[tab].selected > 0){
            setItems(items - 1);
            foods[tab].selected = 0;
            document.getElementById(tab).style.backgroundColor = 'blue';
            document.getElementById(tab).style.color = 'white';
            
            //remove food obj from list
            delete user.foodsAte[food.description];

            user.food.calories -= food.calories.amount;
            user.food.protein -= food.protein.amount;
            user.food.fat -= food.fat.amount;
            user.food.cholesterol -= food.cholesterol.amount;
            user.food.saturatedFat -= food.saturatedFat.amount;
            user.food.monoUnsaturatedFat -= food.monoUnsaturatedFat.amount;
            user.food.polyUnsaturatedFat -= food.polyUnsaturatedFat.amount;
            user.food.transFat -= food.transFat.amount;
            user.food.carbs -= food.carbs.amount;
            user.food.sugar -= food.sugar.amount;
            user.food.caffeine -= food.caffeine.amount;
            user.food.totalfiber -= food.totalfiber.amount;
            user.food.calcium -= food.calcium.amount;
            user.food.iron -= food.iron.amount;
            user.food.magnesium -= food.magnesium.amount;
            user.food.phosphorous -= food.phosphorous.amount;
            user.food.potassium -= food.potassium.amount;
            user.food.sodium -= food.sodium.amount;
            user.food.zinc -= food.zinc.amount;
            user.food.vitaminA -= food.vitaminA.amount;
            user.food.vitaminB1 -= food.vitaminB1.amount;
            user.food.vitaminB2 -= food.vitaminB2.amount;
            user.food.vitaminB3 -= food.vitaminB3.amount;
            user.food.vitaminB6 -= food.vitaminB6.amount;
            user.food.vitaminB9 -= food.vitaminB9.amount;
            user.food.vitaminB12 -= food.vitaminB12.amount;
            user.food.vitaminC -= food.vitaminC.amount;
            user.food.vitaminE -= food.vitaminE.amount;
            user.food.vitaminD -= food.vitaminD.amount;
            user.food.vitaminK -= food.vitaminK.amount;
        }

        // Convert the object to a string
        let usero = JSON.stringify(user);

        // Store the string in localStorage
        localStorage.setItem('usero', usero);
    }

    return(
        <div className='searchresult'>
            <div className="searchtitle">
                <div className='text'><p>Add: { items}</p></div>
                <div className='exit'><ImExit onClick={() => navigate("/dashboard")}/></div>
            </div>
            {
                (() => {
                    if(foods.length == 0) {
                        return (
                            <h1 className="null">Sorry, Nothing Found.</h1>
                        )
                    }
                })()
            }

            {foods.map((food, index) => {
                if(food.serving > 1 && food.ingredients.length > 0){
                    food.num = index;
                    return(
                        <div className='searchGrid' id={food.num} onClick={() => addFood(food)}>
                            <div id={food.num} className='grid1'>
                                <div id={food.num} className='name'>
                                    <p id={food.num}>{food.description}</p>
                                </div>
                                <div id={food.num} className='servingS'>
                                    <h1 id={food.num}>Serving Size {food.serving}{food.servingUnit}</h1>
                                </div>
                                <div id={food.num} className='calorieS'>
                                    <p1 id={food.num}>Calories per serving</p1>
                                    <p3 id={food.num}>{food.calories.amount}</p3>
                                </div>
                                <div id={food.num} className='ingredients'>
                                    <p1 id={food.num}>Ingredients:</p1>
                                    <p2 id={food.num}>{food.ingredients}</p2>
                                </div>
                            </div>

                            <div id={food.num} className='grid2'>
                                <div id={food.num} className='serving'>
                                    <p id={food.num}>Amount/Serving</p>
                                </div>
                                <div id={food.num} className='secondColumn'>
                                    <div id={food.num} className='fatS'>
                                        <div id={food.num} className='totalfat'>
                                            <p1 id={food.num}>Total Fat</p1>
                                            <p2 id={food.num}>{food.fat.amount}{food.fat.unit}</p2>
                                        </div>
                                        <div id={food.num} className='sat'>
                                            <p1 id={food.num}>Saturated Fat</p1>
                                            <p2 id={food.num}>{food.saturatedFat.amount}{food.saturatedFat.unit}</p2>
                                        </div>
                                        <div id={food.num} className='mono'>
                                            <p1 id={food.num}>Mono-Unsaturated Fat</p1>
                                            <p2>{food.monoUnsaturatedFat.amount}{food.monoUnsaturatedFat.unit}</p2>
                                        </div>
                                        <div id={food.num} className='poly'>
                                            <p1 id={food.num}>Poly-Unsaturated</p1>
                                            <p2>{food.polyUnsaturatedFat.amount}{food.polyUnsaturatedFat.unit}</p2>
                                        </div>
                                        <div id={food.num} className='trans'>
                                            <p1 id={food.num}>Trans Fat</p1>
                                            <p2 id={food.num}>{food.transFat.amount}{food.transFat.unit}</p2>
                                        </div>
                                        <div id={food.num} className='chol'>
                                            <p1 id={food.num}>Cholesterol</p1>
                                            <p2 id={food.num}>{food.cholesterol.amount}{food.cholesterol.unit}</p2>
                                        </div>
                                    </div>
                                </div>
                                <div id={food.num} className='vitaminS'>
                                    <div>
                                        <p1 id={food.num}>A</p1>
                                        <p2 id={food.num}>{food.vitaminA.amount}{food.vitaminA.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>B1</p1>
                                        <p2 id={food.num}>{food.vitaminB1.amount}{food.vitaminB1.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>B2</p1>
                                        <p2 id={food.num}>{food.vitaminB2.amount}{food.vitaminB2.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>B3</p1>
                                        <p2 id={food.num}>{food.vitaminB3.amount}{food.vitaminB3.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>B6</p1>
                                        <p2 id={food.num}>{food.vitaminB6.amount}{food.vitaminB6.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>B12</p1>
                                        <p2 id={food.num}>{food.vitaminB12.amount}{food.vitaminB12.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>C</p1>
                                        <p2 id={food.num}>{food.vitaminC.amount}{food.vitaminC.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>D</p1>
                                        <p2 id={food.num}>{food.vitaminD.amount}{food.vitaminD.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>E</p1>
                                        <p2 id={food.num}>{food.vitaminE.amount}{food.vitaminE.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>K</p1>
                                        <p2 id={food.num}>{food.vitaminK.amount}{food.vitaminK.unit}</p2>
                                    </div>
                                </div>
                            </div>
            
                            <div id={food.num} className='grid3'>
                                <div id={food.num} className='serving'>
                                    <p id={food.num}>Amount/Serving</p>
                                </div>
                                <div id={food.num} className='thirdColumn'>
                                    <div id={food.num} className='carbS'>
                                        <div id={food.num} className='totalcarb'>
                                            <p1 id={food.num}>Total Carbohydrate</p1>
                                            <p2 id={food.num}>{food.carbs.amount}{food.carbs.unit}</p2>
                                        </div>
                                        <div id={food.num} className='fiber'>
                                            <p1 id={food.num}>Dietary Fiber</p1>
                                            <p2 id={food.num}>{food.totalfiber.amount}{food.totalfiber.unit}</p2>
                                        </div>
                                        <div id={food.num} className='sugar'>
                                            <p1 id={food.num}>Total Sugar</p1>
                                            <p2 id={food.num}>{food.sugar.amount}{food.sugar.unit}</p2>
                                        </div>
                                    </div>
                                    <div id={food.num} className='sodium'>
                                        <p1 id={food.num}>Sodium</p1>
                                        <p2 id={food.num}>{food.sodium.amount}{food.sodium.unit}</p2>
                                    </div>
                                    <div id={food.num} className='proteinS'>
                                        <p1 id={food.num}>Protein</p1>
                                        <p2 id={food.num}>{food.protein.amount}{food.protein.unit}</p2> 
                                    </div>
                                </div>
                                <div id={food.num} className='mineralS'>
                                    <div>
                                        <p1 id={food.num}>Calcium</p1>
                                        <p2 id={food.num}>{food.calcium.amount}{food.calcium.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Iron</p1>
                                        <p2 id={food.num}>{food.iron.amount}{food.iron.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Magnesium</p1>
                                        <p2 id={food.num}>{food.magnesium.amount}{food.magnesium.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Phosphorous</p1>
                                        <p2 id={food.num}>{food.phosphorous.amount}{food.phosphorous.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Potassium</p1>
                                        <p2 id={food.num}>{food.potassium.amount}{food.potassium.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Zinc</p1>
                                        <p2 id={food.num}>{food.zinc.amount}{food.zinc.unit}</p2>
                                    </div>
                                    <div>
                                        <p1 id={food.num}>Caffeine</p1>
                                        <p2 id={food.num}>{food.caffeine.amount}{food.caffeine.unit}</p2>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
}

export default SearchResult;