import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import { getActiveSpans } from './tracingManager.js';
import fs from "fs";

const SPAN_FILE = "spans.json"; 

// Function to fetch active spans
const fetchSpanData = () => {
    if (!fs.existsSync(SPAN_FILE)) return []; // If file doesn't exist, return empty
    const fileData = fs.readFileSync(SPAN_FILE, "utf8");
    return JSON.parse(fileData);
};


/**
 * Recursively renders spans in a hierarchical structure.
 */
const SpanTree = ({ spans, depth = 0 }) => {
    return spans.map(span => (
        <Box key={span.spanId} flexDirection="column" paddingLeft={depth}>
            <Text color={span.endTime ? "gray" : "green"}>
                {span.endTime ? `[✓ Completed]` : `[Running]`} {span.name}
            </Text>
            {span.children.length > 0 && <SpanTree spans={span.children} depth={depth + 2} />}
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
