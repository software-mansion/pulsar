import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar_haptics/pulsar.dart';

Map<String, Object?> _preset(String id, {Map<String, Object?>? video}) => {
  'id': id,
  'name': id,
  'duration': 3000.0,
  'hasAudio': video?['muted'] == true,
  'hasAnimation': false,
  'pattern': const <String, Object?>{},
  'video': ?video,
};

void main() {
  test('PresetHandle exposes the extracted video and its dimensions', () {
    final handle = PresetHandle.fromMap(
      'token',
      _preset(
        'intro',
        video: {
          'path': '/cache/PulsarBundles/com.acme.video/video/intro.mp4',
          'width': 1280,
          'height': 720,
          'muted': false,
        },
      ),
    );

    expect(handle.hasVideo, isTrue);
    expect(
      handle.video?.path,
      '/cache/PulsarBundles/com.acme.video/video/intro.mp4',
    );
    expect(handle.video?.width, 1280);
    expect(handle.video?.height, 720);
    expect(handle.video?.isMuted, isFalse);
  });

  test('bundle audio keeps the video muted', () {
    final handle = PresetHandle.fromMap(
      'token',
      _preset('trailer', video: {'path': '/v.mp4', 'muted': true}),
    );

    expect(handle.hasAudio, isTrue);
    expect(handle.video?.isMuted, isTrue);
    expect(handle.video?.width, 0);
    expect(handle.video?.height, 0);
  });

  test('a preset without a video has none', () {
    final handle = PresetHandle.fromMap('token', _preset('tap'));

    expect(handle.video, isNull);
    expect(handle.hasVideo, isFalse);
  });
}
