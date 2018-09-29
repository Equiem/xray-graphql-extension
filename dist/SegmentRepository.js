"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const parent = this.find(path.prev);
        if (parent != null) {
            return parent;
        }
        return this.findParent(path.prev);
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