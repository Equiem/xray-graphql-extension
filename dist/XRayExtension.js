"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
const SegmentRepository_1 = require("./SegmentRepository");
const XRayKey_1 = require("./XRayKey");
class XRayExtension {
    constructor(rootName) {
        this.rootName = rootName;
        this.segments = new SegmentRepository_1.SegmentRepository();
    }
    requestDidStart(o) {
        const segment = new aws_xray_sdk_core_1.Segment(this.rootName, o.request.headers["X-Amzn-Trace-Id"], o.request.headers["X-Amzn-Trace-Id"]);
        segment.addMetadata("query", o.queryString);
        segment.addAnnotation("url", o.request.url);
        this.segments.add({ key: "", prev: null }, segment);
        return () => {
            this.segments.forEach((s) => s.close());
        };
    }
    willResolveField(_source, _args, _context, info) {
        const segment = this.segments
            .findParent(info.path)
            .addNewSubsegment(this.segments.pathToString(info.path));
        segment.addAnnotation("parentType", info.parentType.name);
        segment.addAnnotation("fieldName", info.fieldName);
        this.segments.add(info.path, segment);
        info[XRayKey_1.XRayKey] = segment;
        return () => {
            segment.close();
        };
    }
}
exports.XRayExtension = XRayExtension;
//# sourceMappingURL=XRayExtension.js.map