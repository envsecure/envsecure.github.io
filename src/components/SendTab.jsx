import { useState } from "react";
import { encrypt } from "../lib/crypto";
import { API, copyToClipboard } from "../lib/helpers";

export default function SendTab() {
  const [envText, setEnvText] = useState("");
  const [key, setKey] = useState("");
  const [maxReads, setMaxReads] = useState(5);
  const [ttl, setTtl] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setEnvText(e.target.result);
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    if (!envText.trim()) return setError("Please paste or upload your .env content.");
    if (key.length < 8) return setError("Key must be at least 8 characters long.");
    setLoading(true);
    try {
      const { encryptedData, iv, salt } = await encrypt(envText, key);
      const res = await fetch(`${API}/api/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData, iv, salt, maxReads, ttlMinutes: ttl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = result ? `${window.location.origin}/decrypt/${result.id}` : "";

  return (
    <div>
      <div className="field">
        <label>.env content</label>
        <div
          className={`upload-zone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("__file_input").click()}
        >
          📂  Drop your .env file here, or click to browse
        </div>
        <input
          id="__file_input"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="or-divider">— or paste below —</div>
        <textarea
          rows={6}
          placeholder={"DB_HOST=localhost\nDB_PASSWORD=supersecret\nAPI_KEY=sk-..."}
          value={envText}
          onChange={(e) => setEnvText(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Encryption key</label>
        <input
          type="password"
          placeholder="Choose a strong passphrase (min 8 characters)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <p className="hint">
          You'll share this key separately via WhatsApp or Slack — never included in the link.
        </p>
      </div>

      <div className="two-col">
        <div className="field">
          <label>Max reads</label>
          <input
            type="number"
            min={1}
            max={100}
            value={maxReads}
            onChange={(e) => setMaxReads(Number(e.target.value))}
          />
          <p className="hint">Link is deleted after this many opens.</p>
        </div>
        <div className="field">
          <label>Expires after (minutes)</label>
          <input
            type="number"
            min={1}
            max={10080}
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
          />
          <p className="hint">Max 7 days (10080 min).</p>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Encrypting & uploading…" : "Encrypt & generate link"}
      </button>

      {error && <div className="notice error">⚠ {error}</div>}

      {result && (
        <div className="notice success">
          <strong>✓ Done.</strong> Your encrypted .env is stored.
          <div className="meta-row">
            <span className="meta-pill">Max reads: {result.maxReads}</span>
            <span className="meta-pill">Expires: {result.ttlMinutes}m</span>
          </div>
          <div className="url-box">{shareUrl}</div>
          <div className="btn-row">
            <button
              className="btn-secondary"
              onClick={() => {
                copyToClipboard(shareUrl);
                setUrlCopied(true);
                setTimeout(() => setUrlCopied(false), 2000);
              }}
            >
              {urlCopied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
          <div className="key-callout">
            <strong>⚠ Send the key separately</strong> — over WhatsApp, Slack, Signal,
            etc. Do NOT put it in the same message as the link.
            <span className="key-value">{key}</span>
            <div className="btn-row">
              <button
                className="btn-secondary"
                onClick={() => {
                  copyToClipboard(key);
                  setKeyCopied(true);
                  setTimeout(() => setKeyCopied(false), 2000);
                }}
              >
                {keyCopied ? "✓ Copied!" : "Copy key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
