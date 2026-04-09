import { useNavigate } from 'react-router-dom';



function EntryPage(){
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/login'); 
    };

    
    return (
        <>  
            <div className='site-title'>
                <svg width="100%" viewBox="0 0 680 210">
                
                <g>
                    
                    <text x="340" y="180" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#660066" dx="6" dy="6">Drop-4</text>
                    <text x="340" y="180" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#990099" dx="4" dy="4">Drop-4</text>
                    <text x="340" y="180" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#CC00CC" dx="2" dy="2">Drop-4</text>
                    <text x="340" y="180" textAnchor="middle" fontFamily="ArcadeClassic" fontSize="148" fontWeight="900" fill="#FF00FF">Drop-4</text>
                </g>
            </svg>

            </div>

            <div className='subtitle-text'>
                <h2>The best place to play connect 4 with your friends!</h2>
            </div>

            <div className='entry-buttons' >
                <button className='entry-button' onClick={handlePlayClick}>
                    Play
                </button>
            </div>
           
        </>
    )
};


export default EntryPage;