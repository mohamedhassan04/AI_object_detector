import "./App.css";
import ObjectDetection from "./ObjectDetection";

function App() {
  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Poppins, sans-serif",
          color: "#fff",
          marginTop: "20px",
          fontSize: "2.5em",
        }}
      >
        Object Detection with TensorFlow.js
      </h1>
      <ObjectDetection />
    </div>
  );
}

export default App;
