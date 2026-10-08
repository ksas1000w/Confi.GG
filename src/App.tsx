import { Routes, Route } from "react-router";
import AppHeader from "./components/AppHeader";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <div className="min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}
