import * as React from 'react'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
        <Link to="/">Home</Link> |{' '}
        <Link to="/about">About</Link>
        <hr />
      <Outlet />
    </React.Fragment>
  )
}
