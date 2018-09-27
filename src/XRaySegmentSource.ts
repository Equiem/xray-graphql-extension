import { Segment } from "aws-xray-sdk-core";
import { InstanceOf, Record, Static } from "runtypes";
import { XRayKey } from "./XRayKey";

export const XRaySegmentSource = Record({
  [XRayKey]: InstanceOf(Segment),
});

export type XRaySegmentSource = Static<typeof XRaySegmentSource>;
