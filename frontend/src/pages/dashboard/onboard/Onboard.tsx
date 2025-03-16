import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Onboard.css';
import { authFetch } from '../../auth/token/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define the onboarding step interface (keeping the same structure)
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  route?: string;
  action?: () => void;
}

const Onboard: React.FC = () => {
  // State declarations
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Critical for preventing flash
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the same onboarding steps array as before
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'WELCOME',
      description: "Thank you for joining! This is a tour.",
      target: '.Company-Logo',
      position: 'bottom',
    },
    {
      id: 'split_creation',
      title: 'Create Workout Splits',
      description: 'Where you create your training plan. We have templates to help you.',
      target: '.Split-Tab',
      position: 'right',
      route: '/dashboard/split',
    },
    {
      id: 'try_workout',
      title: 'Complete Your Workouts',
      description: 'Where you log your actual performance while lifting.',
      target: '.Lifts-Tab',
      position: 'right',
      route: '/dashboard/lift',
    },
    {
      id: 'view_analytics',
      title: 'Analyze Your Workouts',
      description: 'Where you can see what you are doing wrong or right.',
      target: '.Analytics-Tab',
      position: 'right',
      route: '/dashboard/analytics',
    },
    {
      id: 'next_steps',
      title: 'Congratulations!',
      description: "Finished! Adjust your settings.",
      target: '.Settings-Button',
      position: 'top',
      route: '/dashboard/settings',
    },
  ];

  // Initial load with error handling - now using API instead of localStorage
  useEffect(() => {
   
    const fetchOnboardingStatus = async () => {
      try {
        // Get the user's completed steps from the server
        const response = await authFetch(`${API_BASE_URL}/onboarding/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // JWT token should be automatically included via cookie
          },
          credentials: 'include', // Important for including cookies
        });

       
        
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status');
        }

        const data = await response.json();
       
        
        // Update state with completed steps from server
        setCompletedSteps(data.completedSteps || []);
        
        // Show onboarding if user is first-time user AND hasn't completed all steps
        const shouldShow = data.isFirstTimeUser && 
                           (data.completedSteps || []).length < onboardingSteps.length;
        
       
        setIsVisible(shouldShow);
      } catch (error) {
        // Handle error gracefully - default to not showing onboarding if there's an error
        console.error('❌ Error fetching onboarding status:', error);
        setIsVisible(false);
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, []);

  // Update completed steps on server whenever they change
  useEffect(() => {
    // Don't do anything while still loading or if there are no steps to save
    if (isLoading || completedSteps.length === 0) return;

   
    
    const saveCompletedSteps = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/onboarding/complete-steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for auth
          body: JSON.stringify({ steps: completedSteps }),
        });

       
        
        if (!response.ok) {
          throw new Error('Failed to save completed steps');
        }

        // If all steps are completed, mark onboarding as done
        if (completedSteps.length >= onboardingSteps.length) {
         
          
          // Make a separate call to mark user as not first-time
          await authFetch(`${API_BASE_URL}/onboarding/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          setIsVisible(false);
        }
      } catch (error) {
        console.error('❌ Error saving completed steps:', error);
      }
    };

    saveCompletedSteps();
  }, [completedSteps, isLoading]);

  // Handle routing - keeping the same logic
  useEffect(() => {
    if (!isVisible || isLoading) return;

    const currentStepData = onboardingSteps[currentStep];
    if (currentStepData.route && location.pathname !== currentStepData.route) {
     
      navigate(currentStepData.route);
    }
  }, [currentStep, isVisible, navigate, location.pathname, isLoading]);

  // Position tooltip - keeping the same logic
  useEffect(() => {
    if (!isVisible || isLoading) return;

   
    
    const targetElement = document.querySelector(onboardingSteps[currentStep].target);
    const tooltipElement = document.getElementById('onboarding-tooltip');

    if (targetElement && tooltipElement) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      const position = onboardingSteps[currentStep].position;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + 10;
          break;
        default:
          top = targetRect.bottom + 10;
          left = targetRect.left;
      }

      // Boundary checks
      top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

     
      tooltipElement.style.top = `${top}px`;
      tooltipElement.style.left = `${left}px`;
    } else {
      console.warn('⚠️ Target element or tooltip not found in DOM');
    }
  }, [currentStep, isVisible, isLoading]);

  // Next button handler - now saves to server
  const handleNext = () => {
   
    
    // Add current step to completed steps if not already there
    setCompletedSteps((prev) => {
      const newSteps = [...prev];
      if (!newSteps.includes(onboardingSteps[currentStep].id)) {
        newSteps.push(onboardingSteps[currentStep].id);
      }
      return newSteps;
    });

    // Move to next step or finish onboarding
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
     
      setIsVisible(false);
    }
  };

  // Skip button handler - now saves to server
  const handleSkip = async () => {
   
    
    try {
      // Mark all steps as completed
      const allStepIds = onboardingSteps.map((step) => step.id);
      
      // Save all steps as completed
      await authFetch(`${API_BASE_URL}/onboarding/complete-steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ steps: allStepIds }),
      });

      // Mark user as not first-time
      await authFetch(`${API_BASE_URL}/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Update local state
      setCompletedSteps(allStepIds);
      setIsVisible(false);
    } catch (error) {
      console.error('❌ Error skipping onboarding:', error);
    }
  };

  // Highlight overlay function - same as before
  const renderHighlight = () => {
    if (!isVisible) return null;

    const targetElement = document.querySelector(onboardingSteps[currentStep].target);
    if (!targetElement) {
      console.warn('⚠️ Target element not found for highlight:', onboardingSteps[currentStep].target);
      return null;
    }

    const rect = targetElement.getBoundingClientRect();
   
    
    return (
      <div
        className="onboarding-highlight"
        style={{
          position: 'fixed',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          zIndex: 1000,
          pointerEvents: 'none',
          borderRadius: '4px',
        }}
      />
    );
  };

  // Prevent rendering until initialized
  if (isLoading || !isVisible) {
   
    return null;
  }

 
  
  return (
    <>
      {renderHighlight()}
      <div id="onboarding-tooltip" className="onboarding-tooltip">
        <h3>{onboardingSteps[currentStep].title}</h3>
        <p>{onboardingSteps[currentStep].description}</p>
        <div className="onboarding-buttons">
          <button onClick={handleSkip} className="skip-button">
            {currentStep === onboardingSteps.length - 1 ? 'FINISH' : 'EXIT'}
          </button>
          {currentStep < onboardingSteps.length - 1 && (
            <button onClick={handleNext} className="next-button">
              NEXT
            </button>
          )}
        </div>
        <div className="onboarding-progress">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Onboard;