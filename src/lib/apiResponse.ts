import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
};

export function success<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status });
}

export function failure(
  code: string,
  message: string,
  status = 400,
  details?: any
) {
  return NextResponse.json<ApiError>(
    { ok: false, error: { code, message, details } },
    { status }
  );
}
