import { createRoot } from "react-dom/client";
import { Buffer } from 'buffer';
import App from "./App";
import "./index.css";

// Global Buffer polyfill for browser compatibility with Solana libraries
(window as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
