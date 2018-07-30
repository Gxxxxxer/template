import React from 'react'
import Helmet from 'react-helmet'
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// import { getPostListAsync } from '../../actions/post'
import { autoFetch } from '~/utils/decorators'
import styles from './style.css'
import vueLogo from '~/assets/img/vue.png'
import reactLogo from '~/assets/img/react.png'
import { getPostData } from '~/store/actions/post'

const mapStateToProps = state => ({
    postData: state.get('postData')
})
const mapDispatchToProps = (dispatch) => bindActionCreators({
    getPostData
}, dispatch)
@withRouter
@connect(mapStateToProps, mapDispatchToProps)
// @autoFetch
export default class PostList extends React.Component {
    static propTypes = {
        // getPostListAsync: PropTypes.func.isRequired,
        // post: PropTypes.array.isRequired,
        // history: PropTypes.object.isRequired
    }

    handleClick(id) {
        this.props.history.push(`/detail/${id}`)
    }
    componentDidMount(){
        this.props.getPostData()
    }
    bootstrap() {
        // const page = (Math.random() * 5) + 1
        // this.props.getPostListAsync(1)
    }

    render() {
        const { postData } = this.props
        console.log(this.props)
        return (
            <div>
                <Helmet>
                    <title>post</title>
                    <meta name="keywords" content="list" />
                </Helmet>
                <div className="logo-wrapper">
                    <img className="logo" src={vueLogo} alt="" />
                    <img className="logo" src={reactLogo} alt="" />
                </div>
                <ul className="list">
                    
                </ul>
            </div>
        )
    }
}
