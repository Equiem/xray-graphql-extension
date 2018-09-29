import { Headers, Request } from "apollo-server-env";
import { Segment, Subsegment } from "aws-xray-sdk-core";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { GraphQLResolveInfo, ResponsePath } from "graphql";
import { EndHandler } from "graphql-extensions";
import { slow, suite, test, timeout } from "mocha-typescript";
import * as sinon from "sinon";
import * as td from "testdouble";
import { GraphQLExtensionRequestStartArgs } from "./GraphQLRequestStartArgs";
import { XRayGraphQLExtension } from "./XRayGraphQLExtension";

// tslint:disable:no-unsafe-any
// tslint:disable:no-object-literal-type-assertion

chaiUse(chaiAsPromised);

/**
 * Tests for the getConnectionSource function.
 */
@suite(timeout(300), slow(50))
export class XRayGraphQLExtensionSpec {
  private rootSegment: Segment;
  private extension: XRayGraphQLExtension;
  private endRequest: EndHandler;
  private clock: sinon.SinonFakeTimers;

  public beforeEach(): void {
    this.clock = sinon.useFakeTimers();
  }

  public afterEach(): void {
    this.clock.uninstall();
  }

  @test("it uses provided root segment name")
  public testUseProvidedRootSegmentName(): void {
    this.startRequest(new XRayGraphQLExtension((_): string => "SegmentNameAsString"));

    expect(this.extension.rootSegments[0]).not.to.eq(undefined);
    expect(this.extension.rootSegments[0].name).to.eq("SegmentNameAsString");
    expect(this.extension.rootSegments[0].isClosed()).to.be.eq(false);
  }

  @test("it uses provided root segment")
  public testUseProvidedRootSegment(): void {
    this.startRequest(new XRayGraphQLExtension((_): Segment => new Segment("SegmentAsObject")));
    expect(this.extension.rootSegments[0]).not.to.eq(undefined);
    expect(this.extension.rootSegments[0].name).to.eq("SegmentAsObject");
    expect(this.extension.rootSegments[0].isClosed()).to.be.eq(false);
  }

  @test("it closes own root segment on request end")
  public testCloseOwnRootSegment(): void {
    this.startRequest(new XRayGraphQLExtension((_): string => "SegmentNameAsString"));
    expect(this.rootSegment.isClosed()).to.eq(false);

    this.endRequest();
    expect(this.rootSegment.isClosed()).to.eq(true);
  }

  @test("it doesn't close external root segment on request end")
  public testDontCloseExternalRootSegment(): void {
    this.startRequest();
    expect(this.rootSegment.isClosed()).to.eq(false);

    this.endRequest();
    expect(this.rootSegment.isClosed()).to.eq(false);
  }

  @test("it opens a subSegment for a field")
  public testOpenSegmentForField(): void {
    this.startRequest();
    this.requestField("Query.rootField");

    expect(this.rootSegment.subsegments[0]).to.deep.include({
      annotations: { GraphQLField: "Query.rootField" },
      name: "rootField",
    });
  }

  @test("it opens a subSegment for each field requested")
  public testOpenSegmentForEachField(): void {
    this.startRequest();

    this.requestField("Query.rootField1");
    this.requestField("Query.rootField2");

    expect(this.rootSegment.subsegments[0]).to.deep.include({
      annotations: { GraphQLField: "Query.rootField1" },
      name: "rootField1",
    });

    expect(this.rootSegment.subsegments[1]).to.deep.include({
      annotations: { GraphQLField: "Query.rootField2" },
      name: "rootField2",
    });
  }

  @test("it closes subSegments")
  public testClosesAllSegments(): void {
    this.startRequest();

    const endSubsegment1 = this.requestField("Query.rootField1");
    const endSubsegment2 = this.requestField("Query.rootField2");

    expect(this.rootSegment.subsegments[0].isClosed()).to.eq(false);
    expect(this.rootSegment.subsegments[1].isClosed()).to.eq(false);

    endSubsegment1();
    endSubsegment2();

    expect(this.rootSegment.subsegments[0].isClosed()).to.eq(true);
    expect(this.rootSegment.subsegments[1].isClosed()).to.eq(true);
  }

  @test("it closes subSegments with errors")
  public testClosesSegmentsWithErrors(): void {
    this.startRequest();

    const endSubsegment0 = this.requestField("Query.rootField1");
    const endSubsegment1 = this.requestField("Query.rootField2");

    expect(this.rootSegment.subsegments[0].isClosed()).to.eq(false);
    expect(this.rootSegment.subsegments[1].isClosed()).to.eq(false);

    endSubsegment0();
    endSubsegment1(new Error("Something went wrong"));

    expect(this.rootSegment.subsegments[0].isClosed()).to.eq(true);
    expect(this.rootSegment.subsegments[1].isClosed()).to.eq(true);
    expect(this.rootSegment.subsegments[0].fault).to.eq(undefined);
    expect(this.rootSegment.subsegments[1].fault).to.eq(true);
  }

  @test("it opens nested subsegments")
  public testOpenNestedSegmentForEachField(): void {
    this.startRequest();
    this.requestField("Query.products");
    this.requestField("Product.products/0/uuid");
    this.requestField("Product.products/1/uuid");

    expect(this.rootSegment).to.deep.include({ name: "RootSegment" });

    expect(this.rootSegment.subsegments[0]).to.deep.include({
      annotations: { GraphQLField: "Query.products" },
      name: "products",
    });

    expect(this.rootSegment.subsegments[0].subsegments[0]).to.deep.include({
      annotations: { GraphQLField: "Product.uuid" },
      name: "products/0/uuid",
    });

    expect(this.rootSegment.subsegments[0].subsegments[1]).to.deep.include({
      annotations: { GraphQLField: "Product.uuid" },
      name: "products/1/uuid",
    });
  }

  @test("it closes nested subsegments")
  public testClosesNestedSegmentForEachField(): void {
    this.startRequest();
    this.requestField("Query.products");
    const endNestedSubsegment0 = this.requestField("Product.products/0/uuid");
    const endNestedSubsegment1 = this.requestField("Product.products/1/uuid");

    const nestedSubSegment0 = this.rootSegment.subsegments[0].subsegments[0];
    expect(nestedSubSegment0.isClosed()).to.eq(false);

    endNestedSubsegment0();
    expect(nestedSubSegment0.isClosed()).to.eq(true);

    const nestedSubSegment1 = this.rootSegment.subsegments[0].subsegments[1];
    expect(nestedSubSegment1.isClosed()).to.eq(false);

    endNestedSubsegment1();
    expect(nestedSubSegment1.isClosed()).to.eq(true);
  }

  private startRequest(extension?: XRayGraphQLExtension): void {
    this.extension = extension != null
      ? extension
      : new XRayGraphQLExtension((_): Segment => new Segment("RootSegment"));

    this.endRequest = this.extension.requestDidStart(this.defaultOptions());
    this.rootSegment = this.extension.rootSegments[0];
  }

  private requestField(pathStr: string): EndHandler {
    const [parentType, pathPart] = pathStr.split(".");
    const path = this.buildPath(pathPart);

    return this.extension.willResolveField({}, {}, {}, {
      fieldName: path.key,
      parentType: { name: parentType },
      path,
    } as GraphQLResolveInfo);
  }

  private buildPath(path: string): ResponsePath {
    return path.split("/").reduce((a, n) => ({ key: this.stringOrNumber(n), prev: a }), null as ResponsePath);
  }

  private stringOrNumber(str: string): string | number {
    const num = parseInt(str, 10);

    return !isNaN(num) && isFinite(num) ? num : str;
  }

  private defaultOptions(): GraphQLExtensionRequestStartArgs<any> {
    const options = td.object<GraphQLExtensionRequestStartArgs<any>>("args");

    options.request = {
      headers: { get: (_h: string): undefined => undefined } as Headers,
    } as Request;

    return options;
  }
}
