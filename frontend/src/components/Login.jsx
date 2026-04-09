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
    return(
        <>  
            <h1>Please Login</h1>
            <form onSubmit={handleSubmit}>
                <input type='text' required placeholder='Enter username' value={username} onChange={(e) => setUsername(e.target.value)}></input>
                <input type='password' required placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
                <button type='submit'>Submit</button>
            </form>
        </>
    )
}


export default Login;