import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { createStore, applyMiddleware, compose} from 'redux'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import Loadable from 'react-loadable'
import { getMatchComponents } from './utils/reactUtil'

import App from './app'
import { routerConfig } from './routes/index'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import rootReducer from './store/reducers'
import { fromJS } from 'immutable'
const initialState = window.__INITIAL_STATE__ || {} // eslint-disable-line

const composeEnhancers = process.env.NODE_ENV === 'development' ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) : compose
const middleware =  process.env.NODE_ENV === 'development' ? [thunkMiddleware, logger] : [thunkMiddleware]
const store = createStore(rootReducer, fromJS(initialState), composeEnhancers(applyMiddleware(...middleware)))

const renderApp = (Component) => {
    ReactDOM.hydrate(
        <AppContainer>
            <Provider store={store}>
                <Router>
                    <Component />
                </Router>
            </Provider>
        </AppContainer>,
        document.getElementById('root')
    )
}

// eslint-disable-next-line
;(async () => {
    // 预加载当前页面匹配的页面组件
    if (process.env.NODE_ENV === 'development') {
        const components = getMatchComponents(routerConfig, window.location.pathname)
        await Promise.all(components.map(component => component.preload && component.preload()))
    }

    Loadable.preloadReady().then(() => renderApp(App))
})()

if (module.hot) {
    // redux hot reload
    module.hot.accept('./store/reducers', () => {
        store.replaceReducer(require('./store/reducers').default) // eslint-disable-line
    })

    // react hot reload
    module.hot.accept('./app', () => {
        Loadable.preloadReady().then(() => {
            const NewApp = require('./app').default // eslint-disable-line
            renderApp(NewApp)
        })
    })
    
    module.hot.accept('./routes/index', () => {
        // 什么都不用做，因为hot reload失效的原因是因为这行
        // import { routerConfig } from './routes/index'
        // 页面组件修改的时候，更新事件会这样冒泡 *.jsx => ./routes/routerComponents.jsx => ./routes/index.jsx => entry-client.js
        // 而之前没有定义接受更新事件的地方，就会刷新页面
    })
}
