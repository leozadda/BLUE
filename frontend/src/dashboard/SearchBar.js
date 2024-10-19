import './SearchBar.css';
import { Link } from "react-router-dom";
import { BiBarcodeReader } from "react-icons/bi";
import { useEffect, useState } from 'react';
import Result from '../search/Result';
import { useNavigate } from 'react-router-dom';


function Search(props){
    
    //Key for API
    let key = 'IBzxqGc28ut3yDfKBcsKIGn2cb52Ome9OuDF9vA9';

    //will use to get to next page
    const navigate = useNavigate();

    //collect API info with hook
    let [food, setFood] = useState({});


    //Function to search data base
    async function getResults(event){
        if(event.key == 'Enter'){

        //get value inside input field
        let searchWanted = document.getElementById('searchInput').value;
            if(searchWanted != ""){

            //Run API request
            let result = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?query=' + searchWanted + '&api_key=' + key);
            let data = await result.json();
            console.log('data:', data.foods);

            //Go to next page
            navigate("/result", {state: {obj: data} });

            }else{
                document.getElementById('searchInput').placeholder = 'Not Valid';
            }
        }


    }


    return(
        
        <div id="Search" className="Search">
            <div id='container' className="container">
                <div className='searchBar'>
                    <input id='searchInput' placeholder='(search)' onKeyDown = {(e) => getResults(e)}></input>
                    <div id= 'UPC' className='UPC'  onClick={() => console.log('barcode')}><BiBarcodeReader /></div>
                </div>
            </div>
        </div>

    );
}
export default Search;