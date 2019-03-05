import React from 'react';
import classNames from 'classnames';
import { Hyperlink } from '@edx/paragon';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';


class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.menu = React.createRef();
    this.state = {
      expanded: false,
    };

    this.onTriggerClick = this.onTriggerClick.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  // Lifecycle Events
  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true);

    // Call onClose callback when unmounting and open
    if (this.state.expanded && this.props.onClose) {
      this.props.onClose();
    }
  }

  // Event handlers
  onDocumentClick(e) {
    if (!this.props.closeOnDocumentClick) return;

    const clickIsInsideMenu = this.menu.current === e.target || this.menu.current.contains(e.target);
    if (clickIsInsideMenu) return;

    this.close();
  }

  onTriggerClick(e) {
    // Let the browser follow the link of the trigger if the menu
    // is already expanded and the trigger has an href attribute
    if (this.state.expanded && e.target.getAttribute('href')) return;

    e.preventDefault();
    this.toggle();
  }

  onCloseClick() {
    this.getFocusableElements()[0].focus();
    this.close();
  }

  onKeyDown(e) {
    if (!this.state.expanded) return;
    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation();
        this.getFocusableElements()[0].focus();
        this.close();
        break;
      }
      case 'Enter': {
        // Using focusable elements instead of a ref to the trigger
        // because Hyperlink and Button can handle refs as functional compoenents
        if (document.activeElement === this.getFocusableElements()[0]) {
          e.preventDefault();
          this.toggle();
        }
        break;
      }
      case 'Tab': {
        // Trap focus
        const focusableElements = Array.from(this.getFocusableElements());
        const indexOfActiveElement = focusableElements.indexOf(document.activeElement);

        if (indexOfActiveElement === focusableElements.length - 1 && !e.shiftKey) {
          // last. cycle forward
          e.preventDefault();
          focusableElements[0].focus();
        }

        if (indexOfActiveElement === 0 && e.shiftKey) {
          // first. cycle backward
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
        break;
      }
      default:
    }
  }

  onMouseEnter() {
    if (!this.props.respondToPointerEvents) return;

    this.open();
  }

  onMouseLeave() {
    if (!this.props.respondToPointerEvents) return;

    this.close();
  }


  // Internal functions

  getFocusableElements() {
    return this.menu.current.querySelectorAll('button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');
  }

  open() {
    if (this.props.onOpen) this.props.onOpen();
    this.setState({ expanded: true });
    document.addEventListener('click', this.onDocumentClick, true);
  }

  close() {
    if (this.props.onClose) this.props.onClose();
    this.setState({ expanded: false });
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  toggle() {
    if (this.state.expanded) {
      this.close();
    } else {
      this.open();
    }
  }

  renderTrigger(node) {
    return React.cloneElement(node, {
      onClick: this.onTriggerClick,
    });
  }
  renderMenuContent(node) {
    return (
      <CSSTransition
        in={this.state.expanded}
        timeout={this.props.transitionTimeout}
        classNames={this.props.transitionClassName}
        unmountOnExit
      >
        {node}
      </CSSTransition>
    );
  }

  getAttributes() {
    // Any extra props are attributes for the menu
    const attributes = {};
    Object.keys(this.props)
      .filter((property) => Menu.propTypes[property] === undefined)
      .map((property) => {
        attributes[property] = this.props[property];
      });
    return attributes;
  }

  render() {
    const wrappedChildren = React.Children.map(this.props.children, (child) => {
      if (child.type === MenuTrigger) {
        return this.renderTrigger(child);
      }
      return this.renderMenuContent(child);
    });

    return React.createElement(this.props.tag, {
      className: classNames('menu', this.props.className, {
        expanded: this.state.expanded,
      }),
      ref: this.menu,
      onKeyDown: this.onKeyDown,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave,
      children: wrappedChildren,
      ...this.getAttributes(),
    });
  }
}


Menu.propTypes = {
  tag: PropTypes.string,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  closeOnDocumentClick: PropTypes.bool,
  respondToPointerEvents: PropTypes.bool,
  className: PropTypes.string,
  transitionTimeout: PropTypes.number,
  transitionClassName: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
Menu.defaultProps = {
  tag: 'div',
  className: null,
  onClose: null,
  onOpen: null,
  respondToPointerEvents: false,
  closeOnDocumentClick: true,
  transitionTimeout: 0,
  transitionClassName: 'menu-content',
};


function MenuTrigger({ tag, className, ...props }) {
  return React.createElement(tag, {
    className: classNames('menu-trigger', className),
    ...props,
  });
}
MenuTrigger.defaultProps = {
  tag: 'button',
};

function MenuContent({ tag, className, ...props}) {
  return React.createElement(tag, {
    className: classNames('menu-content', className),
    ...props,
  });
}
MenuContent.defaultProps = {
  tag: 'div',
};




export { Menu, MenuTrigger, MenuContent };
