import React, { useState } from 'react';
import Thread from '../pages/Thread';
import NewPostModal from '../pages/NewPostModal';

const MedicalForum = () => {
  const [threads, setThreads] = useState([
    {
      id: 1,
      title: "Persistent cough for 3 weeks - should I be concerned?",
      body: "I've had a dry cough that won't go away since my cold cleared up. No fever but sometimes chest tightness. I'm a 28-year-old non-smoker. Is this normal post-viral or should I get checked?",
      author: "John Doe (Patient)",
      communityType: "medical",
      isDoctorAnswered: false,
      isPharmacyAnswered: false,
      answers: []
    }
  ]);
  const [showModal, setShowModal] = useState(false);

  const addThread = (newThread) => {
    setThreads([...threads, { ...newThread, id: threads.length + 1, answers: [] }]);
  };

  const addAnswer = (threadId, answer) => {
    setThreads(threads.map(thread => 
      thread.id === threadId ? { ...thread, answers: [...thread.answers, answer] } : thread
    ));
  };

  return (
    <div>
      <h1>Doctor Answers</h1>
      <button onClick={() => setShowModal(true)}>Create New Post</button>
      {threads.map(thread => (
        <Thread key={thread.id} thread={thread} addAnswer={addAnswer} />
      ))}
      {showModal && (
        <NewPostModal
          communityType="medical"
          onClose={() => setShowModal(false)}
          onSubmit={addThread}
        />
      )}
    </div>
  );
};

export default MedicalForum;
