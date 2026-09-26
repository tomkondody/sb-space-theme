"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function IslandPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIslandDetails = (id: string) => {
    switch(id) {
      case 'crystal': return { title: 'Crystal Realm', color: '#a020f0', bg: '/island_crystal.jpg', desc: 'A land of endless resonating crystals and magical energies.' };
      case 'nature': return { title: 'Nature Realm', color: '#20f0a0', bg: '/island_nature.jpg', desc: 'A bioluminescent forest teeming with ancient mystical life.' };
      case 'fire': return { title: 'Fire Realm', color: '#f05020', bg: '/island_fire.jpg', desc: 'A volatile volcanic world of glowing magma and eternal embers.' };
      case 'water': return { title: 'Water Realm', color: '#20a0f0', bg: '/island_water.jpg', desc: 'A serene sanctuary of neon blue magic and infinite waterfalls.' };
      default: return { title: 'Unknown Realm', color: '#ffffff', bg: '', desc: 'Lost in space.' };
    }
  };

  const details = getIslandDetails(params.id as string);

  return (
    <main style={{ 
      width: "100vw", 
      height: "100vh", 
      position: "relative",
      backgroundColor: "#000",
      backgroundImage: `url(${details.bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      opacity: mounted ? 1 : 0,
      transition: "opacity 1s ease-in",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(2, 0, 10, 0.6)",
        backdropFilter: "blur(4px)"
      }} />

      <button 
        onClick={() => router.push('/')}
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          padding: "0.8rem 1.5rem",
          borderRadius: "30px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          zIndex: 20,
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)" }}
        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)" }}
      >
        <ArrowLeft size={20} />
        Return to Space
      </button>

      <div className="realm-card" style={{
        zIndex: 10,
        textAlign: "center",
        background: "rgba(10, 10, 20, 0.7)",
        borderRadius: "20px",
        border: `1px solid ${details.color}55`,
        boxShadow: `0 0 40px ${details.color}33`,
        backdropFilter: "blur(20px)"
      }}>
        <h1 className="realm-title" style={{ 
          color: details.color,
          textShadow: `0 0 20px ${details.color}`
        }}>{details.title}</h1>
        <p className="realm-desc" style={{ 
          color: "#e0e0ff",
        }}>
          {details.desc}
        </p>
      </div>
    </main>
  );
}
