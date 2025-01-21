import './SearchBar.css';
import { BiBarcodeReader } from "react-icons/bi";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar(props) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(''); // For storing user input
    const [error, setError] = useState(''); // To show any error messages
    const [isLoading, setIsLoading] = useState(false); // For showing loading state

    // Function to search for food data
    async function searchFood() {
        if (searchTerm !== "") {
            setIsLoading(true); // Show loading message
            setError(''); // Clear any previous errors
            try {
                let result = await fetch(`https://api.b-lu-e.com/food-search/${searchTerm}`);
                let data = await result.json();
                
                // If valid data is received, navigate to results
                if (data && data.foodDetails && data.foodDetails[0] && data.foodDetails[0].food) {
                    console.log("serach bar:", data);
                    navigate("/result", { state: { foodData: data.foodDetails } });
                } else {
                    setError('No results found. Please try a different search term.');
                }
            } catch (err) {
                setError('An error occurred while searching. Please try again.');
            } finally {
                setIsLoading(false); // Stop loading
            }
        } else {
            setError('Please enter a valid search term'); // No input case
        }
    }

    // Trigger search when Enter key is pressed
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            searchFood();
        }
    }

    return (
        <div id="Search" className="Search">
            <div id='container' className="container">
                {/* Show search bar only if not loading */}
                {!isLoading && (
                    <div className='searchBar'>
                        <input
                            id='searchInput'
                            placeholder='(search)'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading} // Disable input while loading
                        />
                        <div id='UPC' className='UPC' onClick={searchFood}>
                            <BiBarcodeReader />
                        </div>
                    </div>
                )}
            </div>

            {/* Show loading message only if loading */}
            {isLoading && (
                    <div className='searchBar'>
                        <input
                            id='searchInput'
                            placeholder='(Loading)'
                            value='(Loading)'
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading} // Disable input while loading
                        />
                        <div id='UPC' className='UPC' onClick={searchFood}>
                            <BiBarcodeReader />
                        </div>
                    </div>
                )}

            {/* Show error message if any */}
            {error && navigate("/error")}
        </div>
    );
}

export default SearchBar;
