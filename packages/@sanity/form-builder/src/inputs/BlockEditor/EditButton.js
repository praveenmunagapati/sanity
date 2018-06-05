import React from 'react'
import Button from 'part:@sanity/components/buttons/default'
import EditIcon from 'part:@sanity/base/edit-icon'

type Props = {
  onClick: void => void,
  children: React.Element<*>
}

export default class EditButton extends React.Component<Props> {
  handleClick = event => {
    this.props.onClick(event)
  }
  render() {
    return (
      <Button kind="simple" icon={EditIcon} onClick={this.handleClick}>
        {this.props.children}
      </Button>
    )
  }
}