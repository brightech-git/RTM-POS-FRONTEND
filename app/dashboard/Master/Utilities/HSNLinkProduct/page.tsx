export default function Home() {
  return (
    <main style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column",
      fontFamily: "Arial"
    }}>
      <h1>Welcome to My Next.js App 🚀</h1>
      <p>TypeScript setup is working perfectly!</p>
      <button
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          cursor: "pointer"
        }}
        onClick={() => alert("Button Clicked!")}
      >
        Click Me
      </button>
    </main>
  );
}