import ejs from 'ejs'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import Helmet from 'react-helmet'
import bootstrapper from 'react-async-bootstrapper'
import serialize from 'serialize-javascript'
const ReactDOMServer = require('react-dom/server')
const getBundles = require('react-loadable/webpack').getBundles

module.exports = async (template, serverBundle, req, res, next, stats) => {
    try {
        let modules = []
        const routerContext = {}
        const { default: createApp, rootReducer } = serverBundle
        const middleware = [thunkMiddleware]
        const store = createStore(rootReducer, compose(applyMiddleware(...middleware)))
        const app = createApp(req.url, routerContext, store, modules)

        // 此处可以考虑同步一些数据，比如在用户登录的情况下同步登录状态

        // 调用组件的bootstrap获取数据
        await bootstrapper(app)

        if (routerContext.url) {
            res.writeHead(302, {
                Location: routerContext.url
            })
            res.end()
            return
        }

        const appString = ReactDOMServer.renderToString(app)
        const helmet = Helmet.renderStatic()

        if (stats) {
            const bundles = getBundles(stats, modules)

            // 对懒加载的资源进行过滤去重
            const cssBundles = bundles
                .filter(bundle => bundle.publicPath.endsWith('.css'))
                .reduce((result, bundle) => {
                    result.indexOf(bundle.publicPath) === -1 && result.push(bundle.publicPath)
                    return result
                }, [])
                .map(publicPath => `<link rel="stylesheet" type="text/css" href="${publicPath}">`).join('')
            const jsBundles = bundles
                .filter(bundle => bundle.publicPath.endsWith('.js'))
                .reduce((result, bundle) => {
                    result.indexOf(bundle.publicPath) === -1 && result.push(bundle.publicPath)
                    return result
                }, [])
                .map(publicPath => `<script src="${publicPath}"></script>`).join('')

            // 把懒加载的资源添加到模板中
            template = template
                .replace(/(<\/head>)/, `${cssBundles}$1`)
                .replace(/(<script[^>]+app\.[\d\w]+\.js[^>]?><\/script>)/, `${jsBundles}$1`)
        }

        const html = ejs.render(template, {
            appString,
            meta: helmet.meta.toString(),
            link: helmet.link.toString(),
            style: helmet.style.toString(),
            title: helmet.title.toString(),
            initalState: serialize(store.getState().toJS()),
            // 标记服务端渲染页面的地址，在浏览器时用来阻止再次获取服务端渲染预取的数据
            initialUrl: `"${req.url}"`
        })
        res.send(html)
    } catch (error) {
        next(error)
    }
}
