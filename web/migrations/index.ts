import * as chatReadFlags from './20261004_080000_chat_read_flags'

export const migrations = [{
  name: '20261004_080000_chat_read_flags',
  up: chatReadFlags.up,
  down: chatReadFlags.down,
}]
