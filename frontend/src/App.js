import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterView from "./views/registerView/registerView";
import LoginView from "./views/loginView/loginView";
import HomeView from "./views/homeView/homeView";
import ChannelsView from "./views/channels/channelsView";
import RolesView from "./views/roles/RolesView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/home" element={<HomeView />} />
        <Route path="/channels" element={<ChannelsView />} />
        <Route path="/roles" element={<RolesView />} />
      </Routes>
    </Router>
  );
}

export default App;