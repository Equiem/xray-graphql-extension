"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
const runtypes_1 = require("runtypes");
const XRayKey_1 = require("./XRayKey");
exports.XRaySegmentSource = runtypes_1.Record({
    [XRayKey_1.XRayKey]: runtypes_1.InstanceOf(aws_xray_sdk_core_1.Segment),
});
//# sourceMappingURL=XRaySegmentSource.js.map