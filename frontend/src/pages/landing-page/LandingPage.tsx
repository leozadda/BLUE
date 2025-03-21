import { Link } from "react-router-dom";
import './LandingPage.css';
import { IoEarth } from "react-icons/io5";
import { PiTimerBold } from "react-icons/pi";
import { MdEmojiPeople } from "react-icons/md";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri"; // Import eye icons
import { useState } from "react";
import { TbAlertTriangle } from "react-icons/tb";
import { LuAnnoyed } from "react-icons/lu";
import { FaDumbbell } from "react-icons/fa";

// Import images
import head from './assets/head.png';
import devil from './assets/devil.png';    

function LandingPage() {
  // State to track which FAQ item is open
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Function to toggle FAQ items
  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // FAQ data
  const faqData = [
    {
      question: "Why not use a spreadsheet or notes app?",
      answer: "Spreadsheets can't track muscle growth, recovery, or weak points. Our app does all of that, helping you train smarter and grow faster.",
    },
    {
      question: "How is this better than other fitness apps?",
      answer: "Other apps only track basic stats. Ours helps bodybuilders by showing what’s working, what’s not, and how to improve workouts in detail.",
    },
    {
      question: "Do I have to log every set and rep?",
      answer: "No. The app auto-fills workouts based on your progress. You only need to adjust what’s necessary—no time wasted on logging everything.",
    },
    {
      question: "Can I use this with my current workout plan?",
      answer: "Yes. Add your plan, and the app will track progress, fix weak points, and ensure you’re improving over time.",
    }
  ];
  

  return (
    <div id="mainer" className="mainer">
      {/* Top bar with a scrolling marquee */}
      <div className="topbar">
        <p>Our product is free. Invest in yourself.</p>
      </div>

      {/* Logo section */}
      <div className="logo">
        <div className="logo-name">
            <h1>B-L-U-E</h1>
        </div>
        <div className="logo-login">
          <Link to="/login">Login</Link>
        </div>
      </div>

      {/* Header section with a title, description, and button */}
      <div className="header">
        <h1>Lift Smarter, Not Longer.</h1>
        <p>Design your own workout splits in minutes, using data to make sure they work.</p>
        <Link to="/signup"><button id="free">try for free</button></Link>
      </div>

      {/* Problem section with an image, title, and description */}
      <div className="problem">
        <div className="problem-child">
          <div className="problem-img">
            <img src={devil} alt="Devil" />
          </div>
          <h1>HOURS IN THE GYM, STILL LOOK SMALL?</h1>
          <p>Building muscle is tough. Following cookie-cutter programs and guessing what works definitely isn't helping.</p>
        </div>
      </div>

      {/* Solution section with a title, description, and image */}
      <div className="solution">
        <div className="solution-child">
          <h1>WE BUILT THE SOLUTION</h1>
          <p>We count your reps, sets, and exercises to see how much each muscle works. Then, we use that to optimize your workouts for your goals.</p>
          <Link to="/signup"><button id="free">try for free</button></Link>
        </div>
        <div className="solution-img">
          <img src={head} alt="Head" />
        </div>
      </div>

      {/* Features section with a grid of features */}
      <div className="features">
        <h1>HOW WE DO IT.</h1>
        <div className="features-grid">
          <div className="grid-item">
            <p>Tailored to you.</p>
            <MdEmojiPeople className="feature-icon" />
          </div>
          <div className="grid-item">
            <p>Anytime & Anywhere.</p>
            <IoEarth className="feature-icon" />
          </div>
          <div className="grid-item">
            <p>No daily log hassle.</p>
            <LuAnnoyed className="feature-icon" />
          </div>
          <div className="grid-item">
            <p>Time saving suggestions.</p>
            <PiTimerBold className="feature-icon" />
          </div>
          <div className="grid-item">
            <p>Advanced training options,</p>
            <FaDumbbell className="feature-icon" />
          </div>
          <div className="grid-item">
            <p>Accountablity reminders.</p>
            <TbAlertTriangle className="feature-icon" />
          </div>
        </div>
      </div>

      {/* FAQ section with collapsible questions and answers */}
      
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <h1 className="faq-title">FAQ</h1>
          </div>
          <div className="faq-accordion">
            {faqData.map((item, index) => (
              <div key={index} className="faq-item">
                  <button
                    className={`faq-question ${activeIndex === index ? "active" : ""}`}
                    onClick={() => toggleAccordion(index)}
                    onTouchEnd={(e) => {
                      e.preventDefault(); // Prevent default behavior
                      toggleAccordion(index);
                    }}
                  >
                  <span className="faq-question-text">{item.question}</span>
                  {activeIndex === index ? (
                    <RiEyeLine className="faq-icon" /> // Closed eye icon when open
                  ) : (
                    <RiEyeCloseLine className="faq-icon" /> // Open eye icon when closed
                  )}
                </button>
                <div
                  className={`faq-answer ${activeIndex === index ? "open" : ""}`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Last sign up CTA */}
       <div className="last-call-to-action">
        <h1>
        Your gym crush will notice.
        </h1>
        <Link to="/signup"><button id="free">try for free</button></Link>
       </div>
      {/* Footer section with links and copyright */}
      <div className="footer">
        <div className='footer-child'>
        <Link to="/help"><h1>Contact us</h1></Link>
        <Link to="/privacy"><h1>Privacy policy</h1></Link>
        <Link to="/terms"><h1>Terms of Use</h1></Link>
        </div>
        <h2>© 2025 B-l-u-e. All rights reserved.</h2>
      </div>
    </div>
  );
}

export default LandingPage;