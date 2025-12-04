import Onboarding from "./onboarding/Onboarding";

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}

export default App;
