import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.status === 201) {
                setUsername('');
                setPassword('');
                alert("Signup Successful");
                navigate('/home', { state: { token: result.token } });
            } else {
                setUsername('');
                setPassword('');
                alert("Signup Not Successful: " + result.error);
            }
        } catch (e) {
            console.error('Signup error: ', e);
            alert("Signup Request Failed");
        }
    };

    return (
        <div className='page-container'>
            <div className='arcade-card2'>
                <h1 className='login-title'>
                    PLEASE SIGNUP
                </h1>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type='text'
                        className='arcade-input'
                        required
                        placeholder='CREATE USERNAME'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type='password'
                        className='arcade-input'
                        required
                        placeholder='CREATE PASSWORD'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type='submit' className='submit-button'>
                        SUBMIT
                    </button>
                </form>

                <h1 className='signup-title'>
                    Already have an account?
                </h1>

                <button className='signup-button' onClick={() => navigate('/login')}>
                    LOGIN
                </button>
            </div>
        </div>
    );
}

export default Signup;