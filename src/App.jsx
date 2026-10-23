
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminQuizzes from "./pages/AdminQuizzes";
import AdminQuestions from "./pages/AdminQuestions";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import QuizDetails from "./pages/QuizDetails";
import QuizList from "./pages/QuizList";
import Signup from "./pages/Signup";

function HomeRedirect() {
  const { user, token } = useSelector((state) => state.auth);
  return <Navigate to={user && token ? "/quizzes" : "/login"} replace />;
}

function QuizDetailsRoute() {
  const { quizId } = useParams();
  return <QuizDetails key={quizId} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QuizList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <QuizDetailsRoute />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout>
                <AdminQuizzes />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute adminOnly>
              <AppLayout>
                <AdminQuestions />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NotFound />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
