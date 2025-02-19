import Logger from "../src/Logger.js";

const logger = new Logger();

console.log("\nStarting Tracing & CLI Test...\n");

// Now correctly assigning the returned spanId
const rootSpan: string = logger.info("User Request");  
const span1: string = logger.info("Order Processing", undefined, undefined, rootSpan);
const span2: string = logger.info("Payment Processing", undefined, undefined, span1); 

// Simulate Completion at Different Intervals
setTimeout(() => logger.info("Payment Completed", undefined, undefined, span2), 3000);
setTimeout(() => logger.info("Order Completed", undefined, undefined, span1), 5000);
setTimeout(() => logger.info("User Request Completed", undefined, undefined, rootSpan), 7000);
