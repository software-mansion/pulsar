part of 'package:pulsar_haptics/pulsar.dart';

/// Fire-and-forget convenience wrapper around [PulsarPresets].
class PulsarSyncPresets {
  PulsarSyncPresets._(this._presets);

  final PulsarPresets _presets;

  /// Play a preset by its [name] string without awaiting the platform call.
  void play(String name) => _presets.playSync(name);

  /// Plays the system light-impact haptic without awaiting the platform call.
  void systemImpactLight() => _presets.playSync('systemImpactLight');

  /// Plays the system medium-impact haptic without awaiting the platform call.
  void systemImpactMedium() => _presets.playSync('systemImpactMedium');

  /// Plays the system heavy-impact haptic without awaiting the platform call.
  void systemImpactHeavy() => _presets.playSync('systemImpactHeavy');

  /// Plays the system soft-impact haptic without awaiting the platform call.
  void systemImpactSoft() => _presets.playSync('systemImpactSoft');

  /// Plays the system rigid-impact haptic without awaiting the platform call.
  void systemImpactRigid() => _presets.playSync('systemImpactRigid');

  /// Plays the system success-notification haptic without awaiting the platform call.
  void systemNotificationSuccess() =>
      _presets.playSync('systemNotificationSuccess');

  /// Plays the system warning-notification haptic without awaiting the platform call.
  void systemNotificationWarning() =>
      _presets.playSync('systemNotificationWarning');

  /// Plays the system error-notification haptic without awaiting the platform call.
  void systemNotificationError() =>
      _presets.playSync('systemNotificationError');

  /// Plays the system selection-change haptic without awaiting the platform call.
  void systemSelection() => _presets.playSync('systemSelection');

  /// Plays the system single-click effect haptic without awaiting the platform call.
  void systemEffectClick() => _presets.playSync('systemEffectClick');

  /// Plays the system double-click effect haptic without awaiting the platform call.
  void systemEffectDoubleClick() =>
      _presets.playSync('systemEffectDoubleClick');

  /// Plays the system tick effect haptic without awaiting the platform call.
  void systemEffectTick() => _presets.playSync('systemEffectTick');

  /// Plays the system heavy-click effect haptic without awaiting the platform call.
  void systemEffectHeavyClick() => _presets.playSync('systemEffectHeavyClick');

  /// Plays the system long-press haptic without awaiting the platform call.
  void systemLongPress() => _presets.playSync('systemLongPress');

  /// Plays the system virtual-key haptic without awaiting the platform call.
  void systemVirtualKey() => _presets.playSync('systemVirtualKey');

  /// Plays the system keyboard-tap haptic without awaiting the platform call.
  void systemKeyboardTap() => _presets.playSync('systemKeyboardTap');

  /// Plays the system clock-tick haptic without awaiting the platform call.
  void systemClockTick() => _presets.playSync('systemClockTick');

  /// Plays the system calendar-date-picker haptic without awaiting the platform call.
  void systemCalendarDate() => _presets.playSync('systemCalendarDate');

  /// Plays the system context-click haptic without awaiting the platform call.
  void systemContextClick() => _presets.playSync('systemContextClick');

  /// Plays the system keyboard-press haptic without awaiting the platform call.
  void systemKeyboardPress() => _presets.playSync('systemKeyboardPress');

  /// Plays the system keyboard-release haptic without awaiting the platform call.
  void systemKeyboardRelease() => _presets.playSync('systemKeyboardRelease');

  /// Plays the system virtual-key-release haptic without awaiting the platform call.
  void systemVirtualKeyRelease() =>
      _presets.playSync('systemVirtualKeyRelease');

  /// Plays the system text-handle-move haptic without awaiting the platform call.
  void systemTextHandleMove() => _presets.playSync('systemTextHandleMove');

  /// Plays the system drag-crossing haptic without awaiting the platform call.
  void systemDragCrossing() => _presets.playSync('systemDragCrossing');

  /// Plays the system gesture-start haptic without awaiting the platform call.
  void systemGestureStart() => _presets.playSync('systemGestureStart');

  /// Plays the system gesture-end haptic without awaiting the platform call.
  void systemGestureEnd() => _presets.playSync('systemGestureEnd');

  /// Plays the system edge-squeeze haptic without awaiting the platform call.
  void systemEdgeSqueeze() => _presets.playSync('systemEdgeSqueeze');

  /// Plays the system edge-release haptic without awaiting the platform call.
  void systemEdgeRelease() => _presets.playSync('systemEdgeRelease');

  /// Plays the system confirm haptic without awaiting the platform call.
  void systemConfirm() => _presets.playSync('systemConfirm');

  /// Plays the system release haptic without awaiting the platform call.
  void systemRelease() => _presets.playSync('systemRelease');

  /// Plays the system scroll-tick haptic without awaiting the platform call.
  void systemScrollTick() => _presets.playSync('systemScrollTick');

  /// Plays the system scroll-item-focus haptic without awaiting the platform call.
  void systemScrollItemFocus() => _presets.playSync('systemScrollItemFocus');

  /// Plays the system scroll-limit haptic without awaiting the platform call.
  void systemScrollLimit() => _presets.playSync('systemScrollLimit');

  /// Plays the system toggle-on haptic without awaiting the platform call.
  void systemToggleOn() => _presets.playSync('systemToggleOn');

  /// Plays the system toggle-off haptic without awaiting the platform call.
  void systemToggleOff() => _presets.playSync('systemToggleOff');

  /// Plays the system drag-start haptic without awaiting the platform call.
  void systemDragStart() => _presets.playSync('systemDragStart');

  /// Plays the system segment-tick haptic without awaiting the platform call.
  void systemSegmentTick() => _presets.playSync('systemSegmentTick');

  /// Plays the system frequent-segment-tick haptic without awaiting the platform call.
  void systemSegmentFrequentTick() =>
      _presets.playSync('systemSegmentFrequentTick');

  /// Plays the system primitive-click haptic without awaiting the platform call.
  void systemPrimitiveClick() => _presets.playSync('systemPrimitiveClick');

  /// Plays the system primitive-thud haptic without awaiting the platform call.
  void systemPrimitiveThud() => _presets.playSync('systemPrimitiveThud');

  /// Plays the system primitive-spin haptic without awaiting the platform call.
  void systemPrimitiveSpin() => _presets.playSync('systemPrimitiveSpin');

  /// Plays the system primitive-quick-rise haptic without awaiting the platform call.
  void systemPrimitiveQuickRise() =>
      _presets.playSync('systemPrimitiveQuickRise');

  /// Plays the system primitive-slow-rise haptic without awaiting the platform call.
  void systemPrimitiveSlowRise() =>
      _presets.playSync('systemPrimitiveSlowRise');

  /// Plays the system primitive-quick-fall haptic without awaiting the platform call.
  void systemPrimitiveQuickFall() =>
      _presets.playSync('systemPrimitiveQuickFall');

  /// Plays the system primitive-tick haptic without awaiting the platform call.
  void systemPrimitiveTick() => _presets.playSync('systemPrimitiveTick');

  /// Plays the system primitive-low-tick haptic without awaiting the platform call.
  void systemPrimitiveLowTick() => _presets.playSync('systemPrimitiveLowTick');

  /// Plays the afterglow preset without awaiting the platform call.
  void afterglow() => _presets.playSync('afterglow');

  /// Plays the aftershock preset without awaiting the platform call.
  void aftershock() => _presets.playSync('aftershock');

  /// Plays the alarm preset without awaiting the platform call.
  void alarm() => _presets.playSync('alarm');

  /// Plays the anvil preset without awaiting the platform call.
  void anvil() => _presets.playSync('anvil');

  /// Plays the applause preset without awaiting the platform call.
  void applause() => _presets.playSync('applause');

  /// Plays the ascent preset without awaiting the platform call.
  void ascent() => _presets.playSync('ascent');

  /// Plays the balloon-pop preset without awaiting the platform call.
  void balloonPop() => _presets.playSync('balloonPop');

  /// Plays the barrage preset without awaiting the platform call.
  void barrage() => _presets.playSync('barrage');

  /// Plays the bass-drop preset without awaiting the platform call.
  void bassDrop() => _presets.playSync('bassDrop');

  /// Plays the batter preset without awaiting the platform call.
  void batter() => _presets.playSync('batter');

  /// Plays the bell-toll preset without awaiting the platform call.
  void bellToll() => _presets.playSync('bellToll');

  /// Plays the blip preset without awaiting the platform call.
  void blip() => _presets.playSync('blip');

  /// Plays the bloom preset without awaiting the platform call.
  void bloom() => _presets.playSync('bloom');

  /// Plays the bongo preset without awaiting the platform call.
  void bongo() => _presets.playSync('bongo');

  /// Plays the boulder preset without awaiting the platform call.
  void boulder() => _presets.playSync('boulder');

  /// Plays the breaking-wave preset without awaiting the platform call.
  void breakingWave() => _presets.playSync('breakingWave');

  /// Plays the breath preset without awaiting the platform call.
  void breath() => _presets.playSync('breath');

  /// Plays the buildup preset without awaiting the platform call.
  void buildup() => _presets.playSync('buildup');

  /// Plays the burst preset without awaiting the platform call.
  void burst() => _presets.playSync('burst');

  /// Plays the buzz preset without awaiting the platform call.
  void buzz() => _presets.playSync('buzz');

  /// Plays the cadence preset without awaiting the platform call.
  void cadence() => _presets.playSync('cadence');

  /// Plays the camera-shutter preset without awaiting the platform call.
  void cameraShutter() => _presets.playSync('cameraShutter');

  /// Plays the canter preset without awaiting the platform call.
  void canter() => _presets.playSync('canter');

  /// Plays the cascade preset without awaiting the platform call.
  void cascade() => _presets.playSync('cascade');

  /// Plays the castanets preset without awaiting the platform call.
  void castanets() => _presets.playSync('castanets');

  /// Plays the cat-paw preset without awaiting the platform call.
  void catPaw() => _presets.playSync('catPaw');

  /// Plays the charge preset without awaiting the platform call.
  void charge() => _presets.playSync('charge');

  /// Plays the chime preset without awaiting the platform call.
  void chime() => _presets.playSync('chime');

  /// Plays the chip preset without awaiting the platform call.
  void chip() => _presets.playSync('chip');

  /// Plays the chirp preset without awaiting the platform call.
  void chirp() => _presets.playSync('chirp');

  /// Plays the clamor preset without awaiting the platform call.
  void clamor() => _presets.playSync('clamor');

  /// Plays the clasp preset without awaiting the platform call.
  void clasp() => _presets.playSync('clasp');

  /// Plays the cleave preset without awaiting the platform call.
  void cleave() => _presets.playSync('cleave');

  /// Plays the coil preset without awaiting the platform call.
  void coil() => _presets.playSync('coil');

  /// Plays the coin-drop preset without awaiting the platform call.
  void coinDrop() => _presets.playSync('coinDrop');

  /// Plays the combination-lock preset without awaiting the platform call.
  void combinationLock() => _presets.playSync('combinationLock');

  /// Plays the crescendo preset without awaiting the platform call.
  void crescendo() => _presets.playSync('crescendo');

  /// Plays the dewdrop preset without awaiting the platform call.
  void dewdrop() => _presets.playSync('dewdrop');

  /// Plays the dirge preset without awaiting the platform call.
  void dirge() => _presets.playSync('dirge');

  /// Plays the dissolve preset without awaiting the platform call.
  void dissolve() => _presets.playSync('dissolve');

  /// Plays the dog-bark preset without awaiting the platform call.
  void dogBark() => _presets.playSync('dogBark');

  /// Plays the drone preset without awaiting the platform call.
  void drone() => _presets.playSync('drone');

  /// Plays the engine-rev preset without awaiting the platform call.
  void engineRev() => _presets.playSync('engineRev');

  /// Plays the exhale preset without awaiting the platform call.
  void exhale() => _presets.playSync('exhale');

  /// Plays the explosion preset without awaiting the platform call.
  void explosion() => _presets.playSync('explosion');

  /// Plays the fade-out preset without awaiting the platform call.
  void fadeOut() => _presets.playSync('fadeOut');

  /// Plays the fanfare preset without awaiting the platform call.
  void fanfare() => _presets.playSync('fanfare');

  /// Plays the feather preset without awaiting the platform call.
  void feather() => _presets.playSync('feather');

  /// Plays the finale preset without awaiting the platform call.
  void finale() => _presets.playSync('finale');

  /// Plays the finger-drum preset without awaiting the platform call.
  void fingerDrum() => _presets.playSync('fingerDrum');

  /// Plays the firecracker preset without awaiting the platform call.
  void firecracker() => _presets.playSync('firecracker');

  /// Plays the fizz preset without awaiting the platform call.
  void fizz() => _presets.playSync('fizz');

  /// Plays the flare preset without awaiting the platform call.
  void flare() => _presets.playSync('flare');

  /// Plays the flick preset without awaiting the platform call.
  void flick() => _presets.playSync('flick');

  /// Plays the flinch preset without awaiting the platform call.
  void flinch() => _presets.playSync('flinch');

  /// Plays the flourish preset without awaiting the platform call.
  void flourish() => _presets.playSync('flourish');

  /// Plays the flurry preset without awaiting the platform call.
  void flurry() => _presets.playSync('flurry');

  /// Plays the flush preset without awaiting the platform call.
  void flush() => _presets.playSync('flush');

  /// Plays the gallop preset without awaiting the platform call.
  void gallop() => _presets.playSync('gallop');

  /// Plays the gavel preset without awaiting the platform call.
  void gavel() => _presets.playSync('gavel');

  /// Plays the glitch preset without awaiting the platform call.
  void glitch() => _presets.playSync('glitch');

  /// Plays the guitar-strum preset without awaiting the platform call.
  void guitarStrum() => _presets.playSync('guitarStrum');

  /// Plays the hail preset without awaiting the platform call.
  void hail() => _presets.playSync('hail');

  /// Plays the hammer preset without awaiting the platform call.
  void hammer() => _presets.playSync('hammer');

  /// Plays the heartbeat preset without awaiting the platform call.
  void heartbeat() => _presets.playSync('heartbeat');

  /// Plays the herald preset without awaiting the platform call.
  void herald() => _presets.playSync('herald');

  /// Plays the hoof-beat preset without awaiting the platform call.
  void hoofBeat() => _presets.playSync('hoofBeat');

  /// Plays the ignition preset without awaiting the platform call.
  void ignition() => _presets.playSync('ignition');

  /// Plays the impact preset without awaiting the platform call.
  void impact() => _presets.playSync('impact');

  /// Plays the jolt preset without awaiting the platform call.
  void jolt() => _presets.playSync('jolt');

  /// Plays the mechanical-keyboard preset without awaiting the platform call.
  void keyboardMechanical() => _presets.playSync('keyboardMechanical');

  /// Plays the membrane-keyboard preset without awaiting the platform call.
  void keyboardMembrane() => _presets.playSync('keyboardMembrane');

  /// Plays the knell preset without awaiting the platform call.
  void knell() => _presets.playSync('knell');

  /// Plays the knock preset without awaiting the platform call.
  void knock() => _presets.playSync('knock');

  /// Plays the lament preset without awaiting the platform call.
  void lament() => _presets.playSync('lament');

  /// Plays the latch preset without awaiting the platform call.
  void latch() => _presets.playSync('latch');

  /// Plays the lighthouse preset without awaiting the platform call.
  void lighthouse() => _presets.playSync('lighthouse');

  /// Plays the lilt preset without awaiting the platform call.
  void lilt() => _presets.playSync('lilt');

  /// Plays the lock preset without awaiting the platform call.
  void lock() => _presets.playSync('lock');

  /// Plays the lope preset without awaiting the platform call.
  void lope() => _presets.playSync('lope');

  /// Plays the march preset without awaiting the platform call.
  void march() => _presets.playSync('march');

  /// Plays the metronome preset without awaiting the platform call.
  void metronome() => _presets.playSync('metronome');

  /// Plays the murmur preset without awaiting the platform call.
  void murmur() => _presets.playSync('murmur');

  /// Plays the nudge preset without awaiting the platform call.
  void nudge() => _presets.playSync('nudge');

  /// Plays the passing-car preset without awaiting the platform call.
  void passingCar() => _presets.playSync('passingCar');

  /// Plays the patter preset without awaiting the platform call.
  void patter() => _presets.playSync('patter');

  /// Plays the peal preset without awaiting the platform call.
  void peal() => _presets.playSync('peal');

  /// Plays the peck preset without awaiting the platform call.
  void peck() => _presets.playSync('peck');

  /// Plays the pendulum preset without awaiting the platform call.
  void pendulum() => _presets.playSync('pendulum');

  /// Plays the ping preset without awaiting the platform call.
  void ping() => _presets.playSync('ping');

  /// Plays the pip preset without awaiting the platform call.
  void pip() => _presets.playSync('pip');

  /// Plays the piston preset without awaiting the platform call.
  void piston() => _presets.playSync('piston');

  /// Plays the plink preset without awaiting the platform call.
  void plink() => _presets.playSync('plink');

  /// Plays the plummet preset without awaiting the platform call.
  void plummet() => _presets.playSync('plummet');

  /// Plays the plunk preset without awaiting the platform call.
  void plunk() => _presets.playSync('plunk');

  /// Plays the poke preset without awaiting the platform call.
  void poke() => _presets.playSync('poke');

  /// Plays the pound preset without awaiting the platform call.
  void pound() => _presets.playSync('pound');

  /// Plays the power-down preset without awaiting the platform call.
  void powerDown() => _presets.playSync('powerDown');

  /// Plays the propel preset without awaiting the platform call.
  void propel() => _presets.playSync('propel');

  /// Plays the pulse preset without awaiting the platform call.
  void pulse() => _presets.playSync('pulse');

  /// Plays the pummel preset without awaiting the platform call.
  void pummel() => _presets.playSync('pummel');

  /// Plays the push preset without awaiting the platform call.
  void push() => _presets.playSync('push');

  /// Plays the radar preset without awaiting the platform call.
  void radar() => _presets.playSync('radar');

  /// Plays the rain preset without awaiting the platform call.
  void rain() => _presets.playSync('rain');

  /// Plays the ramp preset without awaiting the platform call.
  void ramp() => _presets.playSync('ramp');

  /// Plays the rap preset without awaiting the platform call.
  void rap() => _presets.playSync('rap');

  /// Plays the ratchet preset without awaiting the platform call.
  void ratchet() => _presets.playSync('ratchet');

  /// Plays the rebound preset without awaiting the platform call.
  void rebound() => _presets.playSync('rebound');

  /// Plays the ripple preset without awaiting the platform call.
  void ripple() => _presets.playSync('ripple');

  /// Plays the rivet preset without awaiting the platform call.
  void rivet() => _presets.playSync('rivet');

  /// Plays the rustle preset without awaiting the platform call.
  void rustle() => _presets.playSync('rustle');

  /// Plays the shockwave preset without awaiting the platform call.
  void shockwave() => _presets.playSync('shockwave');

  /// Plays the snap preset without awaiting the platform call.
  void snap() => _presets.playSync('snap');

  /// Plays the sonar preset without awaiting the platform call.
  void sonar() => _presets.playSync('sonar');

  /// Plays the spark preset without awaiting the platform call.
  void spark() => _presets.playSync('spark');

  /// Plays the spin preset without awaiting the platform call.
  void spin() => _presets.playSync('spin');

  /// Plays the stagger preset without awaiting the platform call.
  void stagger() => _presets.playSync('stagger');

  /// Plays the stamp preset without awaiting the platform call.
  void stamp() => _presets.playSync('stamp');

  /// Plays the stampede preset without awaiting the platform call.
  void stampede() => _presets.playSync('stampede');

  /// Plays the stomp preset without awaiting the platform call.
  void stomp() => _presets.playSync('stomp');

  /// Plays the stone-skip preset without awaiting the platform call.
  void stoneSkip() => _presets.playSync('stoneSkip');

  /// Plays the strike preset without awaiting the platform call.
  void strike() => _presets.playSync('strike');

  /// Plays the summon preset without awaiting the platform call.
  void summon() => _presets.playSync('summon');

  /// Plays the surge preset without awaiting the platform call.
  void surge() => _presets.playSync('surge');

  /// Plays the sway preset without awaiting the platform call.
  void sway() => _presets.playSync('sway');

  /// Plays the sweep preset without awaiting the platform call.
  void sweep() => _presets.playSync('sweep');

  /// Plays the swell preset without awaiting the platform call.
  void swell() => _presets.playSync('swell');

  /// Plays the syncopate preset without awaiting the platform call.
  void syncopate() => _presets.playSync('syncopate');

  /// Plays the throb preset without awaiting the platform call.
  void throb() => _presets.playSync('throb');

  /// Plays the thud preset without awaiting the platform call.
  void thud() => _presets.playSync('thud');

  /// Plays the thump preset without awaiting the platform call.
  void thump() => _presets.playSync('thump');

  /// Plays the thunder preset without awaiting the platform call.
  void thunder() => _presets.playSync('thunder');

  /// Plays the thunder-roll preset without awaiting the platform call.
  void thunderRoll() => _presets.playSync('thunderRoll');

  /// Plays the tick-tock preset without awaiting the platform call.
  void tickTock() => _presets.playSync('tickTock');

  /// Plays the tidal-surge preset without awaiting the platform call.
  void tidalSurge() => _presets.playSync('tidalSurge');

  /// Plays the tide-swell preset without awaiting the platform call.
  void tideSwell() => _presets.playSync('tideSwell');

  /// Plays the tremor preset without awaiting the platform call.
  void tremor() => _presets.playSync('tremor');

  /// Plays the trigger preset without awaiting the platform call.
  void trigger() => _presets.playSync('trigger');

  /// Plays the triumph preset without awaiting the platform call.
  void triumph() => _presets.playSync('triumph');

  /// Plays the trumpet preset without awaiting the platform call.
  void trumpet() => _presets.playSync('trumpet');

  /// Plays the typewriter preset without awaiting the platform call.
  void typewriter() => _presets.playSync('typewriter');

  /// Plays the unfurl preset without awaiting the platform call.
  void unfurl() => _presets.playSync('unfurl');

  /// Plays the vortex preset without awaiting the platform call.
  void vortex() => _presets.playSync('vortex');

  /// Plays the wane preset without awaiting the platform call.
  void wane() => _presets.playSync('wane');

  /// Plays the war-drum preset without awaiting the platform call.
  void warDrum() => _presets.playSync('warDrum');

  /// Plays the waterfall preset without awaiting the platform call.
  void waterfall() => _presets.playSync('waterfall');

  /// Plays the wave preset without awaiting the platform call.
  void wave() => _presets.playSync('wave');

  /// Plays the wisp preset without awaiting the platform call.
  void wisp() => _presets.playSync('wisp');

  /// Plays the wobble preset without awaiting the platform call.
  void wobble() => _presets.playSync('wobble');

  /// Plays the woodpecker preset without awaiting the platform call.
  void woodpecker() => _presets.playSync('woodpecker');

  /// Plays the zipper preset without awaiting the platform call.
  void zipper() => _presets.playSync('zipper');
}
