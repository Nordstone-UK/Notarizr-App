/* global jest */
const React = require('react');
const {Text} = require('react-native');

function IconMock(props) {
  return React.createElement(Text, props, props.name || 'icon');
}

IconMock.loadFont = jest.fn();

module.exports = IconMock;
