function ResultModal({ result, questions, onClose }) {
  if (!result) {
    return null;
  }

  return (
    <div className="modal fade show d-block modal-backdrop-custom" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <div>
              <h5 className="modal-title">Quiz Completed</h5>
              <p className="text-muted mb-0">Your result has been recorded successfully.</p>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body pt-3">
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="result-stat-card">
                  <div className="small text-muted">Your Score</div>
                  <div className="h4 mb-0">
                    {result.score} / {result.totalQuestions}
                  </div>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="result-stat-card">
                  <div className="small text-muted">Correct Answers</div>
                  <div className="h4 mb-0">{result.score}</div>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="result-stat-card">
                  <div className="small text-muted">Percentage</div>
                  <div className="h4 mb-0">{result.percentage}%</div>
                </div>
              </div>
            </div>

            {Array.isArray(result.results) && result.results.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((item, index) => {
                      const question = questions.find(
                        (entry) => entry._id === item.questionId
                      );

                      return (
                        <tr key={item.questionId}>
                          <td>{index + 1}</td>
                          <td>
                            {item.selectedAnswer === null
                              ? "No answer"
                              : question?.options?.[item.selectedAnswer]}
                          </td>
                          <td>{question?.options?.[item.correctAnswerIndex]}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.isCorrect
                                  ? "text-bg-success"
                                  : "text-bg-danger"
                              }`}
                            >
                              {item.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 pt-0">
            <button type="button" className="btn btn-danger" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
