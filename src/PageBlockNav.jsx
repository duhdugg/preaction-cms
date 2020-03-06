import PropTypes from 'prop-types'
import React from 'react'
import { Nav } from '@preaction/bootstrap-clips'
import { NavLink } from 'react-router-dom'

class PageBlockNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false
    }
  }

  get menu() {
    let m = []
    this.props.page.siteTree.children.forEach(page => {
      let subMenu = []
      if (this.props.block.settings.subMenu) {
        page.children.forEach(pg => {
          if (pg.userCreated) {
            subMenu.push({
              name: pg.title,
              href: `/${pg.path}/`,
              component: NavLink,
              onClick: e => {
                this.props.navigate(`/${pg.path}/`)
              }
            })
          }
        })
      }
      m.push({
        name: page.title,
        href: `/${page.path}/`,
        component: NavLink,
        onClick: e => {
          this.props.navigate(`/${page.path}/`)
        },
        subMenu: subMenu.length ? subMenu : null
      })
    })
    return m
  }

  toggleSettings() {
    this.setState(state => {
      state.showSettings = !state.showSettings
      return state
    })
  }

  render() {
    return (
      <Nav
        type={this.props.block.settings.navType || 'basic'}
        collapsible={this.props.block.settings.navCollapsible}
        menu={this.menu}
      />
    )
  }
}

PageBlockNav.propTypes = {
  appRoot: PropTypes.string.isRequired,
  block: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  emitSave: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
}

export default PageBlockNav
