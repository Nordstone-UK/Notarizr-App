import React from 'react';
import {Alert} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import RemoteRonCallScreen from '../src/screens/NotaryCallScreen/RemoteRonCallScreen';

const mockRecord = {
  _id: 'record-1',
  __typename: 'Session',
  client_documents: {
    main: 'https://example.com/main.pdf',
    'additional-1': 'https://example.com/extra.pdf',
  },
};
let mockRole = 'agent';
const mockClient = {
  query: jest.fn(async () => ({data: {getSession: {session: mockRecord}}})),
};
let mockMounts = 0;
let mockUnmounts = 0;
jest.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      booking: {booking: mockRecord},
      user: {user: {account_type: mockRole}},
    }),
}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => mockClient,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0}),
}));
jest.mock('../src/hooks/useRegister', () => () => ({}));
jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  downloadFile: jest.fn(() => ({
    jobId: 1,
    promise: Promise.resolve({statusCode: 200, bytesWritten: 100}),
  })),
  stopDownload: jest.fn(),
  unlink: jest.fn(async () => {}),
}));
jest.mock('react-native-pdf', () => 'Pdf');
jest.mock('../src/components/LiveKitSessionVideo/LiveKitSessionVideo', () => {
  const React = require('react');
  return (props: any) => {
    React.useEffect(() => {
      mockMounts++;
      return () => {
        mockUnmounts++;
      };
    }, []);
    return React.createElement('Meeting', props);
  };
});

const mockNavigation = {
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};
beforeEach(() => {
  jest.clearAllMocks();
  mockMounts = 0;
  mockUnmounts = 0;
  mockRole = 'agent';
});

test('agent opens the original document without remounting the call and confirms before leaving', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let tree: any;
  await act(async () => {
    tree = renderer.create(
      <RemoteRonCallScreen
        route={{params: {uid: 'record-1'}}}
        navigation={mockNavigation}
      />,
    );
  });
  act(() =>
    tree.root
      .findByProps({accessibilityLabel: 'Select document'})
      .props.onPress(),
  );
  expect(
    tree.root.findAllByProps({accessibilityLabel: 'Open extra.pdf'}),
  ).toHaveLength(0);
  await act(async () =>
    tree.root
      .findByProps({accessibilityLabel: 'Open main.pdf'})
      .props.onPress(),
  );
  expect(tree.root.findByType('Meeting').props.compact).toBe(true);
  act(() =>
    tree.root
      .findByProps({accessibilityLabel: 'Close document'})
      .props.onPress(),
  );
  expect(tree.root.findByType('Meeting').props.compact).toBe(false);
  expect(mockMounts).toBe(1);
  expect(mockUnmounts).toBe(0);
  act(() =>
    tree.root.findByProps({accessibilityLabel: 'Leave call'}).props.onPress(),
  );
  expect(mockNavigation.goBack).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith(
    'Leave the call?',
    expect.any(String),
    expect.any(Array),
    expect.any(Object),
  );
  const buttons: any = alert.mock.calls[0][2];
  act(() =>
    buttons.find((button: any) => button.text === 'Leave call').onPress(),
  );
  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
  alert.mockRestore();
});

test('client can reopen the main document and sees additional upload separately', async () => {
  mockRole = 'client';
  let tree: any;
  await act(async () => {
    tree = renderer.create(
      <RemoteRonCallScreen
        route={{params: {uid: 'record-1'}}}
        navigation={mockNavigation}
      />,
    );
  });
  act(() =>
    tree.root
      .findByProps({accessibilityLabel: 'Session documents'})
      .props.onPress(),
  );
  expect(
    tree.root.findByProps({accessibilityLabel: 'Open main.pdf'}),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({accessibilityLabel: 'Open extra.pdf'}),
  ).toBeTruthy();
  expect(JSON.stringify(tree.toJSON())).toContain('Upload additional document');
  act(() => tree.unmount());
});
