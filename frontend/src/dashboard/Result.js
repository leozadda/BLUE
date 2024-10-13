import './Result.css';


function Result(props){


return(
    <div id="Result" className='Result'>
        <div className='left'>
            <p1>{props.food.name}</p1>
            <p2>{props.food.brand}</p2>
        </div>
        <div className='right'>
                <div className='resultCalories'>
                    <p1>Calories</p1>
                    <p2>{props.food.calories}</p2>
                </div>
            <div className='resultMacro'>
                <div className='resultCarb'>
                    <p1>Carbs</p1>
                    <p2>{props.food.carbs}</p2>
                </div>
                <div className='resultProtein'>
                    <p1>Protein</p1>
                    <p2>{props.food.protein}</p2>
                </div>
                <div className='resultFat'>
                    <p1>Fat</p1>
                    <p2>{props.food.fats}</p2>
                </div>
            </div>
        </div>
    </div>

);
}
export default Result;