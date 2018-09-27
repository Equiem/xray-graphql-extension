import { Segment } from "aws-xray-sdk-core";
import { ResponsePath } from "graphql";

export class SegmentRepository {
  public segments: { [path: string]: Segment | undefined } = {};
  public rootSegments: Segment[] = [];

  public add(path: ResponsePath, segment: Segment): void {
    this.segments[this.pathToString(path)] = segment;

    if (path == null) {
      this.rootSegments.push(segment);
    }
  }

  public find(path: ResponsePath): Segment | undefined {
    return this.segments[this.pathToString(path)];
  }

  public findParent(path: ResponsePath | undefined): Segment | undefined {
    if (path == null) {
      return;
    }

    let parent = this.find(path.prev);

    if (parent == null) {
      const grandparent = this.findParent(path.prev);
      parent = grandparent
        ? grandparent.addNewSubsegment(this.pathToString(path.prev))
        : new Segment(this.pathToString(path.prev));

      this.add(path.prev, parent);
    }

    return parent;
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
    Object.keys(this.segments).map((key) => this.segments[key]).forEach(callback);
  }
}
