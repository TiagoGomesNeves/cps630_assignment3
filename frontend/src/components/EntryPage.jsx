import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';



function EntryPage(){
    const [isLogin, setIsLogin ]= useState(true);

    
    return (
        <>  
            <div className='site-title'>
                <svg width="100%" viewBox="0 0 680 210">
                
                <g transform="translate(340,148) skewX(5) skewY(2) translate(-340,-148)">
                    <text x="340" y="190" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#af1aa5" dx="8" dy="8">Drop-4</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#5d0d82" dx="6" dy="6">Drop-4</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#4219a1" dx="4" dy="4">Drop-4</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#2b33cc" dx="2" dy="2">Drop-4</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#ce8ae9">Drop-4</text>
                </g>
            </svg>

            </div>

            <div className='arcade-font subtitle-text'>
                <h2>The best place to play connect 4 with your friends!</h2>
            </div>
            {isLogin &&
                < Login />}
            {!isLogin && 
                <Signup />}
            {isLogin && 
             <button onClick={() => setIsLogin(false)}>Sign Up</button>}
            {!isLogin && 
             <button onClick={() => setIsLogin(true)}>Login</button>}
           
        </>
    )
};


export default EntryPage;