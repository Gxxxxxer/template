import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// import { getPostDetailAsync } from '../../actions/detail'
import { autoFetch } from '../../utils/decorators'
import './style.less'


export default class Detail extends React.Component {
    // static propTypes = {
    //     getPostDetailAsync: PropTypes.func.isRequired,
    //     detail: PropTypes.object.isRequired,
    //     match: PropTypes.object.isRequired,
    //     history: PropTypes.object.isRequired
    // }

    getPostDetailAsync() {
        const { id } = this.props.match.params
        this.props.getPostDetailAsync(id)
    }

    goBack() {
        this.props.history.goBack()
    }

    bootstrap() {
        // this.getPostDetailAsync()
    }

    render() {
        // const { detail } = this.props

        return (
            <div>
                <Helmet>
                    <title>detail</title>
                    <meta name="keywords" content="HTML,ASP,PHP,SQL" />
                </Helmet>
                <div onClick={() => this.goBack()} style={{ cursor: 'pointer' }}>返回</div>
                <div className="wrapper">
                </div>
            </div>
        )
    }
}
