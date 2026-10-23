import { useMemo, useState } from "react";

const createInitialState = (question) => ({
  text: question?.text || "",
  options: question?.options?.length ? question.options : ["", "", "", ""],
  keywords: question?.keywords?.join(", ") || "",
  correctAnswerIndex:
    typeof question?.correctAnswerIndex === "number"
      ? question.correctAnswerIndex
      : 0,
});

function QuestionFormModal({
  mode,
  question,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(createInitialState(question));
  const [formError, setFormError] = useState("");

  const filledOptions = useMemo(
    () =>
      form.options
        .map((option) => option.trim())
        .filter((option) => option !== ""),
    [form.options]
  );

  const handleOptionChange = (index, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option
      ),
    }));
  };

  const addOption = () => {
    setForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) {
      return;
    }

    setForm((current) => {
      const nextOptions = current.options.filter(
        (_, optionIndex) => optionIndex !== index
      );

      return {
        ...current,
        options: nextOptions,
        correctAnswerIndex:
          current.correctAnswerIndex >= nextOptions.length
            ? nextOptions.length - 1
            : current.correctAnswerIndex,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (form.text.trim() === "") {
      setFormError("Question text is required.");
      return;
    }

    if (filledOptions.length < 2) {
      setFormError("Please enter at least 2 answer options.");
      return;
    }

    if (
      !Number.isInteger(Number(form.correctAnswerIndex)) ||
      Number(form.correctAnswerIndex) < 0 ||
      Number(form.correctAnswerIndex) >= filledOptions.length
    ) {
      setFormError("Please select a valid correct answer.");
      return;
    }

    onSubmit({
      text: form.text.trim(),
      options: filledOptions,
      keywords: form.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      correctAnswerIndex: Number(form.correctAnswerIndex),
    });
  };

  return (
    <div className="modal fade show d-block modal-backdrop-custom" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === "edit" ? "Edit Question" : "Create Question"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {(formError || error) && (
                <div className="alert alert-danger">
                  {formError || error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Question text</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.text}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      text: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Answer options</label>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addOption}
                  >
                    Add option
                  </button>
                </div>

                <div className="row g-2">
                  {form.options.map((option, index) => (
                    <div className="col-12" key={`${mode}-option-${index}`}>
                      <div className="input-group">
                        <span className="input-group-text">
                          {index + 1}
                        </span>
                        <input
                          className="form-control"
                          value={option}
                          onChange={(event) =>
                            handleOptionChange(index, event.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeOption(index)}
                          disabled={form.options.length <= 2}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Correct answer</label>
                  <select
                    className="form-select"
                    value={form.correctAnswerIndex}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        correctAnswerIndex: Number(event.target.value),
                      }))
                    }
                  >
                    {filledOptions.map((option, index) => (
                      <option key={`${option}-${index}`} value={index}>
                        Option {index + 1}: {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Keywords</label>
                  <input
                    className="form-control"
                    value={form.keywords}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        keywords: event.target.value,
                      }))
                    }
                    placeholder="history, geography"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update Question"
                    : "Create Question"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuestionFormModal;
