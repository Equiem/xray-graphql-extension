/**
 * Tests for the getConnectionSource function.
 */
export declare class XRayGraphQLExtensionSpec {
    private rootSegment;
    private extension;
    private endRequest;
    private clock;
    beforeEach(): void;
    afterEach(): void;
    testUseProvidedRootSegmentName(): void;
    testUseProvidedRootSegment(): void;
    testCloseOwnRootSegment(): void;
    testDontCloseExternalRootSegment(): void;
    testOpenSegmentForField(): void;
    testOpenSegmentForEachField(): void;
    testClosesAllSegments(): void;
    testClosesSegmentsWithErrors(): void;
    testOpenNestedSegmentForEachField(): void;
    testClosesNestedSegmentForEachField(): void;
    private startRequest;
    private requestField;
    private buildPath;
    private stringOrNumber;
    private defaultOptions;
}
