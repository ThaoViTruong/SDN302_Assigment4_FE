import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackModal from "../components/FeedbackModal";
import QuestionFormModal from "../components/QuestionFormModal";
import {
  clearQuestionFeedback,
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  updateQuestion,
} from "../features/questions/questionSlice";

function AdminQuestions() {
  const dispatch = useDispatch();
  const { items, status, error, actionStatus, actionError } = useSelector(
    (state) => state.questions
  );

  const [modalMode, setModalMode] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const questionCountLabel = useMemo(() => {
    if (!items.length) {
      return "No questions";
    }

    return `${items.length} question${items.length === 1 ? "" : "s"}`;
  }, [items.length]);

  const handleCreate = async (payload) => {
    try {
      await dispatch(createQuestion(payload)).unwrap();
      setModalMode("");
      setActiveQuestion(null);
      setFeedback({
        title: "Question Created",
        message: "The question has been created successfully.",
      });
      dispatch(clearQuestionFeedback());
    } catch {
      return;
    }
  };

  const handleUpdate = async (payload) => {
    if (!activeQuestion) {
      return;
    }

    try {
      await dispatch(
        updateQuestion({
          questionId: activeQuestion._id,
          payload,
        })
      ).unwrap();
      setModalMode("");
      setActiveQuestion(null);
      setFeedback({
        title: "Question Updated",
        message: "The question has been updated successfully.",
      });
      dispatch(clearQuestionFeedback());
    } catch {
      return;
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) {
      return;
    }

    try {
      await dispatch(deleteQuestion(questionToDelete._id)).unwrap();
      setQuestionToDelete(null);
      setFeedback({
        title: "Question Deleted",
        message: "The question has been deleted successfully.",
      });
      dispatch(clearQuestionFeedback());
    } catch {
      return;
    }
  };

  const openCreateModal = () => {
    dispatch(clearQuestionFeedback());
    setActiveQuestion(null);
    setModalMode("create");
  };

  const openEditModal = (question) => {
    dispatch(clearQuestionFeedback());
    setActiveQuestion(question);
    setModalMode("edit");
  };

  const closeFormModal = () => {
    if (actionStatus === "loading") {
      return;
    }

    dispatch(clearQuestionFeedback());
    setActiveQuestion(null);
    setModalMode("");
  };

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Admin Question Management</h1>
          <p className="text-muted mb-0">
            Create, edit, and remove questions used by your quizzes.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          Create Question
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Questions</h2>
            <span className="badge text-bg-secondary">{questionCountLabel}</span>
          </div>

          {status === "loading" && <p className="mb-0">Loading questions...</p>}

          {status === "failed" && (
            <div className="alert alert-danger mb-0">{error}</div>
          )}

          {status === "succeeded" && items.length === 0 && (
            <p className="mb-0">No questions have been created yet.</p>
          )}

          {items.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Keywords</th>
                    <th>Correct Answer</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((question) => (
                    <tr key={question._id}>
                      <td className="fw-medium">{question.text}</td>
                      <td>
                        <ol className="mb-0 ps-3">
                          {question.options.map((option, index) => (
                            <li key={`${question._id}-${index}`}>{option}</li>
                          ))}
                        </ol>
                      </td>
                      <td>
                        {question.keywords?.length
                          ? question.keywords.join(", ")
                          : "No keywords"}
                      </td>
                      <td>
                        {typeof question.correctAnswerIndex === "number"
                          ? question.options[question.correctAnswerIndex]
                          : "Hidden"}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openEditModal(question)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              dispatch(clearQuestionFeedback());
                              setQuestionToDelete(question);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalMode && (
        <QuestionFormModal
          key={`${modalMode}-${activeQuestion?._id || "new"}`}
          mode={modalMode}
          question={activeQuestion}
          loading={actionStatus === "loading"}
          error={actionError}
          onClose={closeFormModal}
          onSubmit={modalMode === "edit" ? handleUpdate : handleCreate}
        />
      )}

      {questionToDelete && (
        <ConfirmModal
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={actionStatus === "loading"}
          onCancel={() => {
            if (actionStatus === "loading") {
              return;
            }

            setQuestionToDelete(null);
            dispatch(clearQuestionFeedback());
          }}
          onConfirm={handleDelete}
        />
      )}

      {feedback && (
        <FeedbackModal
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
    </section>
  );
}

export default AdminQuestions;
