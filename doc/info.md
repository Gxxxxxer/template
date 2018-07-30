### 服务端渲染数据预取
在容器组件中添加一个`bootstrap`的方法，在里面放置数据获取的代码，服务端渲染时会自动调用，该方法可以返回一个`promise`，以下2种方式都可以
```js
bootstrap() {
    this.getPostDetailAsync()
}

bootstrap() {
    return axios.get('/url')
}
```
既然页面初始化的数据可以通过组件的`bootstrap`方法去获取数据，那回到浏览器这边也是可以的，所以对于页面初始数据的获取，不管在浏览器还是服务端，都不需要手动调用，只要定义好即可，在浏览器这边我写了一个`高阶组件`去统一调用的，具体代码下面会看到

### 环境区分
通过判断`process.env.isClient`或`process.env.isServer`区分

### 如何防止再次获取服务端渲染预取的数据
对于服务端渲染预取的数据，回到浏览器时肯定是不需要获取的，在思考这个问题的时候，也参考过几个模板的处理方法，总感觉不够方便，多少和业务代码耦合了，还要一个一个处理，使用不方便，也想过通过去记录`action`或通过`url`匹配组件的方式，最后都行不通，最后的最后总算是让我找到一个感觉不错的方法，只需要在容器组件添加一行即可`@autoFetch`，不过添加的位置是有限制的，比如要添加`@connect()`和`@autoFetch`到`Component`，那顺序只能是`@connect() @autoFetch Component`，这个跟我的实现方式有关，而解决再次获取服务端渲染预取的数据的问题，主要是利用了组件的`生命周期执行顺序`，代码如下
```js
export const autoFetch = Component => {
    class AutoFetchComponent extends Component {
        componentWillMount() {
            // eslint-disable-next-line
            if (process.env.isClient && !window.__INITIAL_URL__) {
                typeof super.bootstrap === 'function' && super.bootstrap()
            }
            typeof super.componentWillMount === 'function' && super.componentWillMount()
        }

        componentDidMount() {
            window.__INITIAL_URL__ && delete window.__INITIAL_URL__ // eslint-disable-line
            typeof super.componentDidMount === 'function' && super.componentDidMount()
        }
    }

    return AutoFetchComponent
}
```
浏览器的页面初始数据就是在`componentWillMount`中统一获取的，`window.__INITIAL_URL__`是服务端渲染时的`url`(详细可查看`server/ssr/render.js`)，在页面刷新的时候，`window.__INITIAL_URL__`是当前服务端渲染时的`url`，然后`componentWillMount`的时候发现存在`window.__INITIAL_URL__`就不在获取初始数据了，然后`componentDidMount`就删掉`window.__INITIAL_URL__`，接下来在浏览器这边的路由跳转就可以正常获取数据了，这是很显然的，那对于嵌套路由是否也可以呢？答案也是可以的，比如页面A里面有一个嵌套路由B，两个页面都添加了`@autoFetch`，生命周期会是以下执行顺序，A页面`componentWillMount` => A页面`render` => B页面`componentWillMount` => B页面`render` => B页面`componentDidMount` => A页面`componentDidMount`，基于这样的生命周期执行顺序，在第一次`componentDidMount`时，所有页面级组件的`componentWillMount`都已执行，就可以利用`window.__INITIAL_URL__`绕过数据获取了，`componentDidMount`之后清除`window.__INITIAL_URL__`，接下来的路由跳转就会自动获取数据了

