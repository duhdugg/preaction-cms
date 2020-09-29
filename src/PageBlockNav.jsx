import PropTypes from 'prop-types'
import React from 'react'
import { Nav } from '@preaction/bootstrap-clips'
import { NavLink } from 'react-router-dom'

const getMenu = (props) => {
  const m = []
  if (!props.page.tree) {
    return []
  }
  props.page.tree.children.forEach((page) => {
    if (!page.settings.includeInNav) {
      return
    }
    let subMenu = []
    if (props.block.settings.subMenu) {
      page.children.forEach((pg) => {
        if (pg.settings.includeInNav) {
          subMenu.push({
            name: pg.title,
            href: `/${pg.path}/`,
            component: NavLink,
            order: Number(pg.settings.navOrdering || 0),
            onClick: (e) => {
              e.preventDefault()
              props.navigate(`/${pg.path}/`)
            },
          })
        }
      })
    }
    m.push({
      name: page.title,
      href: `/${page.path}/`,
      component: NavLink,
      order: Number(page.settings.navOrdering || 0),
      onClick: (e) => {
        e.preventDefault()
        props.navigate(`/${page.path}/`)
      },
      subMenu: subMenu.length ? subMenu : null,
    })
    m.sort((a, b) => {
      let retval = 0
      if (a.name < b.name) {
        retval = -1
      } else if (a.name > b.name) {
        retval = 1
      }
      let aOrder = a.order
      let bOrder = b.order
      if (aOrder === undefined) {
        aOrder = 0
      }
      if (bOrder === undefined) {
        bOrder = 0
      }
      if (aOrder < bOrder) {
        retval = -1
      } else if (aOrder > bOrder) {
        retval = 1
      }
      return retval
    })
  })
  return m
}

function PageBlockNav(props) {
  return (
    <Nav
      align={props.block.settings.navAlignment}
      type='basic'
      collapsible={props.block.settings.navCollapsible}
      menu={getMenu(props)}
    />
  )
}

PageBlockNav.propTypes = {
  block: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  page: PropTypes.object.isRequired,
}

export default PageBlockNav
