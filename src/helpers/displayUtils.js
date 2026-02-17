import { getDeletedFriendNames } from 'helpers/storageHandlers';

export function getDisplayName(id, friends, currentUserId) {
  if (id == null || id === '') return '-';
  if (id === currentUserId) return 'You';
  const friend = (friends || []).find((f) => String(f.id) === String(id));
  if (friend) return friend.name;
  const deletedNames = getDeletedFriendNames();
  const savedName = deletedNames[String(id)];
  return savedName ? `${savedName} (deleted)` : `${id} (deleted)`;
}
