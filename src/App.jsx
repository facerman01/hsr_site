import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PlayerNames from "./PlayerNames";
import AuctionDraft from "./AuctionDraft";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<PlayerNames />} />
          <Route path="/auction" element={<AuctionDraft />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
