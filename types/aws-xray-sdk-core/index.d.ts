declare module "aws-xray-sdk-core" {
  import * as http from "http";

  export function getSegment(): any;
  export function captureHTTPsGlobal(httpModule: any): any;
  export function capturePromise(): any;
  export function enableManualMode(): any;

  namespace middleware {
    export class IncomingRequestData {
      constructor(req: http.IncomingMessage);
    }
  }

  export interface SegmentInterface {
    trace_id: string;
    id: string;
    start_time: number;
    name: string;
    in_progress: boolean;
    counter: number;
    service: {
      runtime: string;
      runtime_version: string;
      version: string;
      name: string;
    };
    aws: {
      xray: {
        sdk: string;
        sdk_version: string;
        package: string;
      };
    };
    http: middleware.IncomingRequestData;

    addNewSubsegment: (name: string) => Subsegment;
    addIncomingRequestData: (data: middleware.IncomingRequestData) => void;
    addMetadata: (key: string, value: any | null, namespace?: string) => void;
    addAnnotation: (key: string, value: string | number | boolean) => void;
    addThrottleFlag(): void;
    addErrorFlag(): void;
    close: (err?: Error | string, remote?: boolean) => void;
    isClosed: () => boolean;
    flush(): void;
  }

  export class Segment implements SegmentInterface {
    constructor(name: string, rootId?: string, parentId?: string);

    trace_id: string;
    id: string;
    start_time: number;
    name: string;
    in_progress: boolean;
    counter: number;
    service: {
      runtime: string;
      runtime_version: string;
      version: string;
      name: string;
    };
    aws: {
      xray: {
        sdk: string;
        sdk_version: string;
        package: string;
      };
    };
    http: middleware.IncomingRequestData;

    addNewSubsegment: (name: string) => Subsegment;
    addIncomingRequestData: (data: middleware.IncomingRequestData) => void;
    addMetadata: (key: string, value: any | null, namespace?: string) => void;
    addAnnotation: (key: string, value: string | number | boolean) => void;
    addThrottleFlag(): void;
    addErrorFlag(): void;
    close: (err?: Error | string, remote?: boolean) => void;
    isClosed: () => boolean;
    flush(): void;
  }

  export class Subsegment implements SegmentInterface {
    constructor(name: string);

    trace_id: string;
    id: string;
    start_time: number;
    name: string;
    in_progress: boolean;
    counter: number;
    service: {
      runtime: string;
      runtime_version: string;
      version: string;
      name: string;
    };
    aws: {
      xray: {
        sdk: string;
        sdk_version: string;
        package: string;
      };
    };
    http: middleware.IncomingRequestData;

    addNewSubsegment: (name: string) => Subsegment;
    addIncomingRequestData: (data: middleware.IncomingRequestData) => void;
    addMetadata: (key: string, value: any | null, namespace?: string) => void;
    addAnnotation: (key: string, value: string | number | boolean) => void;
    addThrottleFlag(): void;
    addErrorFlag(): void;
    close: (err?: Error | string, remote?: boolean) => void;
    isClosed: () => boolean;
    flush(): void;
  }
}
