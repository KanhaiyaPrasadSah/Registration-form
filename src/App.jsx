import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Webcam from 'react-webcam';
import './App.css';

// Your Updated Final Web App URL
const PROXY_URL = 'https://script.google.com/macros/s/AKfycbzLx5CrxaZO9ypnrO361xy-aPi86Vpl4VCXpu1j31bChxhM094QcF4CqLAtnwpM6zSMyg/exec';

const schema = yup.object({
  name: yup.string().required('Full Name is required'),
  htNo: yup.string().required('H.T No. is required'),
  yearSem: yup.string().required('Required'),
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
    resolver: yupResolver(schema)
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
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        mode: 'no-cors', // Keeps it simple for Google Apps Script
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...data, image: imgSrc }),
      });

      // Since no-cors is active, we provide a success alert that mentions the update logic
      alert("✅ Submission Processed!\n\nIf your H.T No. already existed, your record has been updated/replaced. Duplicate entries have been prevented.");
      
      reset();
      setImgSrc(null);
      setIsConfirmed(false);
    } catch (err) {
      alert("❌ Submission error. Please check your connection or Web App URL.");
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
          <p>Please provide accurate details. Existing records will be updated automatically.</p>
        </header>

        {/* PHOTO SECTION */}
        <section className="form-card">
          <label className="section-title">Student Photo (Camera Only) *</label>
          <div className="camera-section">
            {!imgSrc ? (
              <div className="camera-setup">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" />
                <button type="button" onClick={capture} className="capture-btn">Take Photo</button>
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
                  <div className="confirmed-badge">✅ Photo Confirmed <button type="button" onClick={retake} className="small-link">Change</button></div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* IDENTITY DETAILS */}
        <section className="form-card">
          <label className="section-title">Identity Details</label>
          <input {...register('name')} placeholder="Full Name" />
          {errors.name && <span className="error-msg">{errors.name.message}</span>}
          <input {...register('htNo')} placeholder="H.T No." />
          {errors.htNo && <span className="error-msg">{errors.htNo.message}</span>}
        </section>

        {/* ACADEMIC DETAILS */}
        <section className="form-card">
          <label className="section-title">Academic Details</label>
          <div className="grid-3">
            <input {...register('yearSem')} placeholder="Year/Sem" />
            <input {...register('branch')} placeholder="Branch" />
            <input {...register('section')} placeholder="Section" />
          </div>
          <div className="grid-2">
            <input {...register('phone')} placeholder="Phone" />
            <input {...register('gmail')} placeholder="Gmail" />
          </div>
        </section>

        {/* PERFORMANCE & BACKLOGS */}
        <section className="form-card">
          <label className="section-title">Performance & Backlogs</label>
          <div className="grid-3">
            <input {...register('attendance')} placeholder="Attendance %" />
            <input {...register('backlogs')} placeholder="Total Backlogs" />
            <input {...register('cgpa')} placeholder="CGPA" />
          </div>

          <div className="sem-marks-header">BACKLOG SUBJECT DETAILS (1-1 to 4-2)</div>
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
            {loading ? "Registering..." : "Submit Student Data"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;