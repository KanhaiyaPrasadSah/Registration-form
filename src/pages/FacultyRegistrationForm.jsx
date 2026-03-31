import React, { useState, useRef, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import Webcam from "react-webcam";
import axios from "axios";
import "./FacultyRegistrationForm.css";

/* 🔥 BACKEND */
const BACKEND_URL =
  "https://gnitit-smart-gate-ai-backend.hf.space/register";

/* ================= COMPONENT ================= */
const FacultyRegistrationForm = () => {
  const [imgSrc, setImgSrc] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      department: "",
      designation: "",
      residence: "",
      gender: "Prefer not to say",
      qualification: "",
    },
  });

  const watchedName = useWatch({
    control,
    name: "name",
    defaultValue: "New Faculty",
  });

  /* ================= CAPTURE ================= */
  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    setImgSrc(image);
    setIsConfirmed(false);
  }, []);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data) => {
    if (!isConfirmed) {
      alert("❌ Please capture and confirm your photo first!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: data.facultyId,
        name: data.name,
        status: "Faculty",
        image: imgSrc,

        department: data.department,
        designation: data.designation,
        phone: data.phone,
        gmail: data.gmail,
        residence: data.residence,
        gender: data.gender,
        qualification: data.qualification, // ✅ Added qualification
      };

      const response = await axios.post(BACKEND_URL, payload);

      if (response.status === 200) {
        alert("✅ Faculty Registered Successfully!");
        reset();
        setImgSrc(null);
        setIsConfirmed(false);
      } else {
        alert("⚠️ Registration failed.");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      alert(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="google-form-container">
      <div className="form-header-bar"></div>

      <form onSubmit={handleSubmit(onSubmit)} className="centered-form">
        {/* HEADER */}
        <header className="form-card">
          <h1>Faculty Enrollment</h1>
          <p>
            Registering: <strong>{watchedName}</strong>
          </p>
        </header>

        {/* FACE CAPTURE */}
        <section className="form-card">
          <label className="section-title">Face Enrollment *</label>

          <div className="camera-section">
            {!imgSrc ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="webcam-view"
                  mirrored
                />
                <button
                  type="button"
                  onClick={capture}
                  className="capture-btn"
                >
                  Capture Face
                </button>
              </>
            ) : (
              <>
                <img src={imgSrc} alt="Captured" className="webcam-view" />

                {!isConfirmed ? (
                  <div className="confirm-actions">
                    <button
                      type="button"
                      onClick={() => setIsConfirmed(true)}
                      className="confirm-btn"
                    >
                      Confirm
                    </button>

                    <button
                      type="button"
                      onClick={() => setImgSrc(null)}
                      className="retake-btn"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div className="confirmed-badge">✅ Photo Ready</div>
                )}
              </>
            )}
          </div>
        </section>

        {/* FACULTY DETAILS */}
        <section className="form-card">
          <label className="section-title">Faculty Details</label>

          <input
            {...register("name", { required: true })}
            placeholder="Full Name"
          />

          <div className="grid-2">
            <input
              {...register("facultyId", { required: true })}
              placeholder="Faculty ID"
            />

            <input
              {...register("department", { required: true })}
              placeholder="Department"
            />
          </div>

          <div className="grid-2">
            <input
              {...register("designation", { required: true })}
              placeholder="Designation"
            />

            <input
              {...register("qualification")}
              placeholder="Qualification" // ✅ New field
            />
          </div>

          <div className="grid-2">
            <input
              {...register("phone")}
              placeholder="Phone Number"
            />

            <input
              {...register("gmail")}
              placeholder="Official Gmail"
            />
          </div>

          <div className="grid-2">
            <input
              {...register("residence")}
              placeholder="Residence"
            />

            {/* Gender Dropdown */}
            <select {...register("gender")}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say(Gender)</option>
            </select>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="footer-actions">
          <button
            type="submit"
            disabled={loading || !isConfirmed}
            className="google-submit-btn"
          >
            {loading ? "Processing..." : "Register Faculty"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyRegistrationForm;