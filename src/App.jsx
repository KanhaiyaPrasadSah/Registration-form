import React, { useState } from "react";
import StudentRegistrationForm from "./pages/StudentRegistrationForm";
import FacultyRegistrationForm from "./pages/FacultyRegistrationForm";
import "./App.css";

const App = () => {
  const [mode, setMode] = useState("student"); // student | faculty

  return (
    <div>
      {/* ===== TOP NAV ===== */}
      <div className="top-switch">
        <button
          className={`switch-btn ${mode === "student" ? "active" : ""}`}
          onClick={() => setMode("student")}
        >
          🎓 Student Registration
        </button>

        <button
          className={`switch-btn ${mode === "faculty" ? "active" : ""}`}
          onClick={() => setMode("faculty")}
        >
          👨‍🏫 Faculty Registration
        </button>
      </div>

      {/* ===== FORM RENDER ===== */}
      {mode === "student" ? (
        <StudentRegistrationForm />
      ) : (
        <FacultyRegistrationForm />
      )}
    </div>
  );
};

export default App;