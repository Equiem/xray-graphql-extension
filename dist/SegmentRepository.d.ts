import { Segment } from "aws-xray-sdk-core";
import { ResponsePath } from "graphql";
/**
 * A repository of Segments.
 */
export declare class SegmentRepository {
    private _rootSegments;
    private _segments;
    add(path: ResponsePath, segment: Segment): void;
    find(path: ResponsePath): Segment | undefined;
    findParent(path: ResponsePath | undefined): Segment | undefined;
    pathToString(path: ResponsePath): string;
    forEach(callback: (segment: Segment) => void): void;
    readonly segments: Segment[];
    readonly rootSegments: Segment[];
}
