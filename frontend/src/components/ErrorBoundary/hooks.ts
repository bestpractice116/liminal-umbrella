import { ErrorInfo, useContext, useMemo, useState } from 'react';
import { ErrorBoundaryContext } from './Context';
import { ErrorBoundaryContextType, UseErrorBoundaryApi, UseErrorBoundaryState } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertErrorBoundaryContext(value: any): asserts value is ErrorBoundaryContextType {
	if (value == null || typeof value.didCatch !== 'boolean' || typeof value.resetErrorBoundary !== 'function') {
		throw new Error('ErrorBoundaryContext not found');
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			showBoundary: (error: TError, info?: ErrorInfo  ) => {
				setState({
					error,
					errorInfo: info || null,
					hasError: true
				});
			}
		}),
		[context]
	);

	if (state.hasError) {
		throw state.error;
	}

	return memoized;
}
