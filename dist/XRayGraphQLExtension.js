"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
const SegmentRepository_1 = require("./SegmentRepository");
const XRayKey_1 = require("./XRayKey");
/**
 * An Apollo Server GraphQL Extension which reports trace data to AWS XRay.
 */
class XRayGraphQLExtension {
    constructor(root, annotations = []) {
        this.root = root;
        this.annotations = annotations;
        this._segments = new SegmentRepository_1.SegmentRepository();
    }
    requestDidStart(o) {
        const trace = aws_xray_sdk_core_1.middleware.processHeaders({
            headers: { "X-Amzn-Trace-Id": o.request.headers.get("X-Amzn-Trace-Id") },
        });
        const root = this.root(o);
        const ownsRootSegment = typeof root === "string";
        const rootSegment = typeof root === "string"
            ? new aws_xray_sdk_core_1.Segment(root, trace.Root, trace.Parent)
            : root;
        rootSegment.addMetadata("query", o.queryString);
        this._segments.add(null, rootSegment);
        return (...errors) => {
            if (errors.length > 0) {
                errors.forEach((error, i) => {
                    rootSegment.addAnnotation(`Error${i}`, `${error}`);
                });
            }
            if (ownsRootSegment) {
                rootSegment.close();
            }
        };
    }
    willResolveField(_source, _args, _context, info) {
        const parent = this._segments.findParent(info.path);
        const segment = parent.addNewSubsegment(this._segments.pathToString(info.path));
        segment.addAnnotation("GraphQLField", `${info.parentType.name}.${info.fieldName}`);
        for (const annotation of this.annotations) {
            segment.addAnnotation(annotation.key, annotation.value);
        }
        this._segments.add(info.path, segment);
        info[XRayKey_1.XRayKey] = segment;
        return (error, _result) => {
            segment.close(error != null ? error : undefined);
        };
    }
    get segments() {
        return this._segments.segments;
    }
    get rootSegments() {
        return this._segments.rootSegments;
    }
}
exports.XRayGraphQLExtension = XRayGraphQLExtension;
//# sourceMappingURL=XRayGraphQLExtension.js.map