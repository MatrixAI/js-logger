import { getTraceJSON } from "../lib/tracingManager.js";

setInterval(() => {
    console.clear();
    console.log("🚀 Live Spans (Tail Mode):\n");
    console.log(getTraceJSON());
}, 1000);
