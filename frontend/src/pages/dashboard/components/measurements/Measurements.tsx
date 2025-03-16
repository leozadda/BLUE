import React, { useState, useEffect } from "react";
import { Knob } from "primereact/knob";
import "./Measurements.css";
import { Upload } from "lucide-react";
import { authFetch } from "../../../auth/token/authFetch";
import { useAuth } from "../../../auth/auth-context/AuthContext";

// Define base API URL (this is the address of your backend server)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// **********************************************************************
// Conversion helper functions
// These functions convert between metric and imperial units.
// - kgToLb: converts kilograms to pounds.
// - lbToKg: converts pounds to kilograms.
// - cmToIn: converts centimeters to inches.
// - inToCm: converts inches to centimeters.
const kgToLb = (kg) => kg * 2.20462;  // Multiply kg by 2.20462 to get the value in pounds.
const lbToKg = (lb) => lb / 2.20462;   // Divide lb by 2.20462 to get the value in kilograms.
const cmToIn = (cm) => cm * 0.393701;    // Multiply cm by 0.393701 to convert to inches.
const inToCm = (inch) => inch / 0.393701;  // Divide inches by 0.393701 to convert to centimeters.

// **********************************************************************
// Measurements Component
// This is the main React component that handles displaying and saving body measurements.
const Measurements = () => {
    // Get the auth context at the top level of the component
    const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();

    // ------------------------------------------------------------------
    // States used in this component:
    // - date: holds the date of the measurement.
    // - bodyWeight: holds the body weight (stored internally in kg).
    // - measurement: holds other body measurements (stored in cm).
    // - file: holds the file uploaded (if any).
    // - loading: indicates if data is still being fetched.
    // - message: used for success/error messages.
    // - hasLoadedData: flags whether previous measurements exist.
    // - metricSystem: true if the user prefers metric; false for imperial.
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format.
    const [bodyWeight, setBodyWeight] = useState(0); // Default body weight (40 kg).
    const [measurement, setMeasurement] = useState({
        Arms: 0,
        Thighs: 0,
        Calves: 0,
        Forearms: 0,
        Chest: 0,
        Waist: 0,
    }); // Default measurements (20 cm each).
    const [file, setFile] = useState(null); // No file is uploaded initially.
    const [loading, setLoading] = useState(true); // Start in a "loading" state.
    const [message, setMessage] = useState(null); // No message by default.
    const [hasLoadedData, setHasLoadedData] = useState(false); // Flag to indicate if previous measurements have been loaded.
    const [metricSystem, setMetricSystem] = useState(true); // Default to metric system.


    // ------------------------------------------------------------------
    // Helper function for making API requests that need authentication.
    // This function adds the required Authorization header using the token.
    const makeAuthenticatedRequest = async (url, options = {}) => {

        // Merge the credentials option with any other options passed in.
        const response = await authFetch(`${API_BASE_URL}${url}`, {
            credentials: "include", // This ensures cookies are sent with the request.
            ...options,
        });
    
       
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => {
                console.error("🔍 makeAuthenticatedRequest - Failed to parse error response as JSON");
                return {};
            });
            console.error("🔍 makeAuthenticatedRequest - Error data:", errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
    
        return response;
    };
    

    // ------------------------------------------------------------------
    // Fetch the user's unit preference (metric or imperial) from the user info
    useEffect(() => {
       
        
        // Set the metricSystem state based on the user's preference
        if(userInfo) {
            setMetricSystem(userInfo.metric_system);
        }
    }, [userInfo]); // This effect runs whenever userInfo changes

    // ------------------------------------------------------------------
    // Fetch the user's latest measurement data from the server.
    // Data is stored in metric units.
    useEffect(() => {
        // Define an async function to fetch the latest measurements.
        const fetchLatestMeasurement = async () => {
            try {
               
                setLoading(true); // Set loading to true while we fetch data.
                // Make an authenticated request to get the latest measurement.
                const response = await makeAuthenticatedRequest("/get-latest-measurement");
                const data = await response.json();
               

                // Set the date from the returned data (or use today's date if none is provided).
                setDate(data.date || new Date().toISOString().split('T')[0]);
                // Set the body weight (in kg) and other measurements (in cm).
                setBodyWeight(data.body_weight || 0);
                setMeasurement({
                    Arms: data.arms || 0,
                    Thighs: data.thighs || 0,
                    Calves: data.calves || 0,
                    Forearms: data.forearms || 0,
                    Chest: data.chest || 0,
                    Waist: data.waist || 0,
                });
                setHasLoadedData(true); // Indicate that measurements have been loaded.
            } catch (error) {
                console.error("🔍 fetchLatestMeasurement - Error:", error);
                // If the error is not just "not found", set an error message.
                if (!(error instanceof Error && error.message.includes("404"))) {
                    setMessage({ type: "error", text: "Error" });
                }
                // Even on error, mark that data has loaded so default values show.
                setHasLoadedData(true);
            } finally {
                setLoading(false); // Turn off the loading state when done.
               
            }
        };

        // Call the function to fetch the latest measurements.
        fetchLatestMeasurement();
    }, []); // Runs only once when the component mounts.

    // ------------------------------------------------------------------
    // Handlers for file drop events (for progress photo upload).
    // This function handles what happens when a file is dropped into the drop zone.
    const handleDrop = (event) => {
        event.preventDefault(); // Prevent default behavior (like opening the file).
        const uploadedFile = event.dataTransfer.files[0]; // Get the first file from the drop event.
       

        if (uploadedFile) {
            // Define allowed file types and maximum file size (5MB).
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes

           
           

            // Check if the file type is one of the allowed types.
            if (!validTypes.includes(uploadedFile.type)) {
                console.error("🔍 handleDrop - Invalid file type");
                setMessage({ type: "error", text: "Please upload only images (JPEG, PNG, GIF)" });
                return;
            }

            // Check if the file size is within the allowed limit.
            if (uploadedFile.size > maxSize) {
                console.error("🔍 handleDrop - File too large");
                setMessage({ type: "error", text: "File size must be less than 5MB" });
                return;
            }

            // If the file is valid, update the state with the uploaded file.
            setFile(uploadedFile);
           
            // Clear any previous messages.
            setMessage(null);
        }
    };

    // ------------------------------------------------------------------
    // Prevent default behavior for drag over events.
    const handleDragOver = (event) => {
        event.preventDefault(); // This allows the file to be dropped.
    };

    // ------------------------------------------------------------------
    // Function to reset all values back to their defaults.
    // (Defaults are stored in metric units.)
    const resetValues = () => {
       
        // Reset the date to today's date.
        setDate(new Date().toISOString().split('T')[0]);
        // Reset the body weight to the default (40 kg).
        setBodyWeight(0);
        // Reset all body measurements to their default values (20 cm each).
        setMeasurement({
            Arms: 0,
            Thighs: 0,
            Calves: 0,
            Forearms: 0,
            Chest: 0,
            Waist: 0,
        });
        // Clear any uploaded file.
        setFile(null);
        // Clear any messages.
        setMessage(null);
    };

    // ------------------------------------------------------------------
    // Function to handle saving the measurements.
    // The measurements are stored internally in metric units.
    const handleSubmit = async () => {
        try {
           
            // Prepare the payload with all the measurements and the date.
            const measurementPayload = {
                date,
                bodyWeight,
                arms: measurement.Arms,
                thighs: measurement.Thighs,
                calves: measurement.Calves,
                waist: measurement.Waist,
                forearms: measurement.Forearms,
                chest: measurement.Chest,
            };

           

            // Since we're not uploading a file, we'll send the data directly as JSON
            // instead of using FormData
           
            
            // Make an authenticated POST request to save the user's measurement data.
            await makeAuthenticatedRequest("/save-user-measurement", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(measurementPayload)
            });
            
           
            // If the save is successful, set a success message.
            setMessage({ type: "success", text: "Saved" });
            // Clear the file from state.
            setFile(null);
        } catch (error) {
            console.error("🔍 handleSubmit - Error:", error);
            // If there is an error, display an error message.
            setMessage({ type: "error", text: error.message || "Failed to save measurements" });
        }
    };

    // ------------------------------------------------------------------
    // Handler function for the EXIT button in the message view.
    // This function clears the message so that the main component view is shown again.
    const handleMessageExit = () => {
       
        setMessage(null);
    };

    // ------------------------------------------------------------------
    // If the component is still fetching data, show a loading message.
    if (loading) {
        return (
            <div className="Measurements">
                <div className="Measurements-Grid">
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // If there is a message (error or success) to display, show it.
    if (message) {
        return (
            <div className="Measurements">
                <div className="Measurements-Message-Grid">
                    {/* Display only the text part of the message */}
                    <div className="Measurements-Message">{message.text}</div>
                    {/* When the EXIT button is clicked, clear the message to return to the main view */}
                    <button className="Measurements-Message-Button" onClick={handleMessageExit}>
                        EXIT
                    </button>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // Main render section of the component.
    return (
        <div className="Measurements">
            <div className="Measurements-Grid">
                {/* Show a prompt if no previous measurements were loaded */}
                {!hasLoadedData && (
                <div className="Measurements-Empty-State" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'auto',
                    color: 'white',
                    fontFamily: "Hoefler Text",
                    fontSize: "2em",
                    fontWeight: "500",
                    fontStyle: "normal",
                }}>Nothing</div>
                )}

                {/* Drop zone for uploading a progress photo
                <div className="drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
                    <div className="upload-content">
                        <Upload size={32} />
                        {file ? (
                            <p className="file-name">{file.name}</p>
                        ) : (
                            <p>Drag & Drop Progress Photo Here</p>
                        )}
                    </div>
                </div>
                */}

                <div className="all-knobs">
                    {/* Body Weight Knob */}
                    <div className="knob-section">
                        <h3>Body Weight ({metricSystem ? "kg" : "lbs"})</h3>
                        <Knob
                            // Display value: if imperial, convert kg to lb for display
                            value={metricSystem ? bodyWeight : parseFloat(kgToLb(bodyWeight).toFixed(1))}
                            // When the knob value changes, convert and store the value appropriately
                            onChange={(e) => {
                                if (metricSystem) {
                                    setBodyWeight(parseFloat(e.value.toFixed(1)));
                                } else {
                                    setBodyWeight(parseFloat(lbToKg(e.value).toFixed(1)));
                                }
                            }}
                            // Set min, max, and step values (converted if needed)
                            min={metricSystem ? 40 : parseFloat(kgToLb(40).toFixed(1))}
                            max={metricSystem ? 150 : parseFloat(kgToLb(150).toFixed(1))}
                            step={metricSystem ? 0.1 : parseFloat((0.1 * 2.20462).toFixed(2))}
                            size={300}
                            valueColor="#FFFFFF"
                            rangeColor="rgba(255, 255, 255, 0.2)"
                            textColor="#FFFFFF"
                        />
                    </div>

                    {/* Other body measurement knobs */}
                    <div className="small-knobs">
                        {Object.entries(measurement).map(([key, value]) => (
                            <div key={key} className="knob-wrapper">
                                <label>{key} ({metricSystem ? "cm" : "in"})</label>
                                <Knob
                                    // Display value: convert from cm to in if needed
                                    value={metricSystem ? value : parseFloat(cmToIn(value).toFixed(1))}
                                    // When the knob value changes, convert and update the measurement appropriately
                                    onChange={(e) => {
                                        if (metricSystem) {
                                            setMeasurement(prev => ({
                                                ...prev,
                                                [key]: parseFloat(e.value.toFixed(1))
                                            }));
                                        } else {
                                            setMeasurement(prev => ({
                                                ...prev,
                                                [key]: parseFloat(inToCm(e.value).toFixed(1))
                                            }));
                                        }
                                    }}
                                    min={metricSystem ? 20 : parseFloat(cmToIn(20).toFixed(1))}
                                    max={metricSystem ? 150 : parseFloat(cmToIn(150).toFixed(1))}
                                    step={metricSystem ? 0.1 : parseFloat((0.1 * 0.393701).toFixed(2))}
                                    size={160}
                                    valueColor="#FFFFFF"
                                    rangeColor="rgba(255, 255, 255, 0.2)"
                                    textColor="#FFFFFF"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="button-section">
                    <button className="button danger" onClick={resetValues}>
                        Reset
                    </button>
                    <button className="button primary" onClick={handleSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Measurements;