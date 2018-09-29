import { Segment, SegmentInterface } from "aws-xray-sdk-core";
import { ResponsePath } from "graphql";

/**
 * A repository of Segments.
 */
export class SegmentRepository {
  private _rootSegments: Segment[] = [];
  private _segments: { [path: string]: Segment | undefined } = {};

  public add(path: ResponsePath, segment: Segment): void {
    this._segments[this.pathToString(path)] = segment;

    if (path == null) {
      this._rootSegments.push(segment);
    }
  }

  public find(path: ResponsePath): Segment | undefined {
    return this._segments[this.pathToString(path)];
  }

  public findParent(path: ResponsePath | undefined): Segment | undefined {
    if (path == null) {
      return;
    }

    const parent = this.find(path.prev);

    if (parent != null) {
      return parent;
    }

    return this.findParent(path.prev);
  }

  public pathToString(path: ResponsePath): string {
    let part = path;
    const parts = [];

    while (part != null) {
      parts.push(part.key);
      part = part.prev;
    }

    return parts.reverse().join("/");
  }

  public forEach(callback: (segment: Segment) => void): void {
    Object.keys(this._segments).map((key) => this._segments[key]).forEach(callback);
  }

  public get segments(): Segment[] {
    return Object.keys(this._segments).map((key) => this._segments[key]);
  }

  public get rootSegments(): Segment[] {
    return this._rootSegments;
  }
}
