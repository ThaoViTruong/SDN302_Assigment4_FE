import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body text-center py-5">
        <h1 className="h3 mb-3">Page Not Found</h1>
        <p className="text-muted mb-4">
          The page you requested does not exist.
        </p>
        <Link className="btn btn-primary" to="/quizzes">
          Go to Quiz List
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
