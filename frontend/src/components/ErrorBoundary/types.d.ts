/* eslint-disable @typescript-eslint/no-explicit-any */
export type FallbackProps = {
	error: any;
	errorInfo: any;
	resetErrorBoundary: (...args: any[]) => void;
};

type ErrorBoundarySharedProps = PropsWithChildren<{
	onError?: (error: Error, info: ErrorInfo) => void;
	onReset?: (details: { reason: 'imperative-api'; args: any[] } | { reason: 'keys'; prev: any[] | undefined; next: any[] | undefined }) => void;
	resetKeys?: any[];
}>;

export type ErrorBoundaryPropsWithComponent = ErrorBoundarySharedProps & {
	fallback?: never;
	FallbackComponent: ComponentType<FallbackProps>;
	fallbackRender?: never;
};

export type ErrorBoundaryPropsWithRender = ErrorBoundarySharedProps & {
	fallback?: never;
	FallbackComponent?: never;
	fallbackRender: typeof FallbackRender;
};

export type ErrorBoundaryPropsWithFallback = ErrorBoundarySharedProps & {
	fallback: ReactElement<unknown, string | FunctionComponent | typeof Component> | null;
	FallbackComponent?: never;
	fallbackRender?: never;
};

export type ErrorBoundaryProps = ErrorBoundaryPropsWithFallback | ErrorBoundaryPropsWithComponent | ErrorBoundaryPropsWithRender;

export type ErrorBoundaryContextType = {
	didCatch: boolean;
	error: any;
	errorInfo: any;
	resetErrorBoundary: (...args: any[]) => void;
};

type ErrorBoundaryState =
	| {
			didCatch: true;
			error: any;
			errorInfo: any;
	  }
	| {
			didCatch: false;
			error: null;
			errorInfo: null;
	  };

export type UseErrorBoundaryState<TError> =
	| { error: TError; errorInfo: ErrorInfo | null; hasError: true }
	| { error: null; errorInfo: null; hasError: false };

export type UseErrorBoundaryApi<TError> = {
	resetBoundary: () => void;
	showBoundary: (error: TError, errorInfo?: ErrorInfo | undefined) => void;
};
