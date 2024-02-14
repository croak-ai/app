/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginRouteImport } from './routes/login/route'
import { Route as WithAuthRouteImport } from './routes/_with-auth/route'
import { Route as IndexImport } from './routes/index'
import { Route as WithAuthOrganizationSelectorRouteImport } from './routes/_with-auth/organization-selector/route'
import { Route as WithAuthOnboardNewOrgRouteImport } from './routes/_with-auth/onboard-new-org/route'
import { Route as WithAuthWithOrgRouteImport } from './routes/_with-auth/_with-org/route'
import { Route as WithAuthWithOrgWorkspaceRouteImport } from './routes/_with-auth/_with-org/workspace/route'
import { Route as WithAuthWithOrgCreateWorkspaceRouteImport } from './routes/_with-auth/_with-org/create-workspace/route'
import { Route as WithAuthWithOrgWorkspaceIndexImport } from './routes/_with-auth/_with-org/workspace/index'
import { Route as WithAuthWithOrgWorkspaceWorkspaceSlugRouteImport } from './routes/_with-auth/_with-org/workspace/$workspaceSlug/route'
import { Route as WithAuthWithOrgWorkspaceWorkspaceSlugIndexImport } from './routes/_with-auth/_with-org/workspace/$workspaceSlug/index'
import { Route as WithAuthWithOrgWorkspaceWorkspaceSlugChannelChannelSlugRouteImport } from './routes/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelSlug/route'

// Create/Update Routes

const LoginRouteRoute = LoginRouteImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const WithAuthRouteRoute = WithAuthRouteImport.update({
  id: '/_with-auth',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const WithAuthOrganizationSelectorRouteRoute =
  WithAuthOrganizationSelectorRouteImport.update({
    path: '/organization-selector',
    getParentRoute: () => WithAuthRouteRoute,
  } as any)

const WithAuthOnboardNewOrgRouteRoute = WithAuthOnboardNewOrgRouteImport.update(
  {
    path: '/onboard-new-org',
    getParentRoute: () => WithAuthRouteRoute,
  } as any,
)

const WithAuthWithOrgRouteRoute = WithAuthWithOrgRouteImport.update({
  id: '/_with-org',
  getParentRoute: () => WithAuthRouteRoute,
} as any)

const WithAuthWithOrgWorkspaceRouteRoute =
  WithAuthWithOrgWorkspaceRouteImport.update({
    path: '/workspace',
    getParentRoute: () => WithAuthWithOrgRouteRoute,
  } as any)

const WithAuthWithOrgCreateWorkspaceRouteRoute =
  WithAuthWithOrgCreateWorkspaceRouteImport.update({
    path: '/create-workspace',
    getParentRoute: () => WithAuthWithOrgRouteRoute,
  } as any)

const WithAuthWithOrgWorkspaceIndexRoute =
  WithAuthWithOrgWorkspaceIndexImport.update({
    path: '/',
    getParentRoute: () => WithAuthWithOrgWorkspaceRouteRoute,
  } as any)

const WithAuthWithOrgWorkspaceWorkspaceSlugRouteRoute =
  WithAuthWithOrgWorkspaceWorkspaceSlugRouteImport.update({
    path: '/$workspaceSlug',
    getParentRoute: () => WithAuthWithOrgWorkspaceRouteRoute,
  } as any).lazy(() =>
    import(
      './routes/_with-auth/_with-org/workspace/$workspaceSlug/route.lazy'
    ).then((d) => d.Route),
  )

const WithAuthWithOrgWorkspaceWorkspaceSlugIndexRoute =
  WithAuthWithOrgWorkspaceWorkspaceSlugIndexImport.update({
    path: '/',
    getParentRoute: () => WithAuthWithOrgWorkspaceWorkspaceSlugRouteRoute,
  } as any)

const WithAuthWithOrgWorkspaceWorkspaceSlugChannelChannelSlugRouteRoute =
  WithAuthWithOrgWorkspaceWorkspaceSlugChannelChannelSlugRouteImport.update({
    path: '/channel/$channelSlug',
    getParentRoute: () => WithAuthWithOrgWorkspaceWorkspaceSlugRouteRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_with-auth': {
      preLoaderRoute: typeof WithAuthRouteImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRoute
    }
    '/_with-auth/_with-org': {
      preLoaderRoute: typeof WithAuthWithOrgRouteImport
      parentRoute: typeof WithAuthRouteImport
    }
    '/_with-auth/onboard-new-org': {
      preLoaderRoute: typeof WithAuthOnboardNewOrgRouteImport
      parentRoute: typeof WithAuthRouteImport
    }
    '/_with-auth/organization-selector': {
      preLoaderRoute: typeof WithAuthOrganizationSelectorRouteImport
      parentRoute: typeof WithAuthRouteImport
    }
    '/_with-auth/_with-org/create-workspace': {
      preLoaderRoute: typeof WithAuthWithOrgCreateWorkspaceRouteImport
      parentRoute: typeof WithAuthWithOrgRouteImport
    }
    '/_with-auth/_with-org/workspace': {
      preLoaderRoute: typeof WithAuthWithOrgWorkspaceRouteImport
      parentRoute: typeof WithAuthWithOrgRouteImport
    }
    '/_with-auth/_with-org/workspace/$workspaceSlug': {
      preLoaderRoute: typeof WithAuthWithOrgWorkspaceWorkspaceSlugRouteImport
      parentRoute: typeof WithAuthWithOrgWorkspaceRouteImport
    }
    '/_with-auth/_with-org/workspace/': {
      preLoaderRoute: typeof WithAuthWithOrgWorkspaceIndexImport
      parentRoute: typeof WithAuthWithOrgWorkspaceRouteImport
    }
    '/_with-auth/_with-org/workspace/$workspaceSlug/': {
      preLoaderRoute: typeof WithAuthWithOrgWorkspaceWorkspaceSlugIndexImport
      parentRoute: typeof WithAuthWithOrgWorkspaceWorkspaceSlugRouteImport
    }
    '/_with-auth/_with-org/workspace/$workspaceSlug/channel/$channelSlug': {
      preLoaderRoute: typeof WithAuthWithOrgWorkspaceWorkspaceSlugChannelChannelSlugRouteImport
      parentRoute: typeof WithAuthWithOrgWorkspaceWorkspaceSlugRouteImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  WithAuthRouteRoute.addChildren([
    WithAuthWithOrgRouteRoute.addChildren([
      WithAuthWithOrgCreateWorkspaceRouteRoute,
      WithAuthWithOrgWorkspaceRouteRoute.addChildren([
        WithAuthWithOrgWorkspaceWorkspaceSlugRouteRoute.addChildren([
          WithAuthWithOrgWorkspaceWorkspaceSlugIndexRoute,
          WithAuthWithOrgWorkspaceWorkspaceSlugChannelChannelSlugRouteRoute,
        ]),
        WithAuthWithOrgWorkspaceIndexRoute,
      ]),
    ]),
    WithAuthOnboardNewOrgRouteRoute,
    WithAuthOrganizationSelectorRouteRoute,
  ]),
  LoginRouteRoute,
])

/* prettier-ignore-end */
