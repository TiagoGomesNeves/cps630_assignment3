import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login(){
    const [ password, setPassword ] = useState('');
    const [ username, setUsername ] = useState('');
   
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username, password})
            });

            const result = await response.json();

            if(response.status === 200){
                setUsername('');
                setPassword('');
                alert("Login Successful");
                navigate('/home', { state: { token: result.token } });
            }else{
                setUsername('');
                setPassword('');
                alert("Login Not Successful: " + result.error);
            }
        }catch(e){
            console.error('Login error: ', e);
            alert("Login Request Failed")
        }
    };
    return (
    <div className='page-container'> 
        <div className='arcade-card'>
            <h1 className='login-title'>
                PLEASE LOGIN
            </h1>
            
            <form onSubmit={handleSubmit} className="login-form">
                <input 
                    type='text' 
                    className='arcade-input' 
                    required 
                    placeholder='ENTER USERNAME' 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                    type='password' 
                    className='arcade-input' 
                    required 
                    placeholder='ENTER PASSWORD' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type='submit' className='submit-button'>
                    SUBMIT
                </button>
            </form>

            <h1 className='signup-title'>
                Don't have an account?
            </h1>

            <button className='signup-button' onClick={() => navigate('/signup')}>
                SIGN UP
            </button>
        </div>
    </div>
);
}


export default Login;