import { useState } from "react";
import Header from "../components/Header";
import SendTab from "../components/SendTab";
import ReceiveForm from "../components/ReceiveForm";
import TrustSection from "../components/TrustSection";

export default function HomePage() {
  const [tab, setTab] = useState("send");

  return (
    <div className="page">
      <Header />

      <div className="tabs">
        <button
          className={`tab-btn ${tab === "send" ? "active" : ""}`}
          onClick={() => setTab("send")}
        >
          Encrypt &amp; share
        </button>
        <button
          className={`tab-btn ${tab === "receive" ? "active" : ""}`}
          onClick={() => setTab("receive")}
        >
          Receive &amp; decrypt
        </button>
      </div>

      {tab === "send" ? <SendTab /> : <ReceiveForm />}

      <TrustSection />
    </div>
  );
}
