import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchQuizzes } from "../features/quizzes/quizSlice";

function QuizList() {
  const dispatch = useDispatch();
  const { items, listStatus, listError } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <section>
      <div className="page-hero d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small text-primary fw-semibold mb-2">
            Quiz Dashboard
          </p>
          <h1 className="h3 mb-1">Available Quizzes</h1>
          <p className="text-muted mb-0">
            Login is required before you can view and complete your quizzes.
          </p>
        </div>
      </div>

      {listStatus === "loading" && (
        <div className="card shadow-sm">
          <div className="card-body">Loading quizzes...</div>
        </div>
      )}

      {listStatus === "failed" && (
        <div className="alert alert-danger">{listError}</div>
      )}

      {listStatus === "succeeded" && items.length === 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            No quizzes are available right now.
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="row g-4">
          {items.map((quiz) => (
            <div className="col-md-6 col-lg-4" key={quiz._id}>
              <div className="card h-100 shadow-sm border-0 quiz-card">
                <div className="card-body d-flex flex-column">
                  <h2 className="h5">{quiz.title}</h2>
                  <p className="text-muted flex-grow-1">{quiz.description}</p>
                  <p className="small text-secondary mb-3">
                    {quiz.questionCount} question
                    {quiz.questionCount === 1 ? "" : "s"}
                  </p>

                  <Link className="btn btn-primary" to={`/quizzes/${quiz._id}`}>
                    Start Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default QuizList;
