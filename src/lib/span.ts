export class Span {
    spanId: string;
    name: string;
    startTime: number;
    endTime: number | null;
    parentSpanId: string | null;
    children: Span[];

    constructor(name: string, parentSpanId: string | null = null) {
        this.spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        this.name = name;
        this.startTime = Date.now();
        this.endTime = null;
        this.parentSpanId = parentSpanId;
        this.children = [];
    }

    close(): void {
        this.endTime = Date.now();
    }

    isCompleted(): boolean {
        return this.endTime !== null;
    }

    // Convert span object to JSON-friendly format
    toJSON(): Record<string, any> {
        return {
            spanId: this.spanId,
            name: this.name,
            startTime: this.startTime,
            endTime: this.endTime,
            parentSpanId: this.parentSpanId,
            isCompleted: this.isCompleted(),
            children: this.children.map(child => child.toJSON())
        };
    }
}
