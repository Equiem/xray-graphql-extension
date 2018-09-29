"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
/**
 * A repository of Segments.
 */
class SegmentRepository {
    constructor() {
        this._rootSegments = [];
        this._segments = {};
    }
    add(path, segment) {
        this._segments[this.pathToString(path)] = segment;
        if (path == null) {
            this._rootSegments.push(segment);
        }
    }
    find(path) {
        return this._segments[this.pathToString(path)];
    }
    findParent(path) {
        if (path == null) {
            return;
        }
        let parent = this.find(path.prev);
        if (parent == null) {
            const grandparent = this.findParent(path.prev);
            parent = grandparent != null
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
        Object.keys(this._segments).map((key) => this._segments[key]).forEach(callback);
    }
    get segments() {
        return Object.keys(this._segments).map((key) => this._segments[key]);
    }
    get rootSegments() {
        return this._rootSegments;
    }
}
exports.SegmentRepository = SegmentRepository;
//# sourceMappingURL=SegmentRepository.js.map