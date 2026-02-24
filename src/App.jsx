import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

// 1. Hugging Face Backend Registration Endpoint
const BACKEND_URL = "https://kks4u-attendance-backend.hf.space/register";

// 2. UPDATED: Your specific Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmZ34KO3_bi24EKzmGUYHQAhivZhzdsCeqxlmwwso1ToKndNOyHZyINir5v3LkfaYZ7g/exec";

// Validation Schema
const schema = yup.object({
  name: yup.string().required('Full Name is required'),
  htNo: yup.string().required('H.T No. is required'),
  yearSem: yup.string().required('Required (e.g., 4-2)'),
  branch: yup.string().required('Required'),
  section: yup.string().required('Required'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, '10-digit number required').required(),
  gmail: yup.string().email('Invalid email').required(),
  attendance: yup.number().typeError('Required').required(),
  backlogs: yup.number().typeError('Required').required(),
  cgpa: yup.number().typeError('Required').required(),
});

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      backlog_1_1: "0",
      backlog_1_2: "0",
      backlog_2_1: "0",
      backlog_2_2: "0",
      backlog_3_1: "0",
      backlog_3_2: "0",
      backlog_4_1: "0",
      backlog_4_2: "0",
    }
  });

  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    setImgSrc(image);
    setIsConfirmed(false);
  }, [webcamRef]);

  const confirmPhoto = () => setIsConfirmed(true);
  const retake = () => { setImgSrc(null); setIsConfirmed(false); };

  const onSubmit = async (data) => {
    if (!isConfirmed) {
      alert("Please capture and confirm your photo first!");
      return;
    }

    setLoading(true);
    try {
      // Sending data to HF Backend which processes the Face Vector and pushes to Google Sheets
      const response = await axios.post(BACKEND_URL, {
        ...data,
        image: imgSrc,
        script_url: SCRIPT_URL
      });

      if (response.status === 200) {
        alert("✅ Registration Successful!\nYour face vector has been generated and details saved to the database.");
        reset();
        setImgSrc(null);
        setIsConfirmed(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
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
          <h1>Student Registration Form</h1>
          <p>Register your identity to enable AI Face Recognition at SmartGate terminals.</p>
        </header>

        {/* PHOTO SECTION */}
        <section className="form-card">
          <label className="section-title">Face Enrollment (Camera) *</label>
          <div className="camera-section">
            {!imgSrc ? (
              <div className="camera-setup">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" />
                <button type="button" onClick={capture} className="capture-btn">Capture Face</button>
              </div>
            ) : (
              <div className="preview-setup">
                <img src={imgSrc} alt="Captured" className="webcam-view" />
                {!isConfirmed ? (
                  <div className="confirm-actions">
                    <button type="button" onClick={confirmPhoto} className="confirm-btn">Confirm Photo</button>
                    <button type="button" onClick={retake} className="retake-btn">Retake</button>
                  </div>
                ) : (
                  <div className="confirmed-badge">✅ Face Confirmed <button type="button" onClick={retake} className="small-link">Change</button></div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* IDENTITY DETAILS */}
        <section className="form-card">
          <label className="section-title">Identity Details</label>
          <div className="field-group">
            <input {...register('name')} placeholder="Full Name" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="error-msg">{errors.name.message}</span>}
          </div>
          <div className="field-group">
            <input {...register('htNo')} placeholder="Hall Ticket No." className={errors.htNo ? 'input-error' : ''} />
            {errors.htNo && <span className="error-msg">{errors.htNo.message}</span>}
          </div>
        </section>

        {/* ACADEMIC DETAILS */}
        <section className="form-card">
          <label className="section-title">Academic Details</label>
          <div className="grid-3">
            <input {...register('yearSem')} placeholder="Year/Sem (e.g. 4-2)" />
            <input {...register('branch')} placeholder="Branch (e.g. IT)" />
            <input {...register('section')} placeholder="Section" />
          </div>
          <div className="grid-2">
            <input {...register('phone')} placeholder="Phone Number" />
            <input {...register('gmail')} placeholder="Gmail Address" />
          </div>
        </section>

        {/* PERFORMANCE & BACKLOGS */}
        <section className="form-card">
          <label className="section-title">Performance & Backlogs</label>
          <div className="grid-3">
            <input {...register('attendance')} placeholder="Attendance %" />
            <input {...register('backlogs')} placeholder="Total Backlogs" />
            <input {...register('cgpa')} placeholder="Current CGPA" />
          </div>

          <div className="sem-marks-header">BACKLOG SUBJECT DETAILS (Use 0 if clear)</div>
          <div className="grid-4">
            <input {...register('backlog_1_1')} placeholder="1-1 Subs" />
            <input {...register('backlog_1_2')} placeholder="1-2 Subs" />
            <input {...register('backlog_2_1')} placeholder="2-1 Subs" />
            <input {...register('backlog_2_2')} placeholder="2-2 Subs" />
            <input {...register('backlog_3_1')} placeholder="3-1 Subs" />
            <input {...register('backlog_3_2')} placeholder="3-2 Subs" />
            <input {...register('backlog_4_1')} placeholder="4-1 Subs" />
            <input {...register('backlog_4_2')} placeholder="4-2 Subs" />
          </div>
        </section>

        <div className="footer-actions">
          <button type="submit" disabled={loading || !isConfirmed} className="google-submit-btn">
            {loading ? "Processing AI Vector..." : "Submit Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;