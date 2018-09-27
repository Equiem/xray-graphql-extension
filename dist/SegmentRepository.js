"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
class SegmentRepository {
    constructor() {
        this.segments = {};
        this.rootSegments = [];
    }
    add(path, segment) {
        this.segments[this.pathToString(path)] = segment;
        if (path == null) {
            this.rootSegments.push(segment);
        }
    }
    find(path) {
        return this.segments[this.pathToString(path)];
    }
    findParent(path) {
        if (path == null) {
            return;
        }
        let parent = this.find(path.prev);
        if (parent == null) {
            const grandparent = this.findParent(path.prev);
            parent = grandparent
                ? grandparent.addNewSubsegment(this.pathToString(path.prev))
                : new aws_xray_sdk_core_1.Segment(this.pathToString(path.prev));
            this.add(path.prev, parent);
        }
        return parent;
    }
    pathToString(path) {
        let part = path;
        const parts = [];
        while (part != null) {
            parts.push(part.key);
            part = part.prev;
        }
        return parts.reverse().join("/");
    }
    forEach(callback) {
        Object.keys(this.segments).map((key) => this.segments[key]).forEach(callback);
    }
}
exports.SegmentRepository = SegmentRepository;
//# sourceMappingURL=SegmentRepository.js.map