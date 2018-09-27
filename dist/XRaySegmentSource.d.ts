import { Segment } from "aws-xray-sdk-core";
import { InstanceOf, Record, Static } from "runtypes";
import { XRayKey } from "./XRayKey";
/**
 * Runtype for an object which has a Segment available at [XRayKey].
 */
export declare const XRaySegmentSource: Record<{
    [XRayKey]: InstanceOf<Segment>;
}>;
export declare type XRaySegmentSource = Static<typeof XRaySegmentSource>;
