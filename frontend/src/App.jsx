import { Routes, Route } from "react-router-dom";
import EntryPage from './components/EntryPage';
import Home from './components/Home';

function App() {

  return (
    <>
       <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </>
  )
}

export default App
