import React, { useState, useRef, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

// ✅ Backend URL (FastAPI)
const BACKEND_URL = "https://kks4u-attendance-backend.hf.space/register";

const schema = yup.object({
  name: yup.string().required('Full Name is required'),
  htNo: yup.string().required('H.T No. is required'),
  yearSem: yup.string().required('Required'),
  branch: yup.string().required('Required'),
  section: yup.string().required('Required'),
  residence: yup.string().required('Select residence type'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, '10-digit number required').required(),
  gmail: yup.string().email('Invalid Gmail').required('Gmail is required'),
  attendance: yup.number().typeError('Must be a number').required(),
  backlogs: yup.number().typeError('Required').min(0).required(),
  cgpa: yup.number().typeError('Required').required(),
});

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const { register, handleSubmit, reset, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      residence: "Dayscholar",
      "1-1 SEM BACKLOG SUB": "NA", "1-2 SEM BACKLOG SUB": "NA",
      "2-1 SEM BACKLOG SUB": "NA", "2-2 SEM BACKLOG SUB": "NA",
      "3-1 SEM BACKLOG SUB": "NA", "3-2 SEM BACKLOG SUB": "NA",
      "4-1 SEM BACKLOG SUB": "NA", "4-2 SEM BACKLOG SUB": "NA",
    }
  });

  const watchedName = useWatch({ control, name: "name", defaultValue: "New Entry" });

  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    setImgSrc(image);
    setIsConfirmed(false);
  }, [webcamRef]);

  const onSubmit = async (data) => {
    if (!isConfirmed) {
      alert("Please capture and confirm your photo first!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: data.htNo,
        name: data.name,
        status: "Student",
        image: imgSrc,

        yearSem: data.yearSem,
        branch: data.branch,
        section: data.section,
        phone: data.phone,
        gmail: data.gmail,
        residence: data.residence,

        attendance: Number(data.attendance),
        backlogs: Number(data.backlogs),
        cgpa: Number(data.cgpa),

        backlog_1_1: data["1-1 SEM BACKLOG SUB"],
        backlog_1_2: data["1-2 SEM BACKLOG SUB"],
        backlog_2_1: data["2-1 SEM BACKLOG SUB"],
        backlog_2_2: data["2-2 SEM BACKLOG SUB"],
        backlog_3_1: data["3-1 SEM BACKLOG SUB"],
        backlog_3_2: data["3-2 SEM BACKLOG SUB"],
        backlog_4_1: data["4-1 SEM BACKLOG SUB"],
        backlog_4_2: data["4-2 SEM BACKLOG SUB"]
      };

      const response = await axios.post(BACKEND_URL, payload);

      if (response.status === 200) {
        alert("✅ Registration Successful! Spreadsheet Updated.");
        reset();
        setImgSrc(null);
        setIsConfirmed(false);
      } else {
        alert("⚠️ Registration failed. Please try again.");
      }
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      const errorMsg = errorDetail ? JSON.stringify(errorDetail) : err.message;
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-form-container">
      <div className="form-header-bar"></div>
      <form onSubmit={handleSubmit(onSubmit)} className="centered-form">
        <header className="form-card">
          <h1>SmartGate AI Master Enrollment</h1>
          <p>Registering Student: <strong>{watchedName}</strong></p>
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
                <button type="button" onClick={capture} className="capture-btn">Capture Face</button>
              </div>
            ) : (
              <div className="preview-setup">
                <img src={imgSrc} alt="Captured" className="webcam-view" />
                <div className="confirm-actions">
                  {!isConfirmed ? (
                    <>
                      <button type="button" onClick={() => setIsConfirmed(true)} className="confirm-btn">Confirm Photo</button>
                      <button type="button" onClick={() => setImgSrc(null)} className="retake-btn">Retake</button>
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
          <label className="section-title">Identity & Contact (A-M)</label>
          <input {...register('name')} placeholder="Full Name" className="full-width-input" />
          <div className="grid-2">
            <input {...register('htNo')} placeholder="Hall Ticket No (ID)" />
            <select {...register('residence')} className="dropdown-field">
              <option value="Dayscholar">Dayscholar</option>
              <option value="Hosteler">Hosteler</option>
            </select>
          </div>
          <div className="grid-2">
            <input {...register('gmail')} placeholder="Official Gmail" />
            <input {...register('phone')} placeholder="Phone Number" />
          </div>
        </section>

        {/* Academic & Scores */}
        <section className="form-card">
          <label className="section-title">Academic & Scores (N-X)</label>
          <div className="grid-3">
            <input {...register('yearSem')} placeholder="Year-Sem (H)" />
            <input {...register('branch')} placeholder="Branch (I)" />
            <input {...register('section')} placeholder="Section (J)" />
          </div>
          <div className="grid-3" style={{marginTop: '15px'}}>
            <input {...register('attendance')} placeholder="Attendance % (N)" />
            <input {...register('backlogs')} placeholder="Total Backlogs (O)" />
            <input {...register('cgpa')} placeholder="CGPA (X)" />
          </div>
        </section>

        {/* Backlog Subjects */}
        <section className="form-card">
          <label className="section-title">Backlog Subjects (P-W)</label>
          <div className="grid-4">
            {["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"].map((sem) => (
              <div className="sem-input" key={sem}>
                <label>{sem}</label>
                <input {...register(`${sem} SEM BACKLOG SUB`)} placeholder="NA" />
              </div>
            ))}
          </div>
        </section>

        <div className="footer-actions">
          <button type="submit" disabled={loading || !isConfirmed} className="google-submit-btn">
            {loading ? "Processing AI Vectors..." : "Finalize Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
