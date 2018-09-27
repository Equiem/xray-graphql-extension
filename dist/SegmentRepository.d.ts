import { Segment } from "aws-xray-sdk-core";
import { ResponsePath } from "graphql";
/**
 * A repository of Segments.
 */
export declare class SegmentRepository {
    segments: {
        [path: string]: Segment | undefined;
    };
    rootSegments: Segment[];
    add(path: ResponsePath, segment: Segment): void;
    find(path: ResponsePath): Segment | undefined;
    findParent(path: ResponsePath | undefined): Segment | undefined;
    pathToString(path: ResponsePath): string;
    forEach(callback: (segment: Segment) => void): void;
}
