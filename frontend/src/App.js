import { BrowserRouter, Route, Routes } from "react-router-dom";
import LogIn from './login/LogIn';
import SignUp from './signup/SignUp';
import Main from './main/Main';
import Dashboard from './dashboard/Dashboard';
import Search from './dashboard/Search';
import Result from './dashboard/Result';
import SearchResult from "./dashboard/SearchResult";
//import Private from "./Private";
import No from "./No";
import { createContext, useState } from 'react';
import { PrivateDashBoard, PrivateResults } from "./Private";


export const AuthContext = createContext();

function App() {

  const [user, setUser] = useState({
    date: 'NULL',
    foodsAte: {},
    authenticated: true,
    fname: 'NULL',
    sex: 'NULL',
    age: 'NULL',
    weight: 'NULL',
    height: 'NULL',
    email: 'NULL',
    password: 'NULL',
    autho: 'NULL',
    food: {
      calories: 0,
      protein: 0,
      fat: 0,
      cholesterol: 0,
      saturatedFat: 0,
      monoUnsaturatedFat: 0,
      polyUnsaturatedFat: 0,
      transFat: 0,
      carbs: 0,
      sugar: 0,
      //micro nutrient
      caffeine: 0,
      totalfiber: 0,
      //minerals
      calcium: 0,
      iron: 0,
      magnesium: 0,
      phosphorous: 0,
      potassium: 0,
      sodium: 0,
      zinc: 0,
      //vitamins
      vitaminA: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB6: 0,
      vitaminB9: 0,
      vitaminB12: 0,
      vitaminC: 0,
      vitaminE: 0,
      vitaminD: 0,
      vitaminK: 0
    }
  });
  
    // Convert the object to a string
    let usero = JSON.stringify(user);

    // Store the string in localStorage
    localStorage.setItem('usero', usero);
  
  

  return (
    <AuthContext.Provider value={{ user, setUser }}>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/error" element={<No />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/dashboard" element={<PrivateDashBoard />} />
          <Route path="/result" element={<PrivateResults />} />
      </Routes>
    </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
