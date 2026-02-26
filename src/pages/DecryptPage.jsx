import { useParams, Link } from "react-router-dom";
import ReceiveForm from "../components/ReceiveForm";
import { GITHUB_URL } from "../lib/helpers";

export default function DecryptPage() {
  const { id } = useParams();

  return (
    <div className="decrypt-page">
      <div className="decrypt-page-logo">
        env<span>share</span>
      </div>
      <div className="decrypt-card">
        <h2>Someone shared a .env with you</h2>
        <p className="sub">
          This link contains an encrypted .env file. Enter the key your teammate sent you
          (via WhatsApp, Slack, etc.) to decrypt it.
        </p>
        <div className="id-badge">ID: {id}</div>
        <ReceiveForm lockedId={id} />
      </div>
      <div className="decrypt-footer">
        <Link to="/">← Back to envshare</Link>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          View source
        </a>
      </div>
    </div>
  );
}
