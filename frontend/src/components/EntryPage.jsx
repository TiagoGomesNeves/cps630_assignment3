import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';



function EntryPage(){
    const [isLogin, setIsLogin ]= useState(true);

    
    return (
        <>  
            <div className='site-title'>
                <svg width="100%" viewBox="0 0 680 280">
                
                <g transform="translate(340,148) skewX(5) skewY(2) translate(-340,-148)">
                    <text x="340" y="190" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontSize="148" fontWeight="900" fill="#af1aa5" dx="8" dy="8">Drop-Four</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontSize="148" fontWeight="900" fill="#5d0d82" dx="6" dy="6">Drop-Four</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontSize="148" fontWeight="900" fill="#4219a1" dx="4" dy="4">Drop-Four</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontSize="148" fontWeight="900" fill="#2b33cc" dx="2" dy="2">Drop-Four</text>
                    <text x="340" y="190" textAnchor="middle" fontFamily="Impact, Arial Black, sans-serif" fontSize="148" fontWeight="900" fill="#ce8ae9">Drop-Four</text>
                </g>
            </svg>

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