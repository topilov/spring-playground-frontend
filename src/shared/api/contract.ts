import type { paths } from './generated/schema';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type JsonContent<T> = T extends { content: infer Content }
  ? Content extends Record<string, infer Body>
    ? Body
    : undefined
  : undefined;

type OperationFor<
  Path extends keyof paths,
  Method extends Extract<keyof paths[Path], HttpMethod>,
> = NonNullable<paths[Path][Method]>;

type ResponsesFor<
  Path extends keyof paths,
  Method extends Extract<keyof paths[Path], HttpMethod>,
> = OperationFor<Path, Method> extends { responses: infer Responses } ? Responses : never;

type DefaultSuccessStatus<
  Path extends keyof paths,
  Method extends Extract<keyof paths[Path], HttpMethod>,
> = Extract<keyof ResponsesFor<Path, Method>, 200 | 201 | 202 | 204>;

export type ApiPath = keyof paths;
export type ApiMethod<Path extends ApiPath> = Extract<keyof paths[Path], HttpMethod>;

export type ApiRequestBody<
  Path extends ApiPath,
  Method extends ApiMethod<Path>,
> = OperationFor<Path, Method> extends {
  requestBody: {
    content: {
      'application/json': infer Body;
    };
  };
}
  ? Body
  : never;

export type ApiResponse<
  Path extends ApiPath,
  Method extends ApiMethod<Path>,
  Status extends keyof ResponsesFor<Path, Method> = DefaultSuccessStatus<Path, Method>,
> = JsonContent<ResponsesFor<Path, Method>[Status]>;
