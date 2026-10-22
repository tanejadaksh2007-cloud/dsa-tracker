import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import HomePage from './pages/HomePage';
import TopicPage from './pages/TopicPage';
import NotesPage from './pages/NotesPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import PersonalProblemsPage from './pages/PersonalProblemsPage';
import ProblemExplorerPage from './pages/ProblemExplorerPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <ToastProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              {/* Public-only authentication routes (redirect authenticated users away) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignUpPage />} />
              </Route>

              {/* Protected dashboard routes (redirect unauthenticated users to /login) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="problems" element={<ProblemExplorerPage />} />
                  <Route path="topic/:topicId" element={<TopicPage />} />
                  <Route path="custom-problems" element={<PersonalProblemsPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
