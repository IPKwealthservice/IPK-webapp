import { Outlet } from "react-router-dom";
import HeaderSteps from "./components/HeaderSteps";

export default function OnboardingProcess() {
  return (
    <div className="max-w-6xl mx-auto p-6">
    
      <Outlet />
    </div>
  );
}
