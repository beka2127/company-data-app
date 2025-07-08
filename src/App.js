// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Footer from './components/Footer';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
        setIsLoggedIn(true);
        sessionStorage.setItem('loggedInUsername', user.username);
        // Navigate based on role after successful re-login
        if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
        fetchData(); // Fetch data immediately on re-login
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        handleLogout();
      }
    } else {
        navigate('/'); // If not logged in, go to login page
    }
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, departmentsRes, tasksRes, announcementsRes, attachmentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/departments'),
        fetch('http://localhost:5000/api/tasks'),
        fetch('http://localhost:5000/api/announcements'),
        fetch('http://localhost:5000/api/attachments'),
      ]);

      const usersData = await usersRes.json();
      const departmentsData = await departmentsRes.json();
      const tasksData = await tasksRes.json();
      const announcementsData = await announcementsRes.json();
      const attachmentsData = await attachmentsRes.json();

      setUsers(usersData);
      setDepartments(departmentsData);
      setTasks(tasksData);
      setAnnouncements(announcementsData);
      setAttachments(attachmentsData);

    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  useEffect(() => {
    // This effect runs whenever isLoggedIn changes.
    // fetchData is already called on initial mount if logged in via session storage.
    // If logging in explicitly via Login component, handleLogin will call fetchData.
    // So this useEffect could be less critical if handleLogin/mount handles it.
    // Keeping it for robustness, but it might trigger an extra fetch.
    if (isLoggedIn) {
        // fetchData(); // Commenting out to prevent double-fetch on login if handleLogin also calls it.
    }
  }, [isLoggedIn]); // Fetch data whenever login status changes

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setLoggedInUser(user);
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    sessionStorage.setItem('loggedInUsername', user.username);
    if (user.role === 'admin') {
        navigate('/admin');
    } else {
        navigate('/dashboard');
    }
    fetchData(); // Fetch data after successful login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUsername');
    setUsers([]);
    setDepartments([]);
    setTasks([]);
    setAnnouncements([]);
    setAttachments([]);
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header
            userRole={loggedInUser?.role}
            username={loggedInUser?.username}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
          <div className="content-area">
            <Routes>
              <Route path="/dashboard" element={
                <MainContent
                  currentUserRole={loggedInUser?.role}
                  currentUserDepartmentId={loggedInUser?.departmentId}
                  users={users}
                  departments={departments}
                  tasks={tasks}
                  announcements={announcements}
                  attachments={attachments}
                  refreshData={fetchData}
                />
              } />
              {loggedInUser?.role === 'admin' && (
                <Route path="/admin" element={
                  <AdminDashboard
                    users={users}
                    departments={departments}
                    refreshData={fetchData}
                  />
                } />
              )}
              {/* Fallback route - if logged in, go to dashboard, else login */}
              <Route path="/" element={isLoggedIn ? <MainContent currentUserRole={loggedInUser?.role} currentUserDepartmentId={loggedInUser?.departmentId} users={users} departments={departments} tasks={tasks} announcements={announcements} attachments={attachments} refreshData={fetchData} /> : <Login onLogin={handleLogin} />} />
              <Route path="*" element={isLoggedIn ? <MainContent currentUserRole={loggedInUser?.role} currentUserDepartmentId={loggedInUser?.departmentId} users={users} departments={departments} tasks={tasks} announcements={announcements} attachments={attachments} refreshData={fetchData} /> : <Login onLogin={handleLogin} />} />
            </Routes>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;