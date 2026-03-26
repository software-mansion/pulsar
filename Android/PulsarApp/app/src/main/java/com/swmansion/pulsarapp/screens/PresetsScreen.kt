package com.swmansion.pulsarapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.swmansion.pulsar.Pulsar

data class PresetItem(
    val name: String,
    val action: () -> Unit
)

@Composable
fun PresetsScreen(pulsar: Pulsar?) {
    val presets = androidx.compose.runtime.remember {
        listOf(
// CODEGEN_BEGIN_{example_app_preset_list}
            PresetItem("Afterglow") { pulsar?.getPresets()?.afterglow() },
            PresetItem("Aftershock") { pulsar?.getPresets()?.aftershock() },
            PresetItem("Alarm") { pulsar?.getPresets()?.alarm() },
            PresetItem("Anvil") { pulsar?.getPresets()?.anvil() },
            PresetItem("Applause") { pulsar?.getPresets()?.applause() },
            PresetItem("Ascent") { pulsar?.getPresets()?.ascent() },
            PresetItem("BalloonPop") { pulsar?.getPresets()?.balloonPop() },
            PresetItem("Barrage") { pulsar?.getPresets()?.barrage() },
            PresetItem("BassDrop") { pulsar?.getPresets()?.bassDrop() },
            PresetItem("Batter") { pulsar?.getPresets()?.batter() },
            PresetItem("BellToll") { pulsar?.getPresets()?.bellToll() },
            PresetItem("Blip") { pulsar?.getPresets()?.blip() },
            PresetItem("Bloom") { pulsar?.getPresets()?.bloom() },
            PresetItem("Bongo") { pulsar?.getPresets()?.bongo() },
            PresetItem("Boulder") { pulsar?.getPresets()?.boulder() },
            PresetItem("BreakingWave") { pulsar?.getPresets()?.breakingWave() },
            PresetItem("Breath") { pulsar?.getPresets()?.breath() },
            PresetItem("Breathing") { pulsar?.getPresets()?.breathing() },
            PresetItem("Buildup") { pulsar?.getPresets()?.buildup() },
            PresetItem("Burst") { pulsar?.getPresets()?.burst() },
            PresetItem("Buzz") { pulsar?.getPresets()?.buzz() },
            PresetItem("Cadence") { pulsar?.getPresets()?.cadence() },
            PresetItem("CameraShutter") { pulsar?.getPresets()?.cameraShutter() },
            PresetItem("Canter") { pulsar?.getPresets()?.canter() },
            PresetItem("Cascade") { pulsar?.getPresets()?.cascade() },
            PresetItem("Castanets") { pulsar?.getPresets()?.castanets() },
            PresetItem("CatPaw") { pulsar?.getPresets()?.catPaw() },
            PresetItem("Charge") { pulsar?.getPresets()?.charge() },
            PresetItem("Chime") { pulsar?.getPresets()?.chime() },
            PresetItem("Chip") { pulsar?.getPresets()?.chip() },
            PresetItem("Chirp") { pulsar?.getPresets()?.chirp() },
            PresetItem("Clamor") { pulsar?.getPresets()?.clamor() },
            PresetItem("Clasp") { pulsar?.getPresets()?.clasp() },
            PresetItem("Cleave") { pulsar?.getPresets()?.cleave() },
            PresetItem("Coil") { pulsar?.getPresets()?.coil() },
            PresetItem("CoinDrop") { pulsar?.getPresets()?.coinDrop() },
            PresetItem("CombinationLock") { pulsar?.getPresets()?.combinationLock() },
            PresetItem("Crescendo") { pulsar?.getPresets()?.crescendo() },
            PresetItem("Dewdrop") { pulsar?.getPresets()?.dewdrop() },
            PresetItem("Dirge") { pulsar?.getPresets()?.dirge() },
            PresetItem("Dissolve") { pulsar?.getPresets()?.dissolve() },
            PresetItem("DogBark") { pulsar?.getPresets()?.dogBark() },
            PresetItem("Drone") { pulsar?.getPresets()?.drone() },
            PresetItem("EngineRev") { pulsar?.getPresets()?.engineRev() },
            PresetItem("Exhale") { pulsar?.getPresets()?.exhale() },
            PresetItem("Explosion") { pulsar?.getPresets()?.explosion() },
            PresetItem("FadeOut") { pulsar?.getPresets()?.fadeOut() },
            PresetItem("Fanfare") { pulsar?.getPresets()?.fanfare() },
            PresetItem("Feather") { pulsar?.getPresets()?.feather() },
            PresetItem("Finale") { pulsar?.getPresets()?.finale() },
            PresetItem("FingerDrum") { pulsar?.getPresets()?.fingerDrum() },
            PresetItem("Firecracker") { pulsar?.getPresets()?.firecracker() },
            PresetItem("Fizz") { pulsar?.getPresets()?.fizz() },
            PresetItem("Flare") { pulsar?.getPresets()?.flare() },
            PresetItem("Flick") { pulsar?.getPresets()?.flick() },
            PresetItem("Flinch") { pulsar?.getPresets()?.flinch() },
            PresetItem("Flourish") { pulsar?.getPresets()?.flourish() },
            PresetItem("Flurry") { pulsar?.getPresets()?.flurry() },
            PresetItem("Flush") { pulsar?.getPresets()?.flush() },
            PresetItem("Gallop") { pulsar?.getPresets()?.gallop() },
            PresetItem("Gavel") { pulsar?.getPresets()?.gavel() },
            PresetItem("Glitch") { pulsar?.getPresets()?.glitch() },
            PresetItem("GuitarStrum") { pulsar?.getPresets()?.guitarStrum() },
            PresetItem("Hail") { pulsar?.getPresets()?.hail() },
            PresetItem("Hammer") { pulsar?.getPresets()?.hammer() },
            PresetItem("Heartbeat") { pulsar?.getPresets()?.heartbeat() },
            PresetItem("Herald") { pulsar?.getPresets()?.herald() },
            PresetItem("HoofBeat") { pulsar?.getPresets()?.hoofBeat() },
            PresetItem("Ignition") { pulsar?.getPresets()?.ignition() },
            PresetItem("Impact") { pulsar?.getPresets()?.impact() },
            PresetItem("Jolt") { pulsar?.getPresets()?.jolt() },
            PresetItem("KeyboardMechanical") { pulsar?.getPresets()?.keyboardMechanical() },
            PresetItem("KeyboardMembrane") { pulsar?.getPresets()?.keyboardMembrane() },
            PresetItem("Knell") { pulsar?.getPresets()?.knell() },
            PresetItem("Knock") { pulsar?.getPresets()?.knock() },
            PresetItem("Lament") { pulsar?.getPresets()?.lament() },
            PresetItem("Latch") { pulsar?.getPresets()?.latch() },
            PresetItem("Lighthouse") { pulsar?.getPresets()?.lighthouse() },
            PresetItem("Lilt") { pulsar?.getPresets()?.lilt() },
            PresetItem("Lock") { pulsar?.getPresets()?.lock() },
            PresetItem("Lope") { pulsar?.getPresets()?.lope() },
            PresetItem("March") { pulsar?.getPresets()?.march() },
            PresetItem("Metronome") { pulsar?.getPresets()?.metronome() },
            PresetItem("Murmur") { pulsar?.getPresets()?.murmur() },
            PresetItem("Nudge") { pulsar?.getPresets()?.nudge() },
            PresetItem("PassingCar") { pulsar?.getPresets()?.passingCar() },
            PresetItem("Patter") { pulsar?.getPresets()?.patter() },
            PresetItem("Peal") { pulsar?.getPresets()?.peal() },
            PresetItem("Peck") { pulsar?.getPresets()?.peck() },
            PresetItem("Pendulum") { pulsar?.getPresets()?.pendulum() },
            PresetItem("Ping") { pulsar?.getPresets()?.ping() },
            PresetItem("Pip") { pulsar?.getPresets()?.pip() },
            PresetItem("Piston") { pulsar?.getPresets()?.piston() },
            PresetItem("Plink") { pulsar?.getPresets()?.plink() },
            PresetItem("Plummet") { pulsar?.getPresets()?.plummet() },
            PresetItem("Plunk") { pulsar?.getPresets()?.plunk() },
            PresetItem("Poke") { pulsar?.getPresets()?.poke() },
            PresetItem("Pound") { pulsar?.getPresets()?.pound() },
            PresetItem("PowerDown") { pulsar?.getPresets()?.powerDown() },
            PresetItem("Propel") { pulsar?.getPresets()?.propel() },
            PresetItem("Pulse") { pulsar?.getPresets()?.pulse() },
            PresetItem("Pummel") { pulsar?.getPresets()?.pummel() },
            PresetItem("Push") { pulsar?.getPresets()?.push() },
            PresetItem("Radar") { pulsar?.getPresets()?.radar() },
            PresetItem("Rain") { pulsar?.getPresets()?.rain() },
            PresetItem("Ramp") { pulsar?.getPresets()?.ramp() },
            PresetItem("Rap") { pulsar?.getPresets()?.rap() },
            PresetItem("Ratchet") { pulsar?.getPresets()?.ratchet() },
            PresetItem("Rebound") { pulsar?.getPresets()?.rebound() },
            PresetItem("Ripple") { pulsar?.getPresets()?.ripple() },
            PresetItem("Rivet") { pulsar?.getPresets()?.rivet() },
            PresetItem("Rustle") { pulsar?.getPresets()?.rustle() },
            PresetItem("Shockwave") { pulsar?.getPresets()?.shockwave() },
            PresetItem("Snap") { pulsar?.getPresets()?.snap() },
            PresetItem("Sonar") { pulsar?.getPresets()?.sonar() },
            PresetItem("Spark") { pulsar?.getPresets()?.spark() },
            PresetItem("Spin") { pulsar?.getPresets()?.spin() },
            PresetItem("Stagger") { pulsar?.getPresets()?.stagger() },
            PresetItem("Stamp") { pulsar?.getPresets()?.stamp() },
            PresetItem("Stampede") { pulsar?.getPresets()?.stampede() },
            PresetItem("Stomp") { pulsar?.getPresets()?.stomp() },
            PresetItem("StoneSkip") { pulsar?.getPresets()?.stoneSkip() },
            PresetItem("Strike") { pulsar?.getPresets()?.strike() },
            PresetItem("Summon") { pulsar?.getPresets()?.summon() },
            PresetItem("Surge") { pulsar?.getPresets()?.surge() },
            PresetItem("Sway") { pulsar?.getPresets()?.sway() },
            PresetItem("Sweep") { pulsar?.getPresets()?.sweep() },
            PresetItem("Swell") { pulsar?.getPresets()?.swell() },
            PresetItem("Syncopate") { pulsar?.getPresets()?.syncopate() },
            PresetItem("Throb") { pulsar?.getPresets()?.throb() },
            PresetItem("Thud") { pulsar?.getPresets()?.thud() },
            PresetItem("Thump") { pulsar?.getPresets()?.thump() },
            PresetItem("Thunder") { pulsar?.getPresets()?.thunder() },
            PresetItem("ThunderRoll") { pulsar?.getPresets()?.thunderRoll() },
            PresetItem("TickTock") { pulsar?.getPresets()?.tickTock() },
            PresetItem("TidalSurge") { pulsar?.getPresets()?.tidalSurge() },
            PresetItem("TideSwell") { pulsar?.getPresets()?.tideSwell() },
            PresetItem("Tremor") { pulsar?.getPresets()?.tremor() },
            PresetItem("Trigger") { pulsar?.getPresets()?.trigger() },
            PresetItem("Triumph") { pulsar?.getPresets()?.triumph() },
            PresetItem("Trumpet") { pulsar?.getPresets()?.trumpet() },
            PresetItem("Typewriter") { pulsar?.getPresets()?.typewriter() },
            PresetItem("Unfurl") { pulsar?.getPresets()?.unfurl() },
            PresetItem("Vortex") { pulsar?.getPresets()?.vortex() },
            PresetItem("Wane") { pulsar?.getPresets()?.wane() },
            PresetItem("WarDrum") { pulsar?.getPresets()?.warDrum() },
            PresetItem("Waterfall") { pulsar?.getPresets()?.waterfall() },
            PresetItem("Wave") { pulsar?.getPresets()?.wave() },
            PresetItem("Wisp") { pulsar?.getPresets()?.wisp() },
            PresetItem("Wobble") { pulsar?.getPresets()?.wobble() },
            PresetItem("Woodpecker") { pulsar?.getPresets()?.woodpecker() },
            PresetItem("Zipper") { pulsar?.getPresets()?.zipper() },
// CODEGEN_END_{example_app_preset_list}
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            "Haptics Presets",
            fontSize = 24.sp,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)
        ) {
            items(presets) { preset ->
                PresetItemRow(preset)
            }
        }
    }
}

@Composable
private fun PresetItemRow(preset: PresetItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            preset.name,
            modifier = Modifier
                .weight(1f)
                .padding(start = 16.dp),
            fontSize = 16.sp
        )
        Button(
            onClick = preset.action,
            modifier = Modifier.padding(end = 8.dp)
        ) {
            Text("Play")
        }
    }
}

