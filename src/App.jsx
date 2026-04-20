import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Page Imports
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ProfileCreation from './pages/ProfileCreation';
import PersonalityTest from './pages/PersonalityTest';
import AptitudeTest from './pages/AptitudeTest';
import CareerRecommendations from './pages/CareerRecommendations';
import Roadmap from './pages/Roadmap';
import Mentorship from './pages/Mentorship';
import MentorProfilePublic from './pages/MentorProfilePublic';
import DiscoveryReport from './pages/DiscoveryReport';
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
        <Toaster position="top-right" />
        <main className="flex-grow w-full">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Role-based Dashboards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />

            {/* Student Journey */}
            <Route path="/profile-creation" element={<ProfileCreation />} />
            <Route path="/personality-test" element={<PersonalityTest />} />
            <Route path="/aptitude-test" element={<AptitudeTest />} />
            <Route path="/discovery-report" element={<DiscoveryReport />} />
            <Route path="/career-recommendations" element={<CareerRecommendations />} />
            <Route path="/roadmap" element={<Roadmap />} />

            {/* Mentorship */}
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mentorship/:mentorId" element={<MentorProfilePublic />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}