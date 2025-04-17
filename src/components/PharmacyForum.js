import React, { useEffect, useState } from 'react';
import { mockFirestore } from '../firebase/mockServices';
import Thread from '../pages/Thread';
import NewPostModal from '../pages/NewPostModal';

const PharmacyForum = () => {
  const [threads, setThreads] = useState([
    {
      id: 1,
      title: "Can I take paracetamol with my blood pressure medication?",
      body: "I'm on amlodipine 5mg daily. Got fever today (38°C). Is it safe to take 500mg paracetamol or should I ask my doctor first?",
      author: "Jane Smith (Patient)",
      communityType: "pharmacy",
      isDoctorAnswered: false,
      isPharmacyAnswered: false,
      answers: []
    }
  ]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      const snapshot = await mockFirestore.collection('threads').where('communityType', '==', 'pharmacy').get();
      setThreads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchThreads();
  }, []);

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
      <h1>Pharmacy Answers</h1>
      <button onClick={() => setShowModal(true)}>Create New Post</button>
      {threads.map(thread => (
        <Thread key={thread.id} thread={thread} addAnswer={addAnswer} />
      ))}
      {showModal && (
        <NewPostModal
          communityType="pharmacy"
          onClose={() => setShowModal(false)}
          onSubmit={addThread}
        />
      )}
    </div>
  );
};

export default PharmacyForum;
