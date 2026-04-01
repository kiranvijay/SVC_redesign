import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SVCDashboard from './components/SVCDashboard';
import MasterDetailDashboard from './components/MasterDetailDashboard';
import AddSVCPage from './components/AddSVCPage';
import SVCDetailPage from './components/SVCDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SVCDashboard />} />
        <Route path="/master-detail" element={<MasterDetailDashboard />} />
        <Route path="/add-svc" element={<AddSVCPage />} />
        <Route path="/svc/:id" element={<SVCDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
