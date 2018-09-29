/**
 * Tests for the getConnectionSource function.
 */
export declare class XRayGraphQLExtensionSpec {
    private rootSegment;
    private extension;
    private endRequest;
    testUseProvidedRootSegmentName(): void;
    testUseProvidedRootSegment(): void;
    testClosePendingRootSegment(): void;
    testOpenSegmentForField(): void;
    testOpenSegmentForEachField(): void;
    testClosesAllSegments(): void;
    testClosesSegmentsWithErrors(): void;
    testOpenNestedSegmentForEachField(): void;
    testClosesNestedSegmentForEachField(): void;
    testClosesNestedListSegmentParent(): void;
    testClosesNestedSegmentParent(): void;
    private startRequest;
    private requestField;
    private buildPath;
    private stringOrNumber;
    private defaultOptions;
}
