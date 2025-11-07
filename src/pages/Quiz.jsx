import React, { useState, useEffect, useCallback } from 'react';

import quizData from "./quizData.json";
import "./Quiz.css";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Quiz = ({ videoId, onClose, selectedVideo, userDetails }) => {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

 

  useEffect(() => {
    const data = quizData[videoId];
    if (data) setQuestions(data.slice(0, 10)); 
  }, [videoId]);

  const handleNext = () => {
    const current = questions[qIndex];

    if (selectedOption === current.answer) {
      setScore(score + 1);
    }

    setSelectedOption("");

    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const downloadCertificate = async () => {
    const cert = document.getElementById("certificate");
    const canvas = await html2canvas(cert);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("certificate.pdf");
  };

  if (!questions.length) {
    return (
      <div className="quiz-container">
        <h2>No quiz available for this video.</h2>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    );
  }

  if (showResult) {
    const passed = score >= 6;

    return (
      <div className="quiz-container result">

        {passed ? (
          <>
            <h2>🎉 Congratulations!</h2>
            <p>You passed the quiz!</p>

           <div id="certificate" className="certificate-box">

  <div className="cert-header">
    <h1 className="college-name">Adhiyamaan College of Engineering</h1>
    <img src="/logo.png" alt="College Logo" className="college-logo" />
  </div>

  <h3 className="dept-name">Department of Information Technology</h3>

  <h2 className="cert-title">Certificate of Achievement</h2>

  <p className="cert-text">This is to certify that</p>

  <h2 className="cert-name">
    {userDetails?.username || "Student"}
  </h2>

  <p className="cert-text">has successfully completed the quiz for</p>

  <h3 className="cert-video">
    {selectedVideo?.title || "Video Lesson"}
  </h3>

  <p className="cert-score-text">
    Score: <strong>{score}/10</strong>
  </p>

  <div className="cert-footer-row">
    <div className="sign-block">
      <div className="sign-line"></div>
      <span>Instructor Signature</span>
    </div>

    <div className="date-block">
      <p>Issued On:</p>
      <strong>{new Date().toLocaleDateString()}</strong>
    </div>
  </div>

</div>



            <button className="next-btn" onClick={downloadCertificate}>
              Download Certificate
            </button>

            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2>❌ Try Again</h2>
            <p>Your score: {score}/10</p>
            <p>You need at least 6 to pass.</p>

            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        )}

      </div>
    );
  }

  const current = questions[qIndex];

  return (
    <div className="quiz-container">
      <h2>Question {qIndex + 1} / {questions.length}</h2>
      <p className="quiz-question">{current.question}</p>

      <div className="quiz-options">
        {current.options.map((opt, idx) => (
          <label key={idx} className="quiz-option">
            <input
              type="radio"
              name="option"
              value={opt}
              checked={selectedOption === opt}
              onChange={() => setSelectedOption(opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      <button
        className="next-btn"
        disabled={!selectedOption}
        onClick={handleNext}
      >
        Next
      </button>

      <button className="close-btn secondary" onClick={onClose}>
        Exit
      </button>
    </div>
  );
};

export default Quiz;
