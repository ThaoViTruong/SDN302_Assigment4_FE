import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "../components/ConfirmModal";
import FeedbackModal from "../components/FeedbackModal";
import QuestionFormModal from "../components/QuestionFormModal";
import { fetchQuestions } from "../features/questions/questionSlice";
import {
  clearCurrentQuiz,
  fetchQuizById,
  fetchQuizzes,
} from "../features/quizzes/quizSlice";
import api from "../services/api";

function AdminQuizzes() {
  const dispatch = useDispatch();
  const { items, currentQuiz, listStatus, detailStatus, listError, detailError } =
    useSelector((state) => state.quizzes);
  const { items: questionItems, status: questionStatus } = useSelector(
    (state) => state.questions
  );

  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
  });
  const [quizFormError, setQuizFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [editQuizError, setEditQuizError] = useState("");
  const [editQuizForm, setEditQuizForm] = useState({
    title: "",
    description: "",
  });
  const [pendingSelectionIds, setPendingSelectionIds] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchQuestions());

    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch]);

  const attachedQuestionIds = useMemo(
    () => new Set((currentQuiz?.questions || []).map((question) => question._id)),
    [currentQuiz]
  );

  const selectedQuestionIds = useMemo(
    () => (currentQuiz?.questions || []).map((question) => question._id),
    [currentQuiz]
  );

  const effectiveSelectionIds = pendingSelectionIds ?? selectedQuestionIds;

  const hasUnsavedSelection =
    pendingSelectionIds !== null &&
    (
      effectiveSelectionIds.length !== selectedQuestionIds.length ||
      effectiveSelectionIds.some((id) => !selectedQuestionIds.includes(id)) ||
      selectedQuestionIds.some((id) => !effectiveSelectionIds.includes(id))
    );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedSelection) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedSelection]);

  const handleSelectQuiz = (quizId) => {
    if (
      hasUnsavedSelection &&
      selectedQuizId &&
      !window.confirm("You have unsaved question assignment changes. Leave without saving?")
    ) {
      return;
    }

    setSelectedQuizId(quizId);
    setActionError("");
    setPendingSelectionIds(null);
    dispatch(fetchQuizById(quizId));
  };

  const refreshQuizData = async (quizId = selectedQuizId) => {
    await dispatch(fetchQuizzes());

    if (quizId) {
      await dispatch(fetchQuizById(quizId));
    }

    await dispatch(fetchQuestions());
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setQuizFormError("");
    setActionError("");

    if (!quizForm.title.trim() || !quizForm.description.trim()) {
      setQuizFormError("Please enter both a quiz title and description.");
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.post("/quizzes", {
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        questions: [],
      });

      setQuizForm({
        title: "",
        description: "",
      });
      setSelectedQuizId(response.data._id);
      setPendingSelectionIds(null);
      setFeedback({
        title: "Quiz Created",
        message: "The new quiz has been created successfully.",
      });

      await refreshQuizData(response.data._id);
    } catch (error) {
      setQuizFormError(error.response?.data?.message || "Unable to create the quiz.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await api.delete(`/quizzes/${quizToDelete._id}`);
      setFeedback({
        title: "Quiz Deleted",
        message: "The quiz has been deleted successfully.",
      });
      setQuizToDelete(null);

      if (selectedQuizId === quizToDelete._id) {
        setSelectedQuizId("");
        setPendingSelectionIds(null);
        dispatch(clearCurrentQuiz());
      }

      await dispatch(fetchQuizzes());
    } catch (error) {
      setActionError(error.response?.data?.message || "Unable to delete the quiz.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateQuestionForQuiz = async (payload) => {
    if (!selectedQuizId) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await api.post(`/quizzes/${selectedQuizId}/questions`, payload);
      setShowQuestionModal(false);
      setPendingSelectionIds(null);
      setFeedback({
        title: "Question Added",
        message: "The new question has been added to the quiz.",
      });
      await refreshQuizData();
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Unable to add the question to this quiz."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditQuizModal = () => {
    if (!currentQuiz) {
      return;
    }

    setActionError("");
    setEditQuizError("");
    setEditQuizForm({
      title: currentQuiz.title || "",
      description: currentQuiz.description || "",
    });
    setShowEditQuizModal(true);
  };

  const handleUpdateQuiz = async (event) => {
    event.preventDefault();

    if (!selectedQuizId || !currentQuiz) {
      return;
    }

    if (!editQuizForm.title.trim() || !editQuizForm.description.trim()) {
      setEditQuizError("Please enter both a quiz title and description.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setEditQuizError("");
      await api.put(`/quizzes/${selectedQuizId}`, {
        title: editQuizForm.title.trim(),
        description: editQuizForm.description.trim(),
        questions: selectedQuestionIds,
      });
      setShowEditQuizModal(false);
      setFeedback({
        title: "Quiz Updated",
        message: "The quiz details have been updated successfully.",
      });
      await refreshQuizData();
    } catch (error) {
      setEditQuizError(
        error.response?.data?.message || "Unable to update the quiz details."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectionChange = (questionId) => {
    setActionError("");
    setPendingSelectionIds((current) => {
      const baseline = current ?? selectedQuestionIds;
      const nextSelection = baseline.includes(questionId)
        ? baseline.filter((id) => id !== questionId)
        : [...baseline, questionId];

      return nextSelection;
    });
  };

  const handleSaveAssignments = async () => {
    if (!selectedQuizId || !currentQuiz) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      await api.put(`/quizzes/${selectedQuizId}`, {
        title: currentQuiz.title,
        description: currentQuiz.description,
        questions: effectiveSelectionIds,
      });
      setPendingSelectionIds(null);
      setFeedback({
        title: "Assignments Saved",
        message: "Quiz question assignments have been updated successfully.",
      });
      await refreshQuizData();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to save the selected question assignments."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Quiz Management</h1>
          <p className="text-muted mb-0">
            Create quizzes, assign existing questions, and keep quiz content in sync.
          </p>
        </div>
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h2 className="h5 mb-3">Create New Quiz</h2>

              {quizFormError && (
                <div className="alert alert-danger">{quizFormError}</div>
              )}

              <form onSubmit={handleCreateQuiz}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    value={quizForm.title}
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={quizForm.description}
                    onChange={(event) =>
                      setQuizForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Creating..." : "Create Quiz"}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Quizzes</h2>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => dispatch(fetchQuizzes())}
                  disabled={listStatus === "loading"}
                >
                  Refresh
                </button>
              </div>

              {listStatus === "loading" && <p className="mb-0">Loading quizzes...</p>}
              {listStatus === "failed" && (
                <div className="alert alert-danger mb-0">{listError}</div>
              )}
              {listStatus === "succeeded" && items.length === 0 && (
                <p className="mb-0">No quizzes available.</p>
              )}

              <div className="list-group">
                {items.map((quiz) => (
                  <button
                    type="button"
                    key={quiz._id}
                    className={`list-group-item list-group-item-action text-start ${
                      selectedQuizId === quiz._id ? "active" : ""
                    }`}
                    onClick={() => handleSelectQuiz(quiz._id)}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <div className="fw-semibold">{quiz.title}</div>
                        <div className="small opacity-75">
                          {quiz.questionCount} question
                          {quiz.questionCount === 1 ? "" : "s"}
                        </div>
                      </div>
                      <span className="badge text-bg-light text-dark">
                        Quiz
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {!selectedQuizId && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                Select a quiz to manage its question assignments.
              </div>
            </div>
          )}

          {selectedQuizId && detailStatus === "loading" && (
            <div className="card shadow-sm border-0">
              <div className="card-body">Loading quiz details...</div>
            </div>
          )}

          {selectedQuizId && detailStatus === "failed" && (
            <div className="alert alert-danger">{detailError}</div>
          )}

          {selectedQuizId && currentQuiz && (
            <div className="d-grid gap-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h2 className="h4 mb-1">{currentQuiz.title}</h2>
                      <p className="text-muted mb-0">{currentQuiz.description}</p>
                    </div>

                    <div className="d-flex gap-2">
                      
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setActionError("");
                          setShowQuestionModal(true);
                        }}
                      >
                        Create Question
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleOpenEditQuizModal}
                        disabled={hasUnsavedSelection}
                      >
                        Edit Quiz
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setQuizToDelete(currentQuiz)}
                      >
                        Delete Quiz
                      </button>
                    </div>
                  </div>

                  <h3 className="h5">Assigned Questions</h3>

                  {currentQuiz.questions?.length ? (
                    <div className="list-group">
                      {currentQuiz.questions.map((question, index) => (
                        <div
                          className="list-group-item"
                          key={question._id}
                        >
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                            <div>
                              <div className="fw-semibold mb-1">
                                Question {index + 1}: {question.text}
                              </div>
                              <ol className="mb-0 ps-3">
                                {question.options.map((option, optionIndex) => (
                                  <li key={`${question._id}-${optionIndex}`}>
                                    {option}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <span className="badge text-bg-success">
                              Assigned
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-0">This quiz does not have any assigned questions yet.</p>
                  )}
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h3 className="h5 mb-1">Question Assignment</h3>
                      <p className="text-muted mb-0">
                        Select or deselect questions, then click Save to persist changes.
                      </p>
                    </div>
                    <span className="badge text-bg-secondary">
                      {effectiveSelectionIds.length} selected
                    </span>
                  </div>

                  {questionStatus === "loading" && (
                    <p className="mb-0">Loading available questions...</p>
                  )}

                  {questionStatus === "succeeded" && questionItems.length === 0 && (
                    <p className="mb-0">
                      No questions are available in the system yet.
                    </p>
                  )}

                  {questionItems.length > 0 && (
                    <div className="assignment-panel">
                      <div
                        className={`list-group assignment-list ${
                          questionItems.length > 5 ? "assignment-list-scroll" : ""
                        }`}
                      >
                        {questionItems.map((question) => {
                          const isAssigned = attachedQuestionIds.has(question._id);
                          const isSelected = effectiveSelectionIds.includes(question._id);
                          const statusLabel = isAssigned
                            ? isSelected
                              ? "Currently assigned"
                              : "Will be removed"
                            : isSelected
                              ? "Will be added"
                              : "Not assigned";

                          const statusClass = isAssigned
                            ? isSelected
                              ? "text-bg-success"
                              : "text-bg-warning"
                            : isSelected
                              ? "text-bg-primary"
                              : "text-bg-secondary";

                          return (
                            <label
                              className="list-group-item assignment-item"
                              key={question._id}
                            >
                              <div className="d-flex align-items-start gap-3">
                                <input
                                  className="form-check-input mt-1"
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectionChange(question._id)}
                                />
                                <div className="flex-grow-1">
                                  <div className="d-flex flex-wrap justify-content-between gap-2">
                                    <div className="fw-semibold">{question.text}</div>
                                    <span className={`badge ${statusClass}`}>
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <div className="small text-muted mt-1">
                                    {question.keywords?.length
                                      ? question.keywords.join(", ")
                                      : "No keywords"}
                                  </div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                        <div className="small text-muted">
                          {hasUnsavedSelection
                            ? "You have unsaved question assignment changes."
                            : "All question assignments are saved."}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={actionLoading || !hasUnsavedSelection}
                          onClick={handleSaveAssignments}
                        >
                          {actionLoading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="alert alert-info mb-0">
                Use
                {" "}
                <strong>Manage Questions</strong>
                {" "}
                to edit or delete a question from the system. This page only manages which
                questions belong to the selected quiz.
              </div>
            </div>
          )}
        </div>
      </div>

      {showQuestionModal && selectedQuizId && (
        <QuestionFormModal
          key={`quiz-question-${selectedQuizId}`}
          mode="create"
          question={null}
          loading={actionLoading}
          error={actionError}
          onClose={() => {
            if (actionLoading) {
              return;
            }

            setActionError("");
            setShowQuestionModal(false);
          }}
          onSubmit={handleCreateQuestionForQuiz}
        />
      )}

      {showEditQuizModal && currentQuiz && (
        <div className="modal fade show d-block modal-backdrop-custom" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Quiz</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    if (actionLoading) {
                      return;
                    }

                    setEditQuizError("");
                    setShowEditQuizModal(false);
                  }}
                  disabled={actionLoading}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleUpdateQuiz}>
                <div className="modal-body">
                  {editQuizError && (
                    <div className="alert alert-danger">{editQuizError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={editQuizForm.title}
                      onChange={(event) =>
                        setEditQuizForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editQuizForm.description}
                      onChange={(event) =>
                        setEditQuizForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      if (actionLoading) {
                        return;
                      }

                      setEditQuizError("");
                      setShowEditQuizModal(false);
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {quizToDelete && (
        <ConfirmModal
          title="Delete Quiz"
          message="Are you sure you want to delete this quiz? Question documents will remain in the system."
          confirmLabel="Delete Quiz"
          confirmVariant="danger"
          loading={actionLoading}
          onCancel={() => {
            if (actionLoading) {
              return;
            }

            setQuizToDelete(null);
          }}
          onConfirm={handleDeleteQuiz}
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

export default AdminQuizzes;
