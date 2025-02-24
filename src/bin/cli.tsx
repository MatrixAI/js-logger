import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import { getActiveSpans } from "../lib/tracingManager.js";
import fs from "fs";
import { Span } from "../lib/span.js";


const SPAN_FILE = "spans.json"; 

// Function to fetch active spans
const fetchSpanData = () => {
    if (!fs.existsSync(SPAN_FILE)) return []; // If file doesn't exist, return empty
    const fileData = fs.readFileSync(SPAN_FILE, "utf8");
    
    // Explicitly type `flatSpans`
    const flatSpans: Span[] = JSON.parse(fileData);

    // Build a map of spans by ID
    const spanMap = new Map<string, Span>();
    flatSpans.forEach(span => {
        span.children = []; // Initialize empty children array
        spanMap.set(span.spanId, span);
    });

    const rootSpans: Span[] = [];

    // Assign children to their respective parent spans
    flatSpans.forEach(span => {
        if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
            spanMap.get(span.parentSpanId)?.children.push(span);
        } else {
            rootSpans.push(span);
        }
    });

    return rootSpans;
};



/**
 * Recursively renders spans in a hierarchical structure.
 */
const SpanTree = ({ spans, depth = 0 }) => {
    return spans.map(span => (
        <Box key={span.spanId} flexDirection="column" paddingLeft={depth}>
            {/* Render children spans first */}
            {span.children.length > 0 && <SpanTree spans={span.children} depth={depth + 2} />}
            {/* Render the parent span after all children */}
            <Text color={span.endTime ? "gray" : "green"}>
                {span.endTime ? `[✓ Completed]` : `[Running]`} {span.name}
            </Text>
        </Box>
    ));
};


/**
 * Main React-Ink CLI component.
 */
const App = () => {
    const [spans, setSpans] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSpans([...fetchSpanData()]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    

    return (
        <Box flexDirection="column" paddingLeft={2}>
            <Text color="cyan">🚀 Real-Time Span Visualization:</Text>
            <SpanTree spans={spans} />
        </Box>
    );
};

// Start the CLI application
render(<App />);
