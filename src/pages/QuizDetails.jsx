import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ResultModal from "../components/ResultModal";
import {
  clearCurrentQuiz,
  clearQuizResult,
  fetchQuizById,
  submitQuiz,
} from "../features/quizzes/quizSlice";

function QuizDetails() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const {
    currentQuiz,
    detailStatus,
    detailError,
    result,
    submitStatus,
    submitError,
  } = useSelector((state) => state.quizzes);

  const [answers, setAnswers] = useState({});
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    dispatch(clearQuizResult());
    dispatch(fetchQuizById(quizId));

    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, quizId]);

  const unansweredQuestions = useMemo(() => {
    if (!currentQuiz?.questions) {
      return [];
    }

    return currentQuiz.questions.filter(
      (question) => typeof answers[question._id] !== "number"
    );
  }, [answers, currentQuiz]);

  const handleSelectAnswer = (questionId, answerIndex) => {
    setValidationError("");
    setAnswers((current) => ({
      ...current,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!currentQuiz?.questions?.length) {
      return;
    }

    if (unansweredQuestions.length > 0) {
      setValidationError("Please answer every question before submitting.");
      return;
    }

    setValidationError("");
    dispatch(submitQuiz({ quizId, answers }));
  };

  if (detailStatus === "loading") {
    return (
      <div className="card shadow-sm">
        <div className="card-body">Loading quiz details...</div>
      </div>
    );
  }

  if (detailStatus === "failed") {
    return (
      <div className="alert alert-danger">
        {detailError}
        <div className="mt-3">
          <Link className="btn btn-outline-primary" to="/quizzes">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return null;
  }

  const showResultModal = Boolean(result);

  return (
    <section>
      <div className="mb-4">
        <Link className="btn btn-outline-secondary btn-sm mb-3" to="/quizzes">
          Back to Quiz List
        </Link>
        <h1 className="h3 mb-1">{currentQuiz.title}</h1>
        <p className="text-muted mb-0">{currentQuiz.description}</p>
      </div>

      {currentQuiz.questions?.length ? (
        <div className="d-grid gap-3">
          {currentQuiz.questions.map((question, questionIndex) => (
            <div className="card shadow-sm border-0" key={question._id}>
              <div className="card-body">
                <h2 className="h5 mb-3">
                  Question {questionIndex + 1}
                </h2>
                <p className="mb-3">{question.text}</p>

                <div className="list-group">
                  {question.options.map((option, optionIndex) => {
                    const inputId = `${question._id}-${optionIndex}`;
                    return (
                      <label
                        className="list-group-item list-group-item-action"
                        htmlFor={inputId}
                        key={inputId}
                      >
                        <div className="form-check m-0">
                          <input
                            id={inputId}
                            className="form-check-input me-2"
                            type="radio"
                            name={question._id}
                            checked={answers[question._id] === optionIndex}
                            onChange={() =>
                              handleSelectAnswer(question._id, optionIndex)
                            }
                          />
                          <span>{option}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {(validationError || submitError) && (
            <div className="alert alert-danger">
              {validationError || submitError}
            </div>
          )}

          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={submitStatus === "loading"}
            >
              {submitStatus === "loading" ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            This quiz does not contain any questions yet.
          </div>
        </div>
      )}

      {showResultModal && result && (
        <ResultModal
          result={result}
          questions={currentQuiz.questions || []}
          onClose={() => dispatch(clearQuizResult())}
        />
      )}
    </section>
  );
}

export default QuizDetails;
