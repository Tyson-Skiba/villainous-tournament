import { createRouter } from './RouterContext'

export const { RouteProvider, useRouter } = createRouter({
	lobbyRoute: '/lobby/{code?}',
	fixtureRoute: '/fixture/{fixture}',
} as const)
