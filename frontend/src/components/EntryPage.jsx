import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';



function EntryPage(){
    const [isLogin, setIsLogin ]= useState(true);

    
    return (
        <>
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