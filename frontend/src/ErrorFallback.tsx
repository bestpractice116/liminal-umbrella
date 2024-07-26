import {
	Component,
	createElement,
	ErrorInfo,
	isValidElement,
	createContext,
	ComponentType,
	FunctionComponent,
	PropsWithChildren,
	ReactElement,
	ReactNode,
	useEffect,
	useContext,
	useMemo,
	useState
} from 'react';

declare function FallbackRender(props: FallbackProps): ReactNode;

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

export const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | null>(null);

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

const initialState: ErrorBoundaryState = {
	didCatch: false,
	error: null,
	errorInfo: null
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);

		this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
		this.state = initialState;
	}

	static getDerivedStateFromError(error: Error) {
		return { didCatch: true, error };
	}

	resetErrorBoundary(...args: any[]) {
		const { error } = this.state;

		if (error !== null) {
			this.props.onReset?.({
				args,
				reason: 'imperative-api'
			});

			this.setState(initialState);
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
		this.setState({ errorInfo });
	}

	componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
		const { didCatch } = this.state;
		const { resetKeys } = this.props;

		// There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
		// we'd end up resetting the error boundary immediately.
		// This would likely trigger a second error to be thrown.
		// So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

		if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
			this.props.onReset?.({
				next: resetKeys,
				prev: prevProps.resetKeys,
				reason: 'keys'
			});

			this.setState(initialState);
		}
	}

	render() {
		const { children, fallbackRender, FallbackComponent, fallback } = this.props;
		const { didCatch, error, errorInfo } = this.state;

		let childToRender = children;

		if (didCatch) {
			const props: FallbackProps = {
				error,
				errorInfo,
				resetErrorBoundary: this.resetErrorBoundary
			};

			if (typeof fallbackRender === 'function') {
				childToRender = fallbackRender(props);
			} else if (FallbackComponent) {
				childToRender = createElement(FallbackComponent, props);
			} else if (fallback === null || isValidElement(fallback)) {
				childToRender = fallback;
			} else {
				console.error('react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop');

				throw error;
			}
		}

		return createElement(
			ErrorBoundaryContext.Provider,
			{
				value: {
					didCatch,
					error,
					errorInfo,
					resetErrorBoundary: this.resetErrorBoundary
				}
			},
			childToRender
		);
	}
}

function hasArrayChanged(a: any[] = [], b: any[] = []) {
	return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

type UseErrorBoundaryState<TError> =
	| { error: TError; errorInfo: ErrorInfo | null; hasError: true }
	| { error: null; errorInfo: null; hasError: false };

export type UseErrorBoundaryApi<TError> = {
	resetBoundary: () => void;
	showBoundary: (error: TError, errorInfo?: ErrorInfo | undefined) => void;
};

export function assertErrorBoundaryContext(value: any): asserts value is ErrorBoundaryContextType {
	if (value == null || typeof value.didCatch !== 'boolean' || typeof value.resetErrorBoundary !== 'function') {
		throw new Error('ErrorBoundaryContext not found');
	}
}

export function useErrorBoundary<TError = any>(): UseErrorBoundaryApi<TError> {
	const context = useContext(ErrorBoundaryContext);

	assertErrorBoundaryContext(context);

	const [state, setState] = useState<UseErrorBoundaryState<TError>>({
		error: null,
		errorInfo: null,
		hasError: false
	});

	const memoized = useMemo(
		() => ({
			resetBoundary: () => {
				context.resetErrorBoundary();
				setState({ error: null, errorInfo: null, hasError: false });
			},
			showBoundary: (error: TError, info?: ErrorInfo | undefined) =>
				setState({
					error,
					errorInfo: info || null,
					hasError: true
				})
		}),
		[context.resetErrorBoundary]
	);

	if (state.hasError) {
		throw state.error;
	}

	return memoized;
}

export const ErrorFallback = ({ error, errorInfo }: { error: Error; resetErrorBoundary?: Function; errorInfo?: ErrorInfo }) => {
	// Call resetErrorBoundary() to reset the error boundary and retry the render.
	useEffect(() => {
		console.error(error, errorInfo);
	}, []);
	return (
		<div role="alert">
			<p>Something went wrong:</p>
			<pre style={{ color: 'red' }}>{error ? error.toString() : `Error has no toString() method, is: ${error}`}</pre>
			{errorInfo && errorInfo.componentStack ? <pre style={{ color: 'red' }}>{errorInfo.componentStack}</pre> : null}
		</div>
	);
};
