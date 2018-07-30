import React from 'react'
import { Switch, Redirect, Route } from 'react-router-dom'

import { createRoutes } from '../utils/reactUtil'
import routerComponents from './routerComponents'

export const routerConfig = [
    {
        path: '/post',
        component: routerComponents.PostList,
        routes: []
    },
    {
        path: '/detail/:id',
        component: routerComponents.Detail
    },
    {
        path: '*',
        component: () => <div>Not match</div>
    }
]

export default () => (
    <Switch>
        <Route
            path="/"
            exact
            render={() => <Redirect to="/post" />}
        />
        {
            createRoutes(routerConfig)
        }
    </Switch>
)
