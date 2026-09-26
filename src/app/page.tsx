"use client";
import Scene from "../components/Scene";

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative", backgroundColor: "#02000a" }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        padding: "4rem 2rem",
        zIndex: 10,
        pointerEvents: "none",
        textAlign: "center",
        background: "linear-gradient(to bottom, rgba(2,0,10,0.8) 0%, transparent 100%)"
      }}>
        <h1 className="title-text">MAGNERA 26</h1>
        <p className="subtitle-text">Select an island to teleport</p>
      </div>
      <Scene />
    </main>
  );
}
