import * as migration_20260813_200358_fix_form_and_video_playback from './20260813_200358_fix_form_and_video_playback';
import * as migration_20260813_202700_add_background_video_playback from './20260813_202700_add_background_video_playback';

export const migrations = [
  {
    up: migration_20260813_200358_fix_form_and_video_playback.up,
    down: migration_20260813_200358_fix_form_and_video_playback.down,
    name: '20260813_200358_fix_form_and_video_playback'
  },
  {
    up: migration_20260813_202700_add_background_video_playback.up,
    down: migration_20260813_202700_add_background_video_playback.down,
    name: '20260813_202700_add_background_video_playback'
  },
];
