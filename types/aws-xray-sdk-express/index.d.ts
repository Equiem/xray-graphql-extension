declare module "aws-xray-sdk-express" {
import { RequestHandler } from "express";

  export function openSegment(defaultName: string): RequestHandler;
  export function closeSegment(): RequestHandler;
}