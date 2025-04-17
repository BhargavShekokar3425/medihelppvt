import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/config"; // Import Firebase services from config

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          setError("Failed to fetch user data.");
          console.error(err);
        }
      } else {
        setError("No user is logged in.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        // Mocked data for recent posts
        const mockPosts = [
          { id: 1, title: "Persistent cough for 3 weeks - should I be concerned?" },
          { id: 2, title: "Can I take paracetamol with my blood pressure medication?" },
        ];
        setRecentPosts(mockPosts);
      } catch (err) {
        console.error("Failed to fetch recent posts:", err);
      }
    };

    fetchRecentPosts();
  }, []);

  if (loading) {
    return <div className="container mt-5"><h3>Loading profile...</h3></div>;
  }

  if (error) {
    return <div className="container mt-5"><h3>Error: {error}</h3></div>;
  }

  return (
    <div>
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{ marginBottom: "32px" }}>
        <div className="col px-0" style={{ color: "black" }}>
          <h1 className="display-4 font-italic">Welcome, {userData.username}!</h1>
          <p className="lead my-3">Here's your health profile overview.</p>
        </div>
      </div>

      <main role="main" className="container">
        <div className="row">
          <div className="col-md-8 blog-main">
            <h3 className="pb-4 mb-4 font-italic border-bottom">Your Information</h3>
            <ul className="list-group list-group-flush">
              <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
              <li className="list-group-item"><strong>Role:</strong> {userData.role}</li>
              <li className="list-group-item"><strong>Username:</strong> {userData.username}</li>
              <li className="list-group-item"><strong>Date of Birth:</strong> {userData.dob}</li>
              <li className="list-group-item"><strong>Address:</strong> {userData.address}</li>
              <li className="list-group-item"><strong>Contact Number:</strong> {userData.contact}</li>
              <li className="list-group-item"><strong>Blood Group:</strong> {userData.bloodGroup}</li>
              <li className="list-group-item"><strong>Gender:</strong> {userData.gender}</li>
              <li className="list-group-item"><strong>Existing Allergies:</strong> {userData.allergies}</li>
            </ul>

            <h3 className="pb-4 mb-4 font-italic border-bottom">Community Forum</h3>
            <p>Engage with the community by asking questions or sharing your knowledge.</p>
            <ul className="list-group">
              {recentPosts.map(post => (
                <li key={post.id} className="list-group-item">
                  <Link to={`/community-forums/${post.id}`} style={{ textDecoration: "none", color: "#007bff" }}>
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/community-forums" className="btn btn-primary mt-3">Go to Community Forum</Link>
          </div>

          <aside className="col-md-4 blog-sidebar">
            <div className="p-4 mb-3 bg-light rounded gradient-bg">
              <h4 className="font-italic text-black">About</h4>
              <p className="mb-0">
                MediHelp is your all-in-one medical companion, making healthcare access seamless and convenient. 
                Schedule doctor appointments, request prescriptions, and manage your health effortlessly with Google Calendar integration. 
                In emergencies, send out SOS requests instantly. Stay connected with the right medical help—anytime, anywhere.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
