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
        this.segments = new SegmentRepository_1.SegmentRepository();
    }
    requestDidStart(o) {
        const trace = aws_xray_sdk_core_1.middleware.processHeaders({
            headers: { "X-Amzn-Trace-Id": o.request.headers.get("X-Amzn-Trace-Id") },
        });
        const root = this.root(o);
        const segment = typeof root === "string"
            ? new aws_xray_sdk_core_1.Segment(root, trace.Root, trace.Parent)
            : root;
        segment.addMetadata("query", o.queryString);
        this.segments.add({ key: "", prev: null }, segment);
        return (...errors) => {
            if (errors.length > 0) {
                errors.forEach((error, i) => {
                    segment.addAnnotation(`Error${i}`, `${error}`);
                });
            }
            this.segments.forEach((s) => {
                s.close(errors.length > 0 ? errors[0] : undefined);
            });
        };
    }
    willResolveField(_source, _args, _context, info) {
        const segment = this.segments
            .findParent(info.path)
            .addNewSubsegment(this.segments.pathToString(info.path));
        segment.addAnnotation("GraphQLField", `${info.parentType.name}.${info.fieldName}`);
        for (const annotation of this.annotations) {
            segment.addAnnotation(annotation.key, annotation.value);
        }
        this.segments.add(info.path, segment);
        info[XRayKey_1.XRayKey] = segment;
        return () => {
            segment.close();
        };
    }
}
exports.XRayGraphQLExtension = XRayGraphQLExtension;
//# sourceMappingURL=XRayGraphQLExtension.js.map