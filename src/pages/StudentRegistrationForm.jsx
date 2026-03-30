import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Webcam from "react-webcam";
import axios from "axios";
import "./StudentRegistrationForm.css";

// ✅ Backend URL (FastAPI handles face vector + Apps Script forwarding)
const BACKEND_URL = "https://kks4u-attendance-backend.hf.space/register";

// ================= VALIDATION SCHEMA =================
const schema = yup.object({
  name: yup.string().required("Full Name is required"),
  htNo: yup.string().required("H.T No. is required"),
  gender: yup.string().required("Select Gender"),
  yearSem: yup.string().required("Required"),
  branch: yup.string().required("Required"),
  section: yup.string().required("Required"),
  residence: yup.string().required("Enter residence type"),
  phone: yup.string().matches(/^[6-9]\d{9}$/, "10-digit number required").required(),
  gmail: yup.string().email("Invalid Gmail").required("Gmail is required"),
  attendance: yup.number().typeError("Must be a number").required(),
  backlogs: yup.number().typeError("Required").min(0).required(),
  cgpa: yup.number().typeError("Required").required(),
});

// ================= MAIN COMPONENT =================
function StudentRegistrationForm() {
  const [imgSrc, setImgSrc] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driveLink, setDriveLink] = useState(null);
  const webcamRef = useRef(null);

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gender: "Prefer not to say",
      residence: "",
      backlog_1_1: "NA",
      backlog_1_2: "NA",
      backlog_2_1: "NA",
      backlog_2_2: "NA",
      backlog_3_1: "NA",
      backlog_3_2: "NA",
      backlog_4_1: "NA",
      backlog_4_2: "NA",
    },
  });

  // ================= CAPTURE WEBCAM IMAGE =================
  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    if (!image) {
      alert("❌ Failed to capture image. Please try again.");
      return;
    }
    setImgSrc(image);
    setIsConfirmed(false);
  }, []);

  // ================= SUBMIT FORM =================
  const onSubmit = async (data) => {
    if (!isConfirmed) {
      alert("❌ Please capture and confirm photo first!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id: data.htNo,
        name: data.name,
        status: "Student",
        image: imgSrc,
        gender: data.gender,
        yearSem: data.yearSem,
        branch: data.branch,
        section: data.section,
        residence: data.residence,
        phone: data.phone,
        gmail: data.gmail,
        attendance: Number(data.attendance),
        backlogs: Number(data.backlogs),
        cgpa: Number(data.cgpa),
        backlog_1_1: data.backlog_1_1,
        backlog_1_2: data.backlog_1_2,
        backlog_2_1: data.backlog_2_1,
        backlog_2_2: data.backlog_2_2,
        backlog_3_1: data.backlog_3_1,
        backlog_3_2: data.backlog_3_2,
        backlog_4_1: data.backlog_4_1,
        backlog_4_2: data.backlog_4_2,
      };

      const response = await axios.post(BACKEND_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status === "success") {
        const link = response.data.link || null;
        setDriveLink(link);

        if (link) {
          alert(`✅ Registration Successful!\n📂 Image Link: ${link}`);
        } else {
          alert(
            "⚠️ Registration saved, but image upload failed.\nPlease check Apps Script folder permissions."
          );
        }

        reset();
        setImgSrc(null);
        setIsConfirmed(false);
      } else {
        alert("⚠️ Registration Failed: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ================= JSX =================
  return (
    <div className="google-form-container">
      <div className="form-header-bar"></div>
      <form onSubmit={handleSubmit(onSubmit)} className="centered-form">
        <header className="form-card">
          <h1>SmartGate Enrollment</h1>
          <p className="subtitle">Student Registration Form</p>
        </header>

        {/* Face Capture */}
        <section className="form-card">
          <label className="section-title">Face Enrollment *</label>
          <div className="camera-section">
            {!imgSrc ? (
              <div className="camera-setup">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 640, height: 480 }}
                  className="webcam-view"
                  mirrored={true}
                />
                <button type="button" onClick={capture} className="capture-btn">
                  Capture Face
                </button>
              </div>
            ) : (
              <div className="preview-setup">
                <img src={imgSrc} alt="Captured" className="webcam-view" />
                <div className="confirm-actions">
                  {!isConfirmed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsConfirmed(true)}
                        className="confirm-btn"
                      >
                        Confirm Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImgSrc(null)}
                        className="retake-btn"
                      >
                        Retake
                      </button>
                    </>
                  ) : (
                    <div className="confirmed-badge">✅ Photo Ready</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Identity & Contact */}
        <section className="form-card">
          <label className="section-title">Identity & Contact</label>
          <input {...register("name")} placeholder="Full Name" />
          <div className="grid-2">
            <input {...register("htNo")} placeholder="Hall Ticket No" />
            <input {...register("residence")} placeholder="Residence (Dayscholar/Hosteler)" />
          </div>
          <div className="grid-2">
            <input {...register("gmail")} placeholder="Gmail" />
            <input {...register("phone")} placeholder="Phone Number" />
          </div>
          <div className="grid-2" style={{ marginTop: "10px" }}>
            <label>Gender</label>
            <select {...register("gender")}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </section>

        {/* Academic & Scores */}
        <section className="form-card">
          <label className="section-title">Academic Details</label>
          <div className="grid-3">
            <select {...register("yearSem")}>
  <option value="">Select Semester</option>
  <option value="Sem 1">Sem 1</option>
  <option value="Sem 2">Sem 2</option>
  <option value="Sem 3">Sem 3</option>
  <option value="Sem 4">Sem 4</option>
  <option value="Sem 5">Sem 5</option>
  <option value="Sem 6">Sem 6</option>
  <option value="Sem 7">Sem 7</option>
  <option value="Sem 8">Sem 8</option>
</select>
            <input {...register("branch")} placeholder="Branch" />
            <input {...register("section")} placeholder="Section" />
          </div>
          <div className="grid-3" style={{ marginTop: "15px" }}>
            <input {...register("attendance")} placeholder="Attendance %" />
            <input {...register("backlogs")} placeholder="Total Backlogs" />
            <input {...register("cgpa")} placeholder="CGPA" />
          </div>
        </section>

        {/* Backlog Subjects */}
        <section className="form-card">
          <label className="section-title">Backlog Subjects</label>
          <div className="grid-4">
            {[
              "backlog_1_1",
              "backlog_1_2",
              "backlog_2_1",
              "backlog_2_2",
              "backlog_3_1",
              "backlog_3_2",
              "backlog_4_1",
              "backlog_4_2",
            ].map((sem) => (
              <div className="sem-input" key={sem}>
                <label>{sem.replace("backlog_", "").replace("_", "-")}</label>
                <input {...register(sem)} placeholder="NA" />
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="footer-actions">
          <button
            type="submit"
            disabled={loading || !isConfirmed}
            className="google-submit-btn"
          >
            {loading ? "Processing..." : "Submit Enrollment"}
          </button>
        </div>
      </form>

      
    </div>
  );
}

export default StudentRegistrationForm;