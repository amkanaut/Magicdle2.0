import { Routes, Route } from 'react-router-dom';
import GameBoard   from './components/GameBoard';
import ArchivePage from './pages/ArchivePage';
import ArchiveGame from './pages/ArchiveGame';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/"               element={<GameBoard />} />
      <Route path="/archive"        element={<ArchivePage />} />
      <Route path="/archive/:date"  element={<ArchiveGame />} />
    </Routes>
  );
}

export default App;
