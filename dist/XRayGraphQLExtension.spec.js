"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_xray_sdk_core_1 = require("aws-xray-sdk-core");
const chai_1 = require("chai");
const chaiAsPromised = require("chai-as-promised");
const mocha_typescript_1 = require("mocha-typescript");
const sinon = require("sinon");
const td = require("testdouble");
const XRayGraphQLExtension_1 = require("./XRayGraphQLExtension");
// tslint:disable:no-unsafe-any
// tslint:disable:no-object-literal-type-assertion
chai_1.use(chaiAsPromised);
/**
 * Tests for the getConnectionSource function.
 */
let XRayGraphQLExtensionSpec = class XRayGraphQLExtensionSpec {
    beforeEach() {
        this.clock = sinon.useFakeTimers();
    }
    afterEach() {
        this.clock.uninstall();
    }
    testUseProvidedRootSegmentName() {
        this.startRequest(new XRayGraphQLExtension_1.XRayGraphQLExtension((_) => "SegmentNameAsString"));
        chai_1.expect(this.extension.rootSegments[0]).not.to.eq(undefined);
        chai_1.expect(this.extension.rootSegments[0].name).to.eq("SegmentNameAsString");
        chai_1.expect(this.extension.rootSegments[0].isClosed()).to.be.eq(false);
    }
    testUseProvidedRootSegment() {
        this.startRequest(new XRayGraphQLExtension_1.XRayGraphQLExtension((_) => new aws_xray_sdk_core_1.Segment("SegmentAsObject")));
        chai_1.expect(this.extension.rootSegments[0]).not.to.eq(undefined);
        chai_1.expect(this.extension.rootSegments[0].name).to.eq("SegmentAsObject");
        chai_1.expect(this.extension.rootSegments[0].isClosed()).to.be.eq(false);
    }
    testCloseOwnRootSegment() {
        this.startRequest(new XRayGraphQLExtension_1.XRayGraphQLExtension((_) => "SegmentNameAsString"));
        chai_1.expect(this.rootSegment.isClosed()).to.eq(false);
        this.endRequest();
        chai_1.expect(this.rootSegment.isClosed()).to.eq(true);
    }
    testDontCloseExternalRootSegment() {
        this.startRequest();
        chai_1.expect(this.rootSegment.isClosed()).to.eq(false);
        this.endRequest();
        chai_1.expect(this.rootSegment.isClosed()).to.eq(false);
    }
    testOpenSegmentForField() {
        this.startRequest();
        this.requestField("Query.rootField");
        chai_1.expect(this.rootSegment.subsegments[0]).to.deep.include({
            annotations: { GraphQLField: "Query.rootField" },
            name: "rootField",
        });
    }
    testOpenSegmentForEachField() {
        this.startRequest();
        this.requestField("Query.rootField1");
        this.requestField("Query.rootField2");
        chai_1.expect(this.rootSegment.subsegments[0]).to.deep.include({
            annotations: { GraphQLField: "Query.rootField1" },
            name: "rootField1",
        });
        chai_1.expect(this.rootSegment.subsegments[1]).to.deep.include({
            annotations: { GraphQLField: "Query.rootField2" },
            name: "rootField2",
        });
    }
    testClosesAllSegments() {
        this.startRequest();
        const endSubsegment1 = this.requestField("Query.rootField1");
        const endSubsegment2 = this.requestField("Query.rootField2");
        chai_1.expect(this.rootSegment.subsegments[0].isClosed()).to.eq(false);
        chai_1.expect(this.rootSegment.subsegments[1].isClosed()).to.eq(false);
        endSubsegment1();
        endSubsegment2();
        chai_1.expect(this.rootSegment.subsegments[0].isClosed()).to.eq(true);
        chai_1.expect(this.rootSegment.subsegments[1].isClosed()).to.eq(true);
    }
    testClosesSegmentsWithErrors() {
        this.startRequest();
        const endSubsegment0 = this.requestField("Query.rootField1");
        const endSubsegment1 = this.requestField("Query.rootField2");
        chai_1.expect(this.rootSegment.subsegments[0].isClosed()).to.eq(false);
        chai_1.expect(this.rootSegment.subsegments[1].isClosed()).to.eq(false);
        endSubsegment0();
        endSubsegment1(new Error("Something went wrong"));
        chai_1.expect(this.rootSegment.subsegments[0].isClosed()).to.eq(true);
        chai_1.expect(this.rootSegment.subsegments[1].isClosed()).to.eq(true);
        chai_1.expect(this.rootSegment.subsegments[0].fault).to.eq(undefined);
        chai_1.expect(this.rootSegment.subsegments[1].fault).to.eq(true);
    }
    testOpenNestedSegmentForEachField() {
        this.startRequest();
        this.requestField("Query.products");
        this.requestField("Product.products/0/uuid");
        this.requestField("Product.products/1/uuid");
        chai_1.expect(this.rootSegment).to.deep.include({ name: "RootSegment" });
        chai_1.expect(this.rootSegment.subsegments[0]).to.deep.include({
            annotations: { GraphQLField: "Query.products" },
            name: "products",
        });
        chai_1.expect(this.rootSegment.subsegments[0].subsegments[0]).to.deep.include({
            annotations: { GraphQLField: "Product.uuid" },
            name: "products/0/uuid",
        });
        chai_1.expect(this.rootSegment.subsegments[0].subsegments[1]).to.deep.include({
            annotations: { GraphQLField: "Product.uuid" },
            name: "products/1/uuid",
        });
    }
    testClosesNestedSegmentForEachField() {
        this.startRequest();
        this.requestField("Query.products");
        const endNestedSubsegment0 = this.requestField("Product.products/0/uuid");
        const endNestedSubsegment1 = this.requestField("Product.products/1/uuid");
        const nestedSubSegment0 = this.rootSegment.subsegments[0].subsegments[0];
        chai_1.expect(nestedSubSegment0.isClosed()).to.eq(false);
        endNestedSubsegment0();
        chai_1.expect(nestedSubSegment0.isClosed()).to.eq(true);
        const nestedSubSegment1 = this.rootSegment.subsegments[0].subsegments[1];
        chai_1.expect(nestedSubSegment1.isClosed()).to.eq(false);
        endNestedSubsegment1();
        chai_1.expect(nestedSubSegment1.isClosed()).to.eq(true);
    }
    startRequest(extension) {
        this.extension = extension != null
            ? extension
            : new XRayGraphQLExtension_1.XRayGraphQLExtension((_) => new aws_xray_sdk_core_1.Segment("RootSegment"));
        this.endRequest = this.extension.requestDidStart(this.defaultOptions());
        this.rootSegment = this.extension.rootSegments[0];
    }
    requestField(pathStr) {
        const [parentType, pathPart] = pathStr.split(".");
        const path = this.buildPath(pathPart);
        return this.extension.willResolveField({}, {}, {}, {
            fieldName: path.key,
            parentType: { name: parentType },
            path,
        });
    }
    buildPath(path) {
        return path.split("/").reduce((a, n) => ({ key: this.stringOrNumber(n), prev: a }), null);
    }
    stringOrNumber(str) {
        const num = parseInt(str, 10);
        return !isNaN(num) && isFinite(num) ? num : str;
    }
    defaultOptions() {
        const options = td.object("args");
        options.request = {
            headers: { get: (_h) => undefined },
        };
        return options;
    }
};
__decorate([
    mocha_typescript_1.test("it uses provided root segment name"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testUseProvidedRootSegmentName", null);
__decorate([
    mocha_typescript_1.test("it uses provided root segment"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testUseProvidedRootSegment", null);
__decorate([
    mocha_typescript_1.test("it closes own root segment on request end"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testCloseOwnRootSegment", null);
__decorate([
    mocha_typescript_1.test("it doesn't close external root segment on request end"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testDontCloseExternalRootSegment", null);
__decorate([
    mocha_typescript_1.test("it opens a subSegment for a field"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testOpenSegmentForField", null);
__decorate([
    mocha_typescript_1.test("it opens a subSegment for each field requested"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testOpenSegmentForEachField", null);
__decorate([
    mocha_typescript_1.test("it closes subSegments"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testClosesAllSegments", null);
__decorate([
    mocha_typescript_1.test("it closes subSegments with errors"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testClosesSegmentsWithErrors", null);
__decorate([
    mocha_typescript_1.test("it opens nested subsegments"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testOpenNestedSegmentForEachField", null);
__decorate([
    mocha_typescript_1.test("it closes nested subsegments"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], XRayGraphQLExtensionSpec.prototype, "testClosesNestedSegmentForEachField", null);
XRayGraphQLExtensionSpec = __decorate([
    mocha_typescript_1.suite(mocha_typescript_1.timeout(300), mocha_typescript_1.slow(50))
], XRayGraphQLExtensionSpec);
exports.XRayGraphQLExtensionSpec = XRayGraphQLExtensionSpec;
//# sourceMappingURL=XRayGraphQLExtension.spec.js.map