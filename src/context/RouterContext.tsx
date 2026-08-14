import {
	createContext,
	useContext,
	useState,
	useEffect,
	PropsWithChildren,
} from 'react'

type ExtractRouteParams<T extends string> =
	T extends `${string}{${infer Param}}${infer Rest}`
		? Param extends `${infer ActualParam}?`
			? { [K in ActualParam]?: string } & ExtractRouteParams<Rest>
			: { [K in Param]: string } & ExtractRouteParams<Rest>
		: {}

type BuildMatchedRoute<T extends Record<string, string>, K extends keyof T> = {
	matches: true
	params: ExtractRouteParams<T[K]>
} & {
	[Flag in `is${Capitalize<string & K>}`]: true
} & {
	[OtherFlag in `is${Capitalize<string & Exclude<keyof T, K>>}`]?: false
}

export type RouteMatcherResult<T extends Record<string, string>> =
	| {
			[K in keyof T]: BuildMatchedRoute<T, K>
	  }[keyof T]
	| ({
			matches: false
			params: null
	  } & {
			[Flag in `is${Capitalize<string & keyof T>}`]?: false
	  })

const matchUrlConfig = <T extends Record<string, string>>(
	currentUrl: string,
	config: T,
): RouteMatcherResult<T> => {
	try {
		const pathname = new URL(currentUrl).pathname

		for (const [routeKey, pattern] of Object.entries(config)) {
			const paramNames = (pattern.match(/\{([^}]+)\}/g) || []).map((name) =>
				name.replace(/[{?}]/g, ''),
			)

			let regexPattern = pattern
			regexPattern = regexPattern.replace(/\/?\{([^}]+)\?\}/g, '(?:\/([^/]+))?')
			regexPattern = regexPattern.replace(/\{[^}]+\}/g, '([^/]+)')

			const matcher = new RegExp(`^${regexPattern}\/?$`)
			const matchResults = pathname.match(matcher)

			if (matchResults) {
				const paramValues = matchResults.slice(1)

				const params = paramNames.reduce(
					(obj, name, index) => {
						const val = paramValues[index]
						if (val !== undefined && val !== '') {
							obj[name] = decodeURIComponent(val)
						}
						return obj
					},
					{} as Record<string, string>,
				)

				const capitalizedKey =
					routeKey.charAt(0).toUpperCase() + routeKey.slice(1)
				const flagName = `is${capitalizedKey}`

				const result: any = {
					matches: true,
					[flagName]: true,
					params: params,
				}

				Object.keys(config).forEach((k) => {
					if (k !== routeKey) {
						result[`is${k.charAt(0).toUpperCase() + k.slice(1)}`] = false
					}
				})

				return result as RouteMatcherResult<T>
			}
		}
	} catch (e) {}

	const fallback: any = { matches: false, params: null }
	Object.keys(config).forEach((k) => {
		fallback[`is${k.charAt(0).toUpperCase() + k.slice(1)}`] = false
	})
	return fallback as RouteMatcherResult<T>
}

/**
 * @typedef {Object} RouteConfiguration
 * @description Application Routing Map defining URL structures.
 * Supports static strings, mandatory tokens, and optional trailing parameters.
 *
 * Syntax Guidelines:
 * 1. Static Paths: Define an exact match path without brackets (e.g., `/dashboard`).
 * 2. Mandatory Variables: Use curly brackets `{paramName}`. The matcher requires
 *    this segment to be present. Maps to `paramName: string`.
 * 3. Optional Variables: Append a question mark inside curly brackets `{paramName?}`.
 *    The segment can be omitted, supporting root and trailing slashes. Maps to `paramName?: string`.
 *
 * @example
 * const routes = {
 *   // Matches exactly '/home'
 *   home: '/home',
 *
 *   // Matches '/lobby/1234' and '/lobby/'. 'code' is optional.
 *   lobby: '/lobby/{code?}',
 *
 *   // Matches '/result/user-1/game/g-42/3'. All parameters are required.
 *   results: '/result/{userId}/game/{gameId}/{roundId}'
 * } as const;
 */

export const createRouter = <const T extends Record<string, string>>(
	config: T,
) => {
	const RouteContext = createContext<RouteMatcherResult<T> | null>(null)

	const RouteProvider: React.FC<PropsWithChildren> = ({ children }) => {
		const [currentMatch, setCurrentMatch] = useState(() =>
			matchUrlConfig(window.location.href, config),
		)

		useEffect(() => {
			const handleLocationChange = () => {
				setCurrentMatch(matchUrlConfig(window.location.href, config))
			}

			window.addEventListener('popstate', handleLocationChange)
			window.addEventListener('pushstate', handleLocationChange)
			window.addEventListener('replacestate', handleLocationChange)

			return () => {
				window.removeEventListener('popstate', handleLocationChange)
				window.removeEventListener('pushstate', handleLocationChange)
				window.removeEventListener('replacestate', handleLocationChange)
			}
		}, [])

		return (
			<RouteContext.Provider value={currentMatch}>
				{children}
			</RouteContext.Provider>
		)
	}

	const useRouter = (): RouteMatcherResult<T> => {
		const context = useContext(RouteContext)
		if (!context) {
			throw new Error(
				'useRouteMatcher must be used within its corresponding RouteProvider',
			)
		}
		return context
	}

	return { RouteProvider, useRouter }
}
