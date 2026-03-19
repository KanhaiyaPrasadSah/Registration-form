import React, { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Webcam from 'react-webcam';
import axios from 'axios';
import './App.css';

// 1. Your Hugging Face Backend Registration Endpoint
const BACKEND_URL = "https://kks4u-attendance-backend.hf.space/register";

// 2. Your specific Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWfWyogMKumRUxdYFdkg-XawrejDn_QdpOhETZrAQ-13txic2kBzaA9CDUzSGT4tW7vw/exec";

// Validation Schema
const schema = yup.object({
  name: yup.string().required('Full Name is required'),
  htNo: yup.string().required('H.T No. is required'),
  yearSem: yup.string().required('Required (e.g., 4-2)'),
  branch: yup.string().required('Required'),
  section: yup.string().required('Required'),
  residence: yup.string().required('Please select residence type'),
  phone: yup.string().matches(/^[6-9]\d{9}$/, '10-digit number required').required(),
  gmail: yup.string().email('Invalid email').required(),
  attendance: yup.number().typeError('Required').required(),
  backlogs: yup.string().required('Required (e.g., 8th or 0)'), 
  cgpa: yup.number().typeError('Required').required(),
});

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  // Configuration for Roman Numeral Semesters
  const SEMESTERS = [
    { label: "I-I", key: "I-I SEM BACKLOG SUB", scriptKey: "backlog_1_1" },
    { label: "I-II", key: "I-II SEM BACKLOG SUB", scriptKey: "backlog_1_2" },
    { label: "II-I", key: "II-I SEM BACKLOG SUB", scriptKey: "backlog_2_1" },
    { label: "II-II", key: "II-II SEM BACKLOG SUB", scriptKey: "backlog_2_2" },
    { label: "III-I", key: "III-I SEM BACKLOG SUB", scriptKey: "backlog_3_1" },
    { label: "III-II", key: "III-II SEM BACKLOG SUB", scriptKey: "backlog_3_2" },
    { label: "IV-I", key: "IV-I SEM BACKLOG SUB", scriptKey: "backlog_4_1" },
    { label: "IV-II", key: "IV-II SEM BACKLOG SUB", scriptKey: "backlog_4_2" },
  ];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      residence: "Dayscholar",
      "I-I SEM BACKLOG SUB": "NA",
      "I-II SEM BACKLOG SUB": "NA",
      "II-I SEM BACKLOG SUB": "NA",
      "II-II SEM BACKLOG SUB": "NA",
      "III-I SEM BACKLOG SUB": "NA",
      "III-II SEM BACKLOG SUB": "NA",
      "IV-I SEM BACKLOG SUB": "NA",
      "IV-II SEM BACKLOG SUB": "NA",
    }
  });

  const capture = useCallback(() => {
    const image = webcamRef.current.getScreenshot();
    setImgSrc(image);
    setIsConfirmed(false);
  }, [webcamRef]);

  const confirmPhoto = () => setIsConfirmed(true);
  const retake = () => { setImgSrc(null); setIsConfirmed(false); };

  const onSubmit = async (formData) => {
    if (!isConfirmed) {
      alert("Please capture and confirm your photo first!");
      return;
    }

    setLoading(true);
    try {
      // Create the payload with Roman mapping to Script Keys
      const payload = {
        ...formData,
        image: imgSrc,
        script_url: SCRIPT_URL,
        backlogs: formData.backlogs.toString(),
      };

      // Explicitly map each Roman field to the numeric key the script uses
      SEMESTERS.forEach(sem => {
        payload[sem.scriptKey] = formData[sem.key];
      });

      const response = await axios.post(BACKEND_URL, payload);

      if (response.status === 200) {
        alert("✅ Registration Successful!\nFace vector generated and data synced.");
        reset();
        setImgSrc(null);
        setIsConfirmed(false);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "Unknown Error";
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
          <h1>Student Registration: SmartGate AI</h1>
          <p>Enroll your facial data and academic profile for real-time campus identification.</p>
        </header>

        {/* PHOTO ENROLLMENT */}
        <section className="form-card">
          <label className="section-title">Face Enrollment *</label>
          <div className="camera-section">
            {!imgSrc ? (
              <div className="camera-setup">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" mirrored={true} />
                <button type="button" onClick={capture} className="capture-btn">Capture Enrollment Photo</button>
              </div>
            ) : (
              <div className="preview-setup">
                <img src={imgSrc} alt="Captured" className="webcam-view" />
                {!isConfirmed ? (
                  <div className="confirm-actions">
                    <button type="button" onClick={confirmPhoto} className="confirm-btn">Use This Photo</button>
                    <button type="button" onClick={retake} className="retake-btn">Retake</button>
                  </div>
                ) : (
                  <div className="confirmed-badge">✅ Enrollment Photo Confirmed <button type="button" onClick={retake} className="small-link">Change</button></div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* IDENTITY DETAILS */}
        <section className="form-card">
          <label className="section-title">Identity & Contact</label>
          <div className="field-group">
            <input {...register('name')} placeholder="Full Name (as per ID)" className={errors.name ? 'input-error' : ''} />
            {errors.name && <span className="error-msg">{errors.name.message}</span>}
          </div>
          <div className="field-group">
            <input {...register('htNo')} placeholder="Hall Ticket Number" className={errors.htNo ? 'input-error' : ''} />
            {errors.htNo && <span className="error-msg">{errors.htNo.message}</span>}
          </div>
          
          <div className="field-group">
            <label className="sub-label">Residence Type *</label>
            <select {...register('residence')} className={errors.residence ? 'input-error dropdown-field' : 'dropdown-field'}>
              <option value="Dayscholar">Dayscholar</option>
              <option value="Hosteler">Hosteler</option>
            </select>
            {errors.residence && <span className="error-msg">{errors.residence.message}</span>}
          </div>

          <div className="grid-2">
            <input {...register('phone')} placeholder="Phone Number" />
            <input {...register('gmail')} placeholder="Gmail Address" />
          </div>
        </section>

        {/* ACADEMIC PROFILE */}
        <section className="form-card">
          <label className="section-title">Academic Profile</label>
          <div className="grid-3">
            <input {...register('yearSem')} placeholder="Current Sem (e.g. 1 to 8)" />
            <input {...register('branch')} placeholder="Branch (e.g. IT)" />
            <input {...register('section')} placeholder="Section (A/B)" />
          </div>
          <div className="grid-3" style={{marginTop: '10px'}}>
            <div className="input-stack">
               <small>Attendance %</small>
               <input {...register('attendance')} placeholder="e.g. 85" />
            </div>
            <div className="input-stack">
               <small>Total Backlogs</small>
               <input {...register('backlogs')} type="text" placeholder="e.g. 8th" className={errors.backlogs ? 'input-error' : ''} />
               {errors.backlogs && <span className="error-msg">{errors.backlogs.message}</span>}
            </div>
            <div className="input-stack">
               <small>Current CGPA</small>
               <input {...register('cgpa')} placeholder="e.g. 8.5" />
            </div>
          </div>
        </section>

        {/* BACKLOG SUBJECTS (ROMAN NUMERALS) */}
        <section className="form-card">
          <label className="section-title">Semester Backlog Details (List subjects or 'NA')</label>
          <div className="grid-4">
            {SEMESTERS.map((sem) => (
              <div className="sem-input" key={sem.key}>
                <label>{sem.label} Sem Backlog Sub.</label>
                <input {...register(sem.key)} />
              </div>
            ))}
          </div>
        </section>

        <div className="footer-actions">
          <button type="submit" disabled={loading || !isConfirmed} className="google-submit-btn">
            {loading ? "Processing AI Face Vector..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;