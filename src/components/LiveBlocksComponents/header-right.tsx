import React from 'react';
import {Trash} from 'iconoir-react-native';
import {View, Pressable} from 'react-native';
import {useLiveblocks} from '../../store/liveblocks';

export default function HeaderRight() {
  const objects = useLiveblocks(state => state.objects);
  const deleteAllObjects = useLiveblocks(state => state.deleteAllObjects);
  return (
    <View>
      <Pressable onPress={deleteAllObjects}>
        <Trash
          width={24}
          height={24}
          strokeWidth={2}
          color={Object.values(objects).length ? '#000000' : '#dddddd'}
        />
      </Pressable>
    </View>
  );
}
